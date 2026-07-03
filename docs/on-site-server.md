# On‑site server (Tier C) — design spec

## Why
The app is cloud‑hosted (Vercel serverless + MongoDB Atlas), so with no internet the browser can't reach the server *or* the database. The PWA + outbox we built lets staff keep **encoding** offline and sync later, but **reads are limited to cached data** and the whole thing still depends on eventually reaching the cloud.

An **on‑site server** removes that dependency: the app and a database run on a small computer **inside the clinic**, and staff connect to it over the clinic's **local Wi‑Fi/LAN**. That works with **zero internet** because nothing leaves the building. Whenever internet is available, the local data **replicates to the cloud** for backup and (if there are multiple sites) aggregation. This is the durable answer for **long/all‑day outages**.

> Key advantage we already have: our writes are **idempotent** — the client generates the `_id` and inserts are `upsert`‑by‑`_id`. That makes "replay local writes up to the cloud" safe (no duplicates), which is the hard part of any sync design.

## Topology
```
        Clinic building (works with NO internet)
   ┌───────────────────────────────────────────────┐
   │  Staff devices (browsers / installed PWA)      │
   │      │  Wi‑Fi / LAN (http(s)://lab.local)      │
   │      ▼                                          │
   │  On‑site box (mini‑PC / NUC)                    │
   │   • SvelteKit app (Node)                        │
   │   • MongoDB (local)                             │
   │   • Sync worker  ───────── internet? ──────────┐│
   └───────────────────────────────────────────────┘│
                                                      ▼
                                          MongoDB Atlas (cloud)
                                     backup + multi‑site aggregation
```

## Components
| Component | Choice | Notes |
|---|---|---|
| App runtime | **SvelteKit + `@sveltejs/adapter-node`** | Build a Node server for the box; keep `adapter-vercel` for the cloud copy (or drop cloud hosting entirely). |
| Process mgr | **PM2** or a `systemd` unit | Auto‑start on boot, restart on crash. |
| Database | **MongoDB Community**, run as a **single‑node replica set** | Replica‑set mode is required to get **change streams / oplog**, which the sync worker tails. Same collections/schema as Atlas (string `_id`s, Meteor‑style auth all work unchanged). |
| Sync worker | Small Node service (can live in this repo) | Tails local change streams → upserts to Atlas when online; optionally pulls cloud changes down. |
| Reverse proxy / TLS | **Caddy** (auto local certs) or nginx | Serves `https://lab.local`; PWA/service worker needs a secure context (HTTPS or `localhost`). |
| Local DNS | **mDNS** (`lab.local`) or a static IP | So staff use a stable address, not an IP that changes. |

## The sync design (the crux)
Two deployment shapes — pick based on **single clinic vs. multiple clinics**:

**A. Single clinic (recommended, simplest):** the **local DB is the source of truth**; the cloud is a **backup/mirror**.
- Sync worker tails the local oplog (change streams). When online, it **upserts changed docs to Atlas by `_id`** and records a high‑water mark (last synced `updated`/oplog ts). Idempotent upserts mean re‑runs never duplicate.
- Nothing needs to flow cloud→local in this shape (no other writer). Simple, robust, no conflicts.

**B. Multiple clinics / cloud‑also‑writable:** **bidirectional** sync.
- Push local→cloud as above. **Pull cloud→local**: tail Atlas change streams (when online) and upsert into local by `_id`.
- Conflicts (same doc edited at two sites) resolved by an `updated` timestamp (last‑write‑wins) — the same field we already stamp. Add a per‑site prefix to any *server‑minted* sequences (e.g., `caseNumber` → `RXS‑00042`) so two offline sites don't collide. Records are mostly append‑only, so real conflicts are rare.

Avoid: MongoDB `mongosync` (one‑way, cluster‑migration tool, heavy) and trying to add the local node to the Atlas replica set (not possible with managed Atlas). A change‑streams worker is the right fit for an intermittent link.

## Code changes in this repo
Small and mostly additive:
1. **Add `@sveltejs/adapter-node`** and a build target for the box (`svelte.config.js` can switch adapter by an env flag; keep Vercel for cloud).
2. **`DATABASE_URL`** on the box points at the local replica set (`mongodb://127.0.0.1:27017/lab?replicaSet=rs0`). `src/lib/server/mongo.ts` already reads `DATABASE_URL` — no code change.
3. **Health endpoint** `/api/health` (DB ping + last‑sync timestamp) for monitoring and a small "last synced to cloud" indicator in the UI.
4. **Sync worker** (`/sync-worker/`, its own Node entry): connects to local + Atlas, tails change streams, upserts, tracks a `sync_state` doc, retries when the link drops. Runs under PM2/systemd alongside the app.
5. Keep the **PWA/outbox** — it still covers device‑level hiccups (box reboot, Wi‑Fi drop) and lets a tech keep working if the box is briefly down.

## Hardware & OS
- **Box:** Intel N100 mini‑PC (≈8–16 GB RAM, 256–512 GB SSD) — ample for one clinic; ~₱6–12k / $120–220. (Raspberry Pi 5 works but SSD + a decent case/power matter; mini‑PC is sturdier for a clinic.)
- **OS:** Ubuntu Server LTS.
- **UPS:** small uninterruptible power supply — brownouts are the #1 real‑world failure; also protects Mongo from unclean shutdowns.

## Security
- **Disk encryption** (LUKS) on the box — it holds all patient data locally.
- **HTTPS on the LAN** via Caddy (secure context for the service worker + no plaintext creds on Wi‑Fi).
- **Wi‑Fi**: WPA2/3, separate SSID for the lab, not shared with guests.
- **Backups:** the cloud mirror *is* an off‑site backup; also a nightly local `mongodump` to a second disk. Test restores.
- Atlas credentials for the sync worker stored on the box only (env / secrets file, not in the repo).

## Ops
- **Auto‑start** (systemd/PM2), **auto‑restart** on crash, boot‑order so Mongo is up before the app.
- **Updates:** `git pull` + `npm ci` + `npm run build` + restart, ideally via a one‑command script or a small CI artifact; do it during downtime.
- **Monitoring:** the health endpoint + a visible "Last synced to cloud: …" so staff know replication is current; alert if it falls behind when internet is up.

## Rollout phases
1. **Pilot on one box, single‑clinic (shape A).** adapter‑node build, local replica‑set Mongo, Caddy + `lab.local`, seed from an Atlas dump. Staff use it on the LAN.
2. **Add the push sync worker** (local→Atlas). Verify the cloud mirror matches; confirm idempotent replays.
3. **Harden ops** — UPS, disk encryption, backups, auto‑start, update script, monitoring.
4. **(If needed) multi‑site (shape B)** — add cloud→local pull + site‑prefixed case numbers + last‑write‑wins.

## Rough cost
- Hardware: mini‑PC + UPS ≈ **$150–300** one‑time per site.
- Software: open source (Mongo Community, Caddy, PM2) — **$0**.
- Cloud: keep a small Atlas tier for backup/aggregation (existing).
- Effort: pilot (phase 1–2) ≈ a few days of setup + the small repo changes above.

## Risks & mitigations
- **Box dies / disk fails** → cloud mirror + nightly local dump; keep a spare imaged box.
- **Power loss mid‑write** → UPS + replica‑set journaling.
- **Local↔cloud divergence** → single‑writer (shape A) avoids it; shape B uses `updated` LWW + site‑prefixed sequences.
- **Nobody to maintain it** → this is the real risk for a small clinic; needs a designated person or a managed‑IT arrangement. If that's not feasible, stay on cloud + PWA and invest in **connectivity** (cellular failover / Starlink) instead.

## Decisions needed before building
1. **One clinic or several?** (Picks shape A vs B — big difference in effort.)
2. **Who operates the box** (updates, backups, power)?
3. **Keep the cloud app too**, or make the on‑site box the only server?
4. Budget/timeline for the pilot.
