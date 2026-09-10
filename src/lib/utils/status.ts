import type { OverallStatus, ServiceStatus } from "../../types";

const STATUS_LABELS: Record<ServiceStatus, string> = {
	operational: "Operational",
	degraded: "Degraded Performance",
	partial_outage: "Partial Outage",
	major_outage: "Major Outage",
	unknown: "Status Unknown",
};

const OVERALL_LABELS: Record<OverallStatus, string> = {
	operational: "All systems operational",
	degraded: "Some systems are experiencing degraded performance",
	partial_outage: "Some systems are experiencing an outage",
	major_outage: "Major system outage",
	unknown: "System status is currently unknown",
};

export function getStatusLabel(status: ServiceStatus): string {
	return STATUS_LABELS[status];
}

export function getOverallStatusLabel(status: OverallStatus): string {
	return OVERALL_LABELS[status];
}

export function formatResponseTime(ms: number | undefined): string {
	if (ms === undefined) {
		return "";
	}
	if (ms < 1000) {
		return `${ms} ms`;
	}
	return `${(ms / 1000).toFixed(1)} s`;
}

export function formatTimestamp(iso: string): string {
	const date = new Date(iso);
	return date.toISOString();
}

export function formatRelativeTime(iso: string): string {
	const diffMs = Date.now() - Date.parse(iso);
	const seconds = Math.floor(diffMs / 1000);

	if (seconds < 0) {
		return "just now";
	}
	if (seconds < 10) {
		return "just now";
	}
	if (seconds < 60) {
		return `${seconds}s ago`;
	}

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) {
		return `${minutes}m ago`;
	}

	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		return `${hours}h ago`;
	}

	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}
