// One entry point every create/edit form uses instead of a raw fetch.
// Online: POST immediately. Offline / on failure: queue to the outbox and
// return an optimistic success so the user isn't blocked. The client generates
// the _id (via id()) so replays upsert to the same document — no duplicates.
import { get } from 'svelte/store';
import { page } from '$app/stores';
import { id } from '$lib/common/utils';
import { enqueue } from './outbox.js';
import { requestBackgroundSync } from './sync.js';

/**
 * @param {object} opts
 * @param {string} opts.endpoint   POST target, e.g. '/api/admin/record/insert'
 * @param {string} opts.entity     'record' | 'patient' | 'user' | 'settings'
 * @param {object} opts.body       form payload
 * @param {boolean} [opts.isCreate=true]  stamp _id/created/createdBy for new docs
 * @returns {Promise<{ok:boolean, synced:boolean, doc:object, result?:object}>}
 */
export async function saveOrQueue({ endpoint, entity, body, isCreate = true }) {
	const payload = { ...body };

	if (isCreate) {
		if (!payload._id) payload._id = id();
		if (!payload.createdBy) payload.createdBy = get(page)?.data?.user?._id ?? null;
		if (!payload.created) payload.created = new Date().toISOString();
	}

	if (typeof navigator !== 'undefined' && navigator.onLine) {
		try {
			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload)
			});
			if (res.ok) {
				const result = await res.json();
				if (result?.status === 'Success') {
					return { ok: true, synced: true, doc: payload, result };
				}
				// Server reached but rejected (validation/permission) — surface, don't queue.
				return { ok: false, synced: true, doc: payload, result };
			}
			// non-2xx from a reachable server (e.g. 409 conflict) → surface the reason.
			const result = await res.json().catch(() => ({}));
			return { ok: false, synced: true, doc: payload, result };
		} catch (e) {
			// network failure → fall through to queue
		}
	}

	await enqueue({
		queueId: id(),
		endpoint,
		method: 'POST',
		entity,
		docId: payload._id ?? null,
		body: payload
	});
	requestBackgroundSync();
	return { ok: true, synced: false, doc: payload };
}
