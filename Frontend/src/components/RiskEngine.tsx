import React from 'react';
import { Progress, Tooltip } from 'antd';
import type { RiskDistribution } from '../types';

interface RiskEngineProps {
  data: RiskDistribution[];
  loading?: boolean;
}

const riskConfig: Record<string, { color: string; bg: string; label: string; threshold: string }> = {
  'On Track': { color: '#2E7D32', bg: '#E8F5E9', label: 'On Track', threshold: '≥ 75%' },
  'Behind': { color: '#E65100', bg: '#FFF3E0', label: 'Behind', threshold: '60% – 74%' },
  'At Risk': { color: '#C62828', bg: '#FFEBEE', label: 'At Risk', threshold: '35% – 59%' },
  'Critical': { color: '#6A1B9A', bg: '#F3E5F5', label: 'Critical', threshold: '< 35%' },
};

const riskOrder = ['On Track', 'Behind', 'At Risk', 'Critical'];

const RiskEngine: React.FC<RiskEngineProps> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + parseInt(d.count, 10), 0);

  const sorted = [...data].sort((a, b) => {
    return riskOrder.indexOf(a.riskStatus) - riskOrder.indexOf(b.riskStatus);
  });

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>🔍 Risk Classification Engine</h3>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {total} total records
        </span>
      </div>
      <div className="card-body">
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--color-primary-lightest)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-secondary)' }}>
          <strong>Risk Thresholds (Deterministic):</strong> On Track ≥ 75% · Behind 60–74% · At Risk 35–59% · Critical &lt; 35%
        </div>
        {sorted.map((item) => {
          const config = riskConfig[item.riskStatus] || riskConfig['At Risk'];
          const count = parseInt(item.count, 10);
          const pct = total > 0 ? (count / total) * 100 : 0;

          return (
            <div
              key={item.riskStatus}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <Tooltip title={`Threshold: ${config.threshold}`}>
                <span
                  className="risk-badge"
                  style={{ background: config.bg, color: config.color, minWidth: 90, justifyContent: 'center' }}
                >
                  {config.label}
                </span>
              </Tooltip>
              <div style={{ flex: 1 }}>
                <Progress
                  percent={Math.round(pct)}
                  strokeColor={config.color}
                  trailColor="#f0f0f0"
                  size="small"
                  format={(p) => `${p}%`}
                />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, minWidth: 50, textAlign: 'right' }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskEngine;
