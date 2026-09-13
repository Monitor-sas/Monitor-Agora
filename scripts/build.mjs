import { astroSync, DEV_PORT, killByPort, removeVercelOutput } from "./lib.mjs";

const looksLikeOutputLock = /EPERM|\.vercel|output/i;

const first = astroSync(["build"]);
if (first.status === 0) {
	process.exit(0);
}

if (!looksLikeOutputLock.test(first.output)) {
	console.error(
		"[build] `astro build` fallo por un motivo distinto al bloqueo de .vercel/output; no se toca ningun servidor local.",
	);
	process.exit(first.status ?? 1);
}

console.error(
	`[build] Detectado bloqueo de .vercel/output (suele ser un dev server corriendo). Se detiene el listener del puerto :${DEV_PORT} y se reintenta...`,
);
killByPort(DEV_PORT);
const cleaned = removeVercelOutput();
if (cleaned) {
	console.error("[build] .vercel/output eliminado.");
}

const second = astroSync(["build"]);
process.exit(second.status ?? 1);
