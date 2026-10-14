export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type IncidentStatus =
  | 'TRIAGE'
  | 'INVESTIGATING'
  | 'CONTAINED'
  | 'RESOLVED'
  | 'CLOSED';

export interface MitreTechnique {
  id: string; // e.g. "T1078.001"
  name: string; // e.g. "Valid Accounts: Cloud Accounts"
  tactic: string; // e.g. "Initial Access"
  url?: string;
}

export interface Asset {
  id: string;
  hostname: string;
  ipAddress: string;
  assetType: 'server' | 'database' | 'workstation' | 'iam-role' | 'api-gateway';
  riskScore: number; // 0 to 100
  isIsolated: boolean;
  os?: string;
  region?: string;
}

export interface IncidentEvent {
  id: string;
  timestamp: string; // ISO 8601
  source: 'crowdstrike' | 'aws-guardduty' | 'suricata' | 'auth0' | 'analyst';
  message: string;
  severity?: Severity;
  rawTelemetry?: Record<string, unknown>;
}

export interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  actionRequired?: 'isolate-host' | 'revoke-tokens' | 'block-ip' | 'memory-dump';
}

export interface IncidentPlaybook {
  id: string;
  name: string;
  category: string;
  steps: PlaybookStep[];
}

export interface Incident {
  id: string; // e.g. "INC-2026-8841"
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  assignee: string; // e.g. "Alex Rivera (Lead SOC)"
  createdAt: string; // ISO 8601
  updatedAt: string;
  slaMinutes: number; // e.g. 60 for CRITICAL
  slaDeadline: string; // ISO 8601
  mitreTechniques: MitreTechnique[];
  affectedAssets: Asset[];
  timeline: IncidentEvent[];
  playbook: IncidentPlaybook;
}

export interface ShiftHandoverReport {
  generatedAt: string;
  analyst: string;
  totalActiveIncidents: number;
  openCriticals: Incident[];
  openHighs: Incident[];
  containedAssetsCount: number;
  breachWarningsCount: number;
  markdownContent: string;
}
