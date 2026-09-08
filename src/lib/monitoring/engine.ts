import type {
	HealthCheck,
	HealthCheckResult,
	MonitoringReport,
	OverallStatus,
	ServiceConfig,
	ServiceStatus,
	ServiceStatusResult,
} from "../../types";
import { executeFrontendCheck } from "./checks/frontend.js";
import { executeHttpCheck } from "./checks/http.js";

async function executeCheck(serviceId: string, check: HealthCheck): Promise<HealthCheckResult> {
	switch (check.type) {
		case "http":
			return executeHttpCheck(serviceId, check);
		case "frontend":
			return executeFrontendCheck(serviceId, check);
		default: {
			const _exhaustive: never = check;
			return {
				serviceId,
				checkType: "unknown",
				status: "unknown",
				error: `Unsupported check type: ${String(_exhaustive)}`,
				checkedAt: new Date().toISOString(),
			};
		}
	}
}

async function checkService(service: ServiceConfig): Promise<ServiceStatusResult> {
	const results = await Promise.allSettled(
		service.checks.map((check) => executeCheck(service.id, check)),
	);

	const checks: HealthCheckResult[] = results.map((result, index) => {
		if (result.status === "fulfilled") {
			return result.value;
		}
		return {
			serviceId: service.id,
			checkType: service.checks[index].type,
			status: "unknown" as ServiceStatus,
			error: result.reason instanceof Error ? result.reason.message : "Unexpected error",
			checkedAt: new Date().toISOString(),
		};
	});

	const status = aggregateCheckResults(checks);
	const avgResponseTime = calculateAverageResponseTime(checks);
	const details = collectCheckDetails(checks);

	return {
		id: service.id,
		name: service.name,
		group: service.group,
		description: service.description,
		status,
		responseTimeMs: avgResponseTime,
		details,
		checks,
	};
}

function collectCheckDetails(checks: HealthCheckResult[]): Record<string, unknown> | undefined {
	for (const check of checks) {
		if (check.details && Object.keys(check.details).length > 0) {
			return check.details;
		}
	}
	return undefined;
}

function aggregateCheckResults(checks: HealthCheckResult[]): ServiceStatus {
	if (checks.length === 0) {
		return "unknown";
	}

	const statuses = checks.map((c) => c.status);

	if (statuses.every((s) => s === "operational")) {
		return "operational";
	}
	if (statuses.every((s) => s === "major_outage")) {
		return "major_outage";
	}
	if (statuses.some((s) => s === "major_outage")) {
		return "partial_outage";
	}
	if (statuses.some((s) => s === "degraded")) {
		return "degraded";
	}
	if (statuses.some((s) => s === "unknown")) {
		return "unknown";
	}

	return "unknown";
}

function calculateAverageResponseTime(checks: HealthCheckResult[]): number | undefined {
	const times = checks.map((c) => c.responseTimeMs).filter((t): t is number => t !== undefined);

	if (times.length === 0) {
		return undefined;
	}

	return Math.round(times.reduce((sum, t) => sum + t, 0) / times.length);
}

export function calculateOverallStatus(services: ServiceStatusResult[]): OverallStatus {
	if (services.length === 0) {
		return "unknown";
	}

	const statuses = services.map((s) => s.status);

	if (statuses.every((s) => s === "operational")) {
		return "operational";
	}
	if (statuses.every((s) => s === "major_outage")) {
		return "major_outage";
	}
	if (statuses.some((s) => s === "major_outage")) {
		return "partial_outage";
	}
	if (statuses.some((s) => s === "degraded" || s === "partial_outage")) {
		return "degraded";
	}

	return "unknown";
}

export async function runMonitoring(services: ServiceConfig[]): Promise<MonitoringReport> {
	const checkedAt = new Date().toISOString();

	const results = await Promise.allSettled(services.map((s) => checkService(s)));

	const serviceResults: ServiceStatusResult[] = results.map((result, index) => {
		if (result.status === "fulfilled") {
			return result.value;
		}
		const service = services[index];
		return {
			id: service.id,
			name: service.name,
			group: service.group,
			description: service.description,
			status: "unknown" as ServiceStatus,
			checks: [],
		};
	});

	const status = calculateOverallStatus(serviceResults);

	return {
		status,
		checkedAt,
		services: serviceResults,
	};
}
