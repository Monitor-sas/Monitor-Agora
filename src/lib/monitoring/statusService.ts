import { getEnabledServices } from "../../config/services";
import type { MonitoringReport } from "../../types";
import { getMonitoringRepository } from "../persistence/repository";
import { runMonitoring } from "./engine";

const CACHE_TTL_MS = 30_000;

let cachedReport: { report: MonitoringReport; expiresAt: number } | null = null;

export async function getCurrentStatus(): Promise<MonitoringReport> {
	const now = Date.now();
	if (cachedReport && cachedReport.expiresAt > now) {
		return cachedReport.report;
	}

	const services = getEnabledServices();
	const report = await runMonitoring(services);

	await getMonitoringRepository().saveReport(report);
	cachedReport = { report, expiresAt: now + CACHE_TTL_MS };
	return report;
}
