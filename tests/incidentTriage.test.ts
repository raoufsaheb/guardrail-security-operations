import { describe, it, expect } from 'vitest';
import {
  calculateSlaStatus,
  calculateSeverityWeight,
  generateShiftHandoverReport,
} from '../src/lib/incidentTriage';
import type { Incident } from '../src/types/security';

describe('Incident Triage Engine', () => {
  const mockIncident: Incident = {
    id: 'INC-TEST-01',
    title: 'Test Ransomware Alarm',
    description: 'High-entropy encryption in progress',
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    assignee: 'Alex Rivera',
    createdAt: '2026-10-14T14:45:00Z',
    updatedAt: '2026-10-14T14:45:00Z',
    slaMinutes: 60,
    slaDeadline: '2026-10-14T15:45:00Z',
    mitreTechniques: [{ id: 'T1486', name: 'Data Encrypted', tactic: 'Impact' }],
    affectedAssets: [
      {
        id: 'ast_1',
        hostname: 'prod-db-01',
        ipAddress: '10.0.0.1',
        assetType: 'database',
        riskScore: 90,
        isIsolated: false,
      },
    ],
    timeline: [],
    playbook: {
      id: 'pb_1',
      name: 'Ransomware Isolation',
      category: 'Malware',
      steps: [],
    },
  };

  it('calculates remaining SLA time and warning state', () => {
    // Reference time: 15:35 (10 mins left out of 60m => <= 25% warning)
    const refTime = new Date('2026-10-14T15:35:00Z');
    const sla = calculateSlaStatus(mockIncident, refTime);

    expect(sla.timeRemainingMinutes).toBe(10);
    expect(sla.isBreached).toBe(false);
    expect(sla.isWarning).toBe(true);
    expect(sla.displayString).toContain('10m remaining');
  });

  it('detects breached SLA when reference time exceeds deadline', () => {
    const pastTime = new Date('2026-10-14T15:55:00Z'); // 10 mins past 15:45
    const sla = calculateSlaStatus(mockIncident, pastTime);

    expect(sla.isBreached).toBe(true);
    expect(sla.displayString).toContain('BREACHED');
  });

  it('marks resolved incidents as compliant with SLA', () => {
    const resolvedIncident = { ...mockIncident, status: 'RESOLVED' as const };
    const sla = calculateSlaStatus(resolvedIncident);

    expect(sla.isBreached).toBe(false);
    expect(sla.displayString).toBe('Resolved in SLA');
  });

  it('calculates severity weights accurately', () => {
    expect(calculateSeverityWeight('CRITICAL')).toBe(100);
    expect(calculateSeverityWeight('HIGH')).toBe(75);
    expect(calculateSeverityWeight('MEDIUM')).toBe(50);
    expect(calculateSeverityWeight('LOW')).toBe(25);
  });

  it('compiles comprehensive shift handover executive brief', () => {
    const report = generateShiftHandoverReport([mockIncident], 'Jordan Vance');
    expect(report.analyst).toBe('Jordan Vance');
    expect(report.openCriticals.length).toBe(1);
    expect(report.markdownContent).toContain('SOC SHIFT HANDOVER BRIEFING');
    expect(report.markdownContent).toContain('INC-TEST-01');
    expect(report.markdownContent).toContain('prod-db-01');
  });
});
