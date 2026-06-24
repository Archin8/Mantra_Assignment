import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';

interface KPICardProps {
  label: string;
  value: string | number;
  suffix?: string;
  previousValue?: number;
  currentValue?: number;
  icon?: React.ReactNode;
  format?: 'number' | 'percent';
}

const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  suffix,
  previousValue,
  currentValue,
  icon,
}) => {
  let changePercent: number | null = null;
  let changeDirection: 'positive' | 'negative' | 'neutral' = 'neutral';

  if (previousValue !== undefined && currentValue !== undefined && previousValue > 0) {
    changePercent = ((currentValue - previousValue) / previousValue) * 100;
    if (changePercent > 0.5) changeDirection = 'positive';
    else if (changePercent < -0.5) changeDirection = 'negative';
    else changeDirection = 'neutral';
  }

  return (
    <div className="kpi-card animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="kpi-label">{label}</span>
        {icon && (
          <span style={{ fontSize: 20, color: 'var(--color-primary-light)', opacity: 0.7 }}>
            {icon}
          </span>
        )}
      </div>
      <div className="kpi-value">
        {value}
        {suffix && <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 4 }}>{suffix}</span>}
      </div>
      {changePercent !== null && (
        <span className={`kpi-change ${changeDirection}`}>
          {changeDirection === 'positive' && <ArrowUpOutlined />}
          {changeDirection === 'negative' && <ArrowDownOutlined />}
          {changeDirection === 'neutral' && <MinusOutlined />}
          {Math.abs(changePercent).toFixed(1)}% MoM
        </span>
      )}
    </div>
  );
};

export default KPICard;
