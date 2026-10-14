import { describe, it, expect } from 'vitest';
import { calculatePlaybookProgress } from '../src/lib/incidentTriage';
import type { IncidentPlaybook } from '../src/types/security';

describe('Playbook Engine', () => {
  const mockPlaybook: IncidentPlaybook = {
    id: 'pb_test',
    name: 'Credentials Containment',
    category: 'Identity',
    steps: [
      {
        id: 's1',
        title: 'Revoke Tokens',
        description: 'Call STS invalidate',
        isCompleted: true,
      },
      {
        id: 's2',
        title: 'Rotate API Secret',
        description: 'Vault master rotation',
        isCompleted: false,
      },
      {
        id: 's3',
        title: 'Audit Ingress Logs',
        description: 'Query CloudTrail events',
        isCompleted: false,
      },
    ],
  };

  it('computes completion percentage accurately', () => {
    // 1 of 3 = 33%
    const progress = calculatePlaybookProgress(mockPlaybook);
    expect(progress.completedCount).toBe(1);
    expect(progress.totalCount).toBe(3);
    expect(progress.percentage).toBe(33);
  });

  it('returns 100% when all steps are completed', () => {
    const completedPlaybook: IncidentPlaybook = {
      ...mockPlaybook,
      steps: mockPlaybook.steps.map((s) => ({ ...s, isCompleted: true })),
    };
    const progress = calculatePlaybookProgress(completedPlaybook);
    expect(progress.completedCount).toBe(3);
    expect(progress.percentage).toBe(100);
  });
});
