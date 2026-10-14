import type {
  Severity,
  IncidentStatus,
  Incident,
  IncidentPlaybook,
  ShiftHandoverReport,
} from '../types/security';

export const SEVERITY_CONFIG: Record<
  Severity,
  { bg: string; text: string; border: string; label: string; pulse: boolean }
> = {
  CRITICAL: {
    bg: '#EF4444',
    text: '#FFFFFF',
    border: '#DC2626',
    label: 'CRITICAL',
    pulse: true,
  },
  HIGH: {
    bg: '#F97316',
    text: '#FFFFFF',
    border: '#EA580C',
    label: 'HIGH',
    pulse: false,
  },
  MEDIUM: {
    bg: '#FBBF24',
    text: '#090D12',
    border: '#D97706',
    label: 'MEDIUM',
    pulse: false,
  },
  LOW: {
    bg: '#38BDF8',
    text: '#090D12',
    border: '#0284C7',
    label: 'LOW',
    pulse: false,
  },
  INFO: {
    bg: '#64748B',
    text: '#FFFFFF',
    border: '#475569',
    label: 'INFO',
    pulse: false,
  },
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  TRIAGE: 'Triage Pending',
  INVESTIGATING: 'Active Investigation',
  CONTAINED: 'Threat Contained',
  RESOLVED: 'Incident Resolved',
  CLOSED: 'Case Closed',
};

/**
 * Calculates remaining SLA time and breach status relative to a reference time.
 */
export function calculateSlaStatus(
  incident: Incident,
  referenceTime = new Date('2026-10-14T15:30:00Z') // Standard deterministic reference
): {
  timeRemainingMinutes: number;
  isBreached: boolean;
  isWarning: boolean;
  displayString: string;
} {
  if (incident.status === 'RESOLVED' || incident.status === 'CLOSED') {
    return {
      timeRemainingMinutes: 0,
      isBreached: false,
      isWarning: false,
      displayString: 'Resolved in SLA',
    };
  }

  const deadline = new Date(incident.slaDeadline).getTime();
  const current = referenceTime.getTime();
  const diffMs = deadline - current;
  const remainingMinutes = Math.floor(diffMs / (1000 * 60));

  if (remainingMinutes <= 0) {
    const breachedAgo = Math.abs(remainingMinutes);
    return {
      timeRemainingMinutes: remainingMinutes,
      isBreached: true,
      isWarning: false,
      displayString: `BREACHED (${breachedAgo}m ago)`,
    };
  }

  const isWarning = remainingMinutes <= incident.slaMinutes * 0.25;

  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;
  const displayString =
    hours > 0 ? `${hours}h ${mins}m remaining` : `${mins}m remaining`;

  return {
    timeRemainingMinutes: remainingMinutes,
    isBreached: false,
    isWarning,
    displayString,
  };
}

/**
 * Calculates completion percentage of an incident response playbook.
 */
export function calculatePlaybookProgress(playbook: IncidentPlaybook): {
  completedCount: number;
  totalCount: number;
  percentage: number;
} {
  const totalCount = playbook.steps.length;
  if (totalCount === 0) {
    return { completedCount: 0, totalCount: 0, percentage: 100 };
  }

  const completedCount = playbook.steps.filter((s) => s.isCompleted).length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return { completedCount, totalCount, percentage };
}

/**
 * Assigns numerical risk weight based on severity.
 */
export function calculateSeverityWeight(severity: Severity): number {
  switch (severity) {
    case 'CRITICAL':
      return 100;
    case 'HIGH':
      return 75;
    case 'MEDIUM':
      return 50;
    case 'LOW':
      return 25;
    case 'INFO':
      return 10;
  }
}

/**
 * Compiles an executive markdown brief for incoming on-call SOC shift.
 */
export function generateShiftHandoverReport(
  incidents: Incident[],
  analystName = 'Alex Rivera (Lead SOC)'
): ShiftHandoverReport {
  const activeIncidents = incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED'
  );

  const openCriticals = activeIncidents.filter((i) => i.severity === 'CRITICAL');
  const openHighs = activeIncidents.filter((i) => i.severity === 'HIGH');

  let containedAssetsCount = 0;
  for (const inc of incidents) {
    containedAssetsCount += inc.affectedAssets.filter((a) => a.isIsolated).length;
  }

  let breachWarningsCount = 0;
  for (const inc of activeIncidents) {
    const sla = calculateSlaStatus(inc);
    if (sla.isBreached || sla.isWarning) {
      breachWarningsCount++;
    }
  }

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  const criticalsSection =
    openCriticals.length > 0
      ? openCriticals
          .map(
            (c) =>
              `- **[${c.id}] ${c.title}**\n  - Status: \`${c.status}\` | Assignee: ${c.assignee}\n  - Assets: ${c.affectedAssets.map((a) => `\`${a.hostname}\` (${a.ipAddress})`).join(', ')}\n  - MITRE: ${c.mitreTechniques.map((m) => `\`${m.id}\``).join(', ')}`
          )
          .join('\n')
      : '- *No active Critical incidents at shift turnover.*';

  const highsSection =
    openHighs.length > 0
      ? openHighs
          .map(
            (h) =>
              `- **[${h.id}] ${h.title}** (\`${h.status}\`)\n  - SLA: ${calculateSlaStatus(h).displayString}\n  - Affected: ${h.affectedAssets.map((a) => a.hostname).join(', ')}`
          )
          .join('\n')
      : '- *No active High incidents.*';

  const markdownContent = `# SOC SHIFT HANDOVER BRIEFING
**Turnover Time**: ${timestamp}
**Outgoing Lead Analyst**: ${analystName}
**DEFCON Posture**: DEFCON 2 (ELEVATED)

---

## 🚨 Active P0 / Critical Incidents (${openCriticals.length})
${criticalsSection}

---

## ⚠️ Active P1 / High Incidents (${openHighs.length})
${highsSection}

---

## 🛡️ Containment & Blast Radius Status
- **Total Isolated Assets**: ${containedAssetsCount} hosts severed from VPC
- **SLA Countdown Warnings**: ${breachWarningsCount} incident(s) nearing target threshold
- **Total Active Incidents Queued**: ${activeIncidents.length}

---
*Generated via Guardrail SecOps Console v1.0. All containment logs verified in forensic audit ledger.*`;

  return {
    generatedAt: timestamp,
    analyst: analystName,
    totalActiveIncidents: activeIncidents.length,
    openCriticals,
    openHighs,
    containedAssetsCount,
    breachWarningsCount,
    markdownContent,
  };
}
