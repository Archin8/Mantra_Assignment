import React from 'react';
import { Button } from 'antd';
import { CopyOutlined, FileTextOutlined } from '@ant-design/icons';
import type { SchoolSummary, TrendData } from '../types';

interface ReviewSummaryProps {
  summary: SchoolSummary | null;
  trends: TrendData[];
  selectedMonth?: string;
  selectedDistrict?: string;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ summary, trends, selectedMonth, selectedDistrict }) => {
  if (!summary) return null;

  const totalRecords = parseInt(summary.totalRecords, 10);
  const totalSchools = parseInt(summary.totalSchools, 10);
  const conducted = parseInt(summary.schoolsConducted, 10);
  const evidence = parseInt(summary.schoolsWithEvidence, 10);
  const avgRate = parseFloat(summary.avgAttendanceRate);
  const onTrack = parseInt(summary.onTrack, 10);
  const behind = parseInt(summary.behind, 10);
  const atRisk = parseInt(summary.atRisk, 10);
  const critical = parseInt(summary.critical, 10);
  const participationPct = totalRecords > 0 ? ((conducted / totalRecords) * 100).toFixed(1) : '0.0';
  const evidencePct = totalRecords > 0 ? ((evidence / totalRecords) * 100).toFixed(1) : '0.0';

  // MoM calculation
  let momInsight = '';
  if (trends.length >= 2) {
    const prev = trends[trends.length - 2];
    const curr = trends[trends.length - 1];
    const prevRate = parseFloat(prev.avgAttendanceRate);
    const currRate = parseFloat(curr.avgAttendanceRate);
    const change = ((currRate - prevRate) / prevRate * 100).toFixed(1);
    const direction = currRate > prevRate ? 'improved' : currRate < prevRate ? 'declined' : 'remained stable';
    momInsight = `Attendance ${direction} from ${(prevRate * 100).toFixed(1)}% (${prev.month}) to ${(currRate * 100).toFixed(1)}% (${curr.month}), a ${Math.abs(parseFloat(change))}% change.`;
  }

  const scope = selectedDistrict
    ? `${selectedDistrict}${selectedMonth ? ` for ${selectedMonth}` : ''}`
    : selectedMonth
      ? `all districts for ${selectedMonth}`
      : 'all districts across all months';

  const summaryText = `
Program Review Summary — ${scope}

ACHIEVEMENTS:
• ${totalSchools} unique schools reporting across ${summary.totalDistricts} districts and ${summary.totalBlocks} blocks.
• ${participationPct}% PBL participation rate (${conducted} of ${totalRecords} school-month records conducted PBL).
• ${evidencePct}% evidence submission rate (${evidence} schools submitted evidence).
• Average attendance rate: ${(avgRate * 100).toFixed(1)}%.

RISK DISTRIBUTION:
• On Track (≥75%): ${onTrack} schools
• Behind (60–74%): ${behind} schools
• At Risk (35–59%): ${atRisk} schools
• Critical (<35%): ${critical} schools

${momInsight ? `MONTH-OVER-MONTH:\n• ${momInsight}` : ''}

PRIORITY AREAS:
• ${atRisk + critical} schools need immediate follow-up (At Risk + Critical).${atRisk + critical > 0 ? `\n• Focus on improving evidence submission (currently ${evidencePct}%) and attendance rates.` : ''}

DISCUSSION POINTS:
1. What strategies can be implemented to move ${behind} "Behind" schools to "On Track"?
2. How can evidence submission rates be improved from ${evidencePct}%?
3. Are there district/block-level patterns that explain the ${critical} critical-status schools?
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
  };

  return (
    <div className="review-summary animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3><FileTextOutlined /> Monthly Review Summary</h3>
        <Button icon={<CopyOutlined />} size="small" onClick={handleCopy}>
          Copy
        </Button>
      </div>

      <div className="summary-section">
        <h4>📊 Achievements</h4>
        <ul style={{ paddingLeft: 20 }}>
          <li>{totalSchools} unique schools across {summary.totalDistricts} districts, {summary.totalBlocks} blocks.</li>
          <li>{participationPct}% PBL participation ({conducted}/{totalRecords} records).</li>
          <li>{evidencePct}% evidence submission ({evidence} schools).</li>
          <li>Average attendance: {(avgRate * 100).toFixed(1)}%.</li>
        </ul>
      </div>

      <div className="summary-section">
        <h4>⚠️ Risk Distribution</h4>
        <p>
          On Track: <strong>{onTrack}</strong> · Behind: <strong>{behind}</strong> · At Risk: <strong>{atRisk}</strong> · Critical: <strong>{critical}</strong>
        </p>
      </div>

      {momInsight && (
        <div className="summary-section">
          <h4>📈 Month-over-Month</h4>
          <p>{momInsight}</p>
        </div>
      )}

      <div className="summary-section">
        <h4>🎯 Priority & Discussion Points</h4>
        <ul style={{ paddingLeft: 20 }}>
          <li>{atRisk + critical} schools need immediate follow-up (At Risk + Critical).</li>
          <li>Focus on improving evidence submission (currently {evidencePct}%).</li>
          <li>Investigate district/block-level patterns in {critical} critical schools.</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewSummary;
