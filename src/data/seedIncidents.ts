import type { Incident } from '../types/security';

export const SEED_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-8841',
    title: 'Suspected Ransomware Staging on Prod Database Replica',
    description:
      'CrowdStrike Falcon detected high-entropy batch encryption and suspicious rename activity under /var/lib/postgresql/data. Cobalt Strike beacon communication observed over port 443 to known malicious C2 IP.',
    severity: 'CRITICAL',
    status: 'INVESTIGATING',
    assignee: 'Alex Rivera (Lead SOC)',
    createdAt: '2026-10-14T14:45:00Z',
    updatedAt: '2026-10-14T15:20:00Z',
    slaMinutes: 60,
    slaDeadline: '2026-10-14T15:45:00Z', // 15 mins remaining at 15:30 reference
    mitreTechniques: [
      {
        id: 'T1486',
        name: 'Data Encrypted for Impact',
        tactic: 'Impact',
      },
      {
        id: 'T1059.004',
        name: 'Command and Scripting: Unix Shell',
        tactic: 'Execution',
      },
      {
        id: 'T1078.003',
        name: 'Valid Accounts: Local Accounts',
        tactic: 'Initial Access',
      },
    ],
    affectedAssets: [
      {
        id: 'asset_db_02',
        hostname: 'prod-db-replica-02',
        ipAddress: '10.0.4.18',
        assetType: 'database',
        riskScore: 94,
        isIsolated: false,
        os: 'Ubuntu 22.04 LTS',
        region: 'us-east-1a',
      },
      {
        id: 'asset_db_storage',
        hostname: 'vol-ebs-encrypted-pg02',
        ipAddress: '10.0.4.19',
        assetType: 'server',
        riskScore: 88,
        isIsolated: false,
        os: 'AWS EBS Volume',
        region: 'us-east-1a',
      },
    ],
    timeline: [
      {
        id: 'ev_1',
        timestamp: '2026-10-14T14:45:12Z',
        source: 'crowdstrike',
        message: 'High-entropy file modification detected in /var/lib/postgresql/data (Process: /tmp/.systemd-worker)',
        severity: 'CRITICAL',
      },
      {
        id: 'ev_2',
        timestamp: '2026-10-14T14:46:04Z',
        source: 'suricata',
        message: 'Outbound TCP connection to 185.220.101.5 (Known LockBit 3.0 C2 affiliate pool)',
        severity: 'CRITICAL',
      },
      {
        id: 'ev_3',
        timestamp: '2026-10-14T14:50:30Z',
        source: 'aws-guardduty',
        message: 'Execution:EC2/SuspiciousCommand.CustomShell launched via compromised cron job',
        severity: 'HIGH',
      },
      {
        id: 'ev_4',
        timestamp: '2026-10-14T15:15:22Z',
        source: 'analyst',
        message: 'Lead analyst Alex Rivera engaged incident channel #secops-inc-8841. Initiated containment playbook.',
        severity: 'INFO',
      },
    ],
    playbook: {
      id: 'pb_ransomware',
      name: 'Ransomware & Cryptoviral Host Isolation',
      category: 'Malware Containment',
      steps: [
        {
          id: 'step_1',
          title: 'Sever Host Network Interface (EDR Isolation)',
          description: 'Isolate host from production VPC to prevent lateral movement to primary DB cluster.',
          isCompleted: false,
          actionRequired: 'isolate-host',
        },
        {
          id: 'step_2',
          title: 'Terminate Malicious Execution Trees',
          description: 'Send SIGKILL to PID 44102 (/tmp/.systemd-worker) and all orphaned fork processes.',
          isCompleted: false,
        },
        {
          id: 'step_3',
          title: 'Preserve Volatile Memory & EBS Snapshot',
          description: 'Execute AWS CLI ec2-create-snapshot on vol-ebs-encrypted-pg02 for forensic dump.',
          isCompleted: false,
          actionRequired: 'memory-dump',
        },
        {
          id: 'step_4',
          title: 'Verify Primary Cluster Read/Write Integrity',
          description: 'Confirm primary node prod-db-primary-01 reports healthy replication stream and no unauthorized writes.',
          isCompleted: false,
        },
      ],
    },
  },
  {
    id: 'INC-2026-8839',
    title: 'Anomalous API Key Usage from Tor Exit Node',
    description:
      'Auth0 and CloudTrail detected administrative token usage from known Tor Exit Node 176.10.99.200 querying AWS IAM ListUsers and GetAccessKey metadata.',
    severity: 'HIGH',
    status: 'CONTAINED',
    assignee: 'Jordan Vance (SecOps Eng)',
    createdAt: '2026-10-14T13:10:00Z',
    updatedAt: '2026-10-14T14:30:00Z',
    slaMinutes: 240,
    slaDeadline: '2026-10-14T17:10:00Z',
    mitreTechniques: [
      {
        id: 'T1078.001',
        name: 'Valid Accounts: Default Accounts',
        tactic: 'Defense Evasion',
      },
      {
        id: 'T1090.003',
        name: 'Multi-hop Proxy: Tor',
        tactic: 'Command and Control',
      },
    ],
    affectedAssets: [
      {
        id: 'asset_api_gw',
        hostname: 'api-gateway-us-east',
        ipAddress: '172.31.8.42',
        assetType: 'api-gateway',
        riskScore: 78,
        isIsolated: true,
        region: 'us-east-1',
      },
    ],
    timeline: [
      {
        id: 'ev_8839_1',
        timestamp: '2026-10-14T13:10:15Z',
        source: 'auth0',
        message: 'Admin console login authenticated via API token from 176.10.99.200 (Tor Exit)',
        severity: 'HIGH',
      },
      {
        id: 'ev_8839_2',
        timestamp: '2026-10-14T13:45:00Z',
        source: 'analyst',
        message: 'Jordan Vance revoked IAM access keys AKIAIOSFODNN7EXAMPLE and terminated session.',
        severity: 'INFO',
      },
    ],
    playbook: {
      id: 'pb_compromised_creds',
      name: 'Compromised Credentials Revocation',
      category: 'Credential Exposure',
      steps: [
        {
          id: 'step_cred_1',
          title: 'Revoke Active OAuth & AWS Session Tokens',
          description: 'Call aws iam delete-access-key and invalidate cached STS sessions.',
          isCompleted: true,
          completedAt: '2026-10-14T13:45:00Z',
          completedBy: 'Jordan Vance',
          actionRequired: 'revoke-tokens',
        },
        {
          id: 'step_cred_2',
          title: 'Rotate Master Secret in HashiCorp Vault',
          description: 'Trigger automated dynamic rotation for gateway root credentials.',
          isCompleted: true,
          completedAt: '2026-10-14T14:10:00Z',
          completedBy: 'Jordan Vance',
        },
        {
          id: 'step_cred_3',
          title: 'Audit CloudTrail Log Queries for Exfiltration',
          description: 'Verify no sensitive DynamoDB or S3 buckets were downloaded during the 35m window.',
          isCompleted: false,
        },
      ],
    },
  },
  {
    id: 'INC-2026-8834',
    title: 'Multiple Failed SSH Brute Force Attempts on Bastion Jump Box',
    description:
      'Over 2,400 invalid SSH login attempts in 10 minutes detected on public bastion node bastion-jump-01 from ASN 4134 (Chinanet). Fail2ban triggered local firewall rule.',
    severity: 'MEDIUM',
    status: 'TRIAGE',
    assignee: 'Unassigned',
    createdAt: '2026-10-14T12:00:00Z',
    updatedAt: '2026-10-14T12:05:00Z',
    slaMinutes: 720,
    slaDeadline: '2026-10-14T20:00:00Z',
    mitreTechniques: [
      {
        id: 'T1110.001',
        name: 'Brute Force: Password Guessing',
        tactic: 'Credential Access',
      },
    ],
    affectedAssets: [
      {
        id: 'asset_bastion_01',
        hostname: 'bastion-jump-01',
        ipAddress: '10.0.1.5',
        assetType: 'server',
        riskScore: 52,
        isIsolated: false,
        os: 'Debian 12 Bookworm',
        region: 'us-west-2',
      },
    ],
    timeline: [
      {
        id: 'ev_8834_1',
        timestamp: '2026-10-14T12:00:22Z',
        source: 'suricata',
        message: 'ET SCAN Potential SSH Scan 2400+ packets to port 22/tcp',
        severity: 'MEDIUM',
      },
    ],
    playbook: {
      id: 'pb_brute_force',
      name: 'External Ingress Brute Force Mitigation',
      category: 'Network Ingress',
      steps: [
        {
          id: 'step_bf_1',
          title: 'Add Offending CIDR to Cloudflare WAF Blocklist',
          description: 'Null-route ingress from ASN 4134 on edge firewall.',
          isCompleted: false,
          actionRequired: 'block-ip',
        },
        {
          id: 'step_bf_2',
          title: 'Confirm Bastion MFA Enforcement',
          description: 'Ensure hardware WebAuthn / YubiKey requirement is intact.',
          isCompleted: false,
        },
      ],
    },
  },
  {
    id: 'INC-2026-8829',
    title: 'Unencrypted S3 Bucket Policy Detected via CloudTrail Audit',
    description:
      'AWS Config rule s3-bucket-server-side-encryption-enabled flagged bucket data-analytics-export-2026 as lacking mandatory SSE-KMS encryption policy.',
    severity: 'LOW',
    status: 'RESOLVED',
    assignee: 'Elena Rostova (Compliance)',
    createdAt: '2026-10-14T08:30:00Z',
    updatedAt: '2026-10-14T11:15:00Z',
    slaMinutes: 1440,
    slaDeadline: '2026-10-15T08:30:00Z',
    mitreTechniques: [
      {
        id: 'T1530',
        name: 'Data from Cloud Storage Object',
        tactic: 'Collection',
      },
    ],
    affectedAssets: [
      {
        id: 'asset_s3_export',
        hostname: 'data-analytics-export-2026',
        ipAddress: 's3.us-east-1.amazonaws.com',
        assetType: 'database',
        riskScore: 24,
        isIsolated: false,
        region: 'us-east-1',
      },
    ],
    timeline: [
      {
        id: 'ev_8829_1',
        timestamp: '2026-10-14T08:30:00Z',
        source: 'aws-guardduty',
        message: 'Config rule compliance failure: s3-bucket-server-side-encryption-enabled',
        severity: 'LOW',
      },
      {
        id: 'ev_8829_2',
        timestamp: '2026-10-14T11:15:00Z',
        source: 'analyst',
        message: 'Elena Rostova applied aws:kms default key encryption policy. Bucket compliant.',
        severity: 'INFO',
      },
    ],
    playbook: {
      id: 'pb_s3_encryption',
      name: 'Cloud Storage Hardening & Encryption',
      category: 'Cloud Posture',
      steps: [
        {
          id: 'step_s3_1',
          title: 'Enforce AES-256 or KMS Key Policy',
          description: 'Update S3 bucket configuration to reject unencrypted PUT operations.',
          isCompleted: true,
          completedAt: '2026-10-14T11:15:00Z',
          completedBy: 'Elena Rostova',
        },
      ],
    },
  },
];
