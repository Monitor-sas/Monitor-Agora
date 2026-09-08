import type { HealthCheckResult, MonitoringReport } from "../../types";

export interface MonitoringRepository {
	saveReport(report: MonitoringReport): Promise<void>;
	saveCheckResult(result: HealthCheckResult): Promise<void>;
	getLatestReport(): Promise<MonitoringReport | null>;
}

let cachedReport: MonitoringReport | null = null;

export class InMemoryMonitoringRepository implements MonitoringRepository {
	async saveReport(report: MonitoringReport): Promise<void> {
		cachedReport = report;
	}

	async saveCheckResult(_result: HealthCheckResult): Promise<void> {}

	async getLatestReport(): Promise<MonitoringReport | null> {
		return cachedReport;
	}
}

const repository = new InMemoryMonitoringRepository();

export function getMonitoringRepository(): MonitoringRepository {
	return repository;
}
