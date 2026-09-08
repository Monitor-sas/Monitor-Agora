import type { APIRoute } from "astro";
import { getCurrentStatus } from "../../lib/monitoring/index.js";

export const GET: APIRoute = async () => {
	try {
		const report = await getCurrentStatus();

		const payload = {
			status: report.status,
			checkedAt: report.checkedAt,
			services: report.services.map((s) => ({
				id: s.id,
				name: s.name,
				group: s.group,
				status: s.status,
				responseTimeMs: s.responseTimeMs,
				details: s.details,
			})),
		};

		return new Response(JSON.stringify(payload), {
			status: 200,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Cache-Control": "public, max-age=30, s-maxage=30, stale-while-revalidate=60",
			},
		});
	} catch {
		return new Response(
			JSON.stringify({
				status: "unknown",
				checkedAt: new Date().toISOString(),
				error: "Monitoring check failed",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json; charset=utf-8" },
			},
		);
	}
};

export const POST: APIRoute = () => new Response(null, { status: 405, headers: { Allow: "GET" } });
