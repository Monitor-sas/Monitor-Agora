import type { HeartbeatTelemetry } from "../../types";

const heartbeats = new Map<string, HeartbeatTelemetry>();

export function saveHeartbeat(telemetry: HeartbeatTelemetry): void {
	heartbeats.set(telemetry.service, telemetry);
}

export function getHeartbeat(service: string): HeartbeatTelemetry | undefined {
	return heartbeats.get(service);
}
