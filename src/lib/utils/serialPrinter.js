// @ts-nocheck — navigator.serial has no typings in this project's lib set.
// Pushes raw printer bytes down a serial port with the Web Serial API.
//
// The cashier's Bluetooth receipt printer appears to Windows as a virtual COM
// port, and Chrome/Edge will hand a page that port once the user has picked
// it from the browser's chooser. The grant is remembered per origin, so the
// cashier picks the port once and every later print is a single click, with
// no print dialog. Needs a secure context (https or localhost) and a
// Chromium desktop browser; `serialSupported()` says whether this browser
// qualifies, and the UI hides the button otherwise.
import { browser } from '$app/environment';

/** @type {any} the open port, kept between prints (Bluetooth reconnects are slow) */
let port = null;

export class PrinterError extends Error {
	/** @param {string} code @param {string} message */
	constructor(code, message) {
		super(message);
		this.code = code;
	}
}

export function serialSupported() {
	return browser && 'serial' in navigator && window.isSecureContext;
}

/** Whether a port has already been granted, so a print will not prompt. */
export async function hasPort() {
	if (!serialSupported()) return false;
	const ports = await navigator.serial.getPorts();
	return ports.length > 0;
}

/**
 * Let the user pick (or re-pick) the printer's port. Must be called from a
 * click — the browser only opens its chooser on a user gesture.
 */
export async function choosePort() {
	if (!serialSupported()) throw new PrinterError('UNSUPPORTED', 'This browser cannot talk to a serial printer.');
	await closePort();
	// Drop older grants so the chooser's pick is the only port left.
	for (const old of await navigator.serial.getPorts()) {
		try {
			await old.forget?.();
		} catch {
			/* not supported everywhere; harmless */
		}
	}
	try {
		port = await navigator.serial.requestPort();
	} catch (e) {
		throw new PrinterError('CANCELLED', 'No port was chosen.');
	}
	return port;
}

async function ensurePort() {
	if (port) return port;
	const ports = await navigator.serial.getPorts();
	if (ports.length) {
		port = ports[0];
		return port;
	}
	// requestPort() needs a user gesture; the caller's click still counts as
	// one because nothing slow has happened yet.
	return choosePort();
}

async function closePort() {
	if (!port) return;
	try {
		if (port.readable || port.writable) await port.close();
	} catch {
		/* already closed or gone */
	}
	port = null;
}

/**
 * Send bytes to the printer, prompting for the port the first time.
 * @param {Uint8Array} bytes
 */
export async function printBytes(bytes) {
	if (!serialSupported()) throw new PrinterError('UNSUPPORTED', 'This browser cannot talk to a serial printer.');
	const p = await ensurePort();
	try {
		// `readable` is null until the port is open.
		if (!p.readable) await p.open({ baudRate: 9600 });
	} catch (e) {
		await closePort();
		throw new PrinterError(
			'OPEN_FAILED',
			'Could not open the printer port. Is the printer switched on and paired, and not held by another program?'
		);
	}
	const writer = p.writable.getWriter();
	try {
		// Bluetooth SPP stacks stall on one large write; 256-byte pieces are safe.
		for (let i = 0; i < bytes.length; i += 256) {
			await writer.write(bytes.subarray(i, i + 256));
		}
	} catch (e) {
		writer.releaseLock();
		await closePort();
		throw new PrinterError('WRITE_FAILED', 'The printer stopped responding part-way. Check it and print again.');
	}
	writer.releaseLock();
}
