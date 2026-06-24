import React, { useState, useEffect, useCallback } from 'react';
import { Select, Spin, Descriptions, Tag, Button, Divider, Image, Empty } from 'antd';
import {
  CopyOutlined, FileTextOutlined, DollarOutlined,
  SafetyCertificateOutlined, PictureOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  fetchGrants, fetchGrantById, fetchGrantFinance, fetchGrantPerformance, fetchGrantMedia,
} from '../api/client';
import type { Grant, GrantDetail, GrantFinance, GrantPerformance, GrantMedia, FinanceSummaryRow } from '../types';

const GrantAssistantView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [selectedGrantId, setSelectedGrantId] = useState<string | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>();

  const [grantDetail, setGrantDetail] = useState<GrantDetail | null>(null);
  const [finance, setFinance] = useState<GrantFinance[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummaryRow[]>([]);
  const [performance, setPerformance] = useState<GrantPerformance[]>([]);
  const [media, setMedia] = useState<GrantMedia[]>([]);

  useEffect(() => {
    fetchGrants().then(setGrants);
  }, []);

  const loadGrantData = useCallback(async () => {
    if (!selectedGrantId) return;
    setLoading(true);
    try {
      const [detail, finRes, perf, med] = await Promise.all([
        fetchGrantById(selectedGrantId),
        fetchGrantFinance(selectedGrantId, selectedMonth),
        fetchGrantPerformance(selectedGrantId, selectedMonth),
        fetchGrantMedia(selectedGrantId, selectedMonth),
      ]);
      setGrantDetail(detail);
      setFinance(finRes.data);
      setFinanceSummary(finRes.summary);
      setPerformance(perf);
      setMedia(med);
    } catch (err) {
      console.error('Failed to load grant data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedGrantId, selectedMonth]);

  useEffect(() => { loadGrantData(); }, [loadGrantData]);

  // Available months for the selected grant
  const grantMonths = grantDetail
    ? [...new Set([
        ...grantDetail.finance.map((f) => f.month),
        ...grantDetail.performance.map((p) => p.month),
      ])].sort()
    : [];

  // Finance chart data
  const financeChartData = financeSummary.map((s) => ({
    month: s.month,
    'Approved Budget': parseInt(s.totalApprovedBudget, 10),
    'Monthly Utilized': parseInt(s.totalMonthlyUtilized, 10),
    'Cumulative Utilized': parseInt(s.totalCumulativeUtilized, 10),
  }));

  // Generate narrative
  const generateNarrative = (): string => {
    if (!grantDetail || performance.length === 0) return '';

    const latestPerf = performance[performance.length - 1];
    const latestFinSummary = financeSummary[financeSummary.length - 1];

    const narrative = [
      `In ${latestPerf.month}, ${grantDetail.name} reached ${(latestPerf.completionRate * 100).toFixed(1)}% PBL completion, ${(latestPerf.evidenceRate * 100).toFixed(1)}% evidence submission, and ${(latestPerf.attendanceRate * 100).toFixed(1)}% attendance across ${latestPerf.coveredDistricts}.`,
      '',
      `Risk Status: ${latestPerf.riskStatus}. Report Status: ${latestPerf.reportStatus}.`,
      '',
      `Milestones: ${latestPerf.milestoneSummary}.`,
      '',
      latestFinSummary
        ? `Finance: Budget utilization averaged ${(parseFloat(latestFinSummary.avgUtilizationRate) * 100).toFixed(1)}% for the period, with ${parseInt(latestFinSummary.totalCumulativeUtilized, 10).toLocaleString()} units utilized of ${parseInt(latestFinSummary.totalApprovedBudget, 10).toLocaleString()} approved.`
        : '',
      '',
      media.length > 0
        ? `Evidence: ${media.length} media asset(s) available — including ${media.filter((m) => m.recordType === 'image').length} image(s) and ${media.filter((m) => m.recordType === 'news_clipping').length} news clipping(s).`
        : 'No media evidence available for this period.',
      '',
      `Schools sampled: ${latestPerf.sampledSchools}. Schools completed PBL: ${latestPerf.schoolsCompleted}. Schools with evidence: ${latestPerf.schoolsWithEvidence}.`,
    ].filter(Boolean).join('\n');

    return narrative;
  };

  const narrativeText = generateNarrative();

  const handleCopyNarrative = () => {
    navigator.clipboard.writeText(narrativeText);
  };

  if (!selectedGrantId) {
    return (
      <div>
        <div className="grant-selector">
          <div className="filter-bar">
            <div className="filter-item">
              <span className="filter-label">Select Grant</span>
              <Select
                placeholder="Choose a grant..."
                style={{ width: 320 }}
                value={selectedGrantId}
                onChange={(v) => { setSelectedGrantId(v); setSelectedMonth(undefined); }}
                options={grants.map((g) => ({ label: `${g.name} (${g.donor})`, value: g.id }))}
              />
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Empty description="Select a grant to view the reporting assistant" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Grant Selection */}
      <div className="filter-bar">
        <div className="filter-item">
          <span className="filter-label">Grant</span>
          <Select
            placeholder="Choose a grant..."
            style={{ width: 320 }}
            value={selectedGrantId}
            onChange={(v) => { setSelectedGrantId(v); setSelectedMonth(undefined); }}
            options={grants.map((g) => ({ label: `${g.name} (${g.donor})`, value: g.id }))}
          />
        </div>
        <div className="filter-item">
          <span className="filter-label">Month</span>
          <Select
            placeholder="All Months"
            allowClear
            style={{ width: 160 }}
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={grantMonths.map((m) => ({ label: m, value: m }))}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spin size="large" tip="Loading grant data..." />
        </div>
      ) : grantDetail ? (
        <div className="animate-in">
          {/* Grant Profile */}
          <div className="fact-panel">
            <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileTextOutlined /> Grant Profile
            </h3>
            <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Grant Name">{grantDetail.name}</Descriptions.Item>
              <Descriptions.Item label="Donor">{grantDetail.donor}</Descriptions.Item>
              <Descriptions.Item label="Period">
                {new Date(grantDetail.periodStart).toLocaleDateString()} — {new Date(grantDetail.periodEnd).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Districts" span={3}>{grantDetail.coveredDistricts}</Descriptions.Item>
            </Descriptions>
          </div>

          {/* Performance Metrics */}
          {performance.length > 0 && (
            <div className="fact-panel">
              <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <SafetyCertificateOutlined /> Performance Metrics
              </h3>
              {performance.map((p) => (
                <div key={p.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <Tag color="green">{p.month}</Tag>
                    <Tag color={p.riskStatus === 'On Track' ? 'green' : p.riskStatus === 'Behind' ? 'orange' : 'red'}>
                      {p.riskStatus}
                    </Tag>
                    <Tag>{p.reportStatus}</Tag>
                  </div>
                  <Descriptions size="small" bordered column={{ xs: 1, sm: 2, md: 3 }}>
                    <Descriptions.Item label="Sampled Schools">{p.sampledSchools}</Descriptions.Item>
                    <Descriptions.Item label="Schools Completed PBL">{p.schoolsCompleted}</Descriptions.Item>
                    <Descriptions.Item label="Completion Rate">{(p.completionRate * 100).toFixed(1)}%</Descriptions.Item>
                    <Descriptions.Item label="Schools w/ Evidence">{p.schoolsWithEvidence}</Descriptions.Item>
                    <Descriptions.Item label="Evidence Rate">{(p.evidenceRate * 100).toFixed(1)}%</Descriptions.Item>
                    <Descriptions.Item label="Attendance Rate">{(p.attendanceRate * 100).toFixed(1)}%</Descriptions.Item>
                    <Descriptions.Item label="Total Enrollment">{p.totalEnrollment.toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="Total Attendance">{p.totalAttendance.toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="Milestones" span={3}>{p.milestoneSummary}</Descriptions.Item>
                  </Descriptions>
                </div>
              ))}
            </div>
          )}

          {/* Finance Utilization */}
          <div className="fact-panel">
            <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <DollarOutlined /> Finance Utilization
            </h3>
            {financeChartData.length > 0 && (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={financeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E8E0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E0E8E0' }} />
                  <Legend />
                  <Bar dataKey="Approved Budget" fill="#C8E6C9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Monthly Utilized" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Budget Line Details */}
            {finance.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Divider orientation={"left" as any} style={{ fontSize: 13 }}>Budget Line Details</Divider>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--color-primary-lightest)', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px' }}>Month</th>
                        <th style={{ padding: '8px 12px' }}>Budget Line</th>
                        <th style={{ padding: '8px 12px' }}>Approved</th>
                        <th style={{ padding: '8px 12px' }}>Utilized</th>
                        <th style={{ padding: '8px 12px' }}>Rate</th>
                        <th style={{ padding: '8px 12px' }}>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finance.map((f) => (
                        <tr key={f.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '8px 12px' }}>{f.month}</td>
                          <td style={{ padding: '8px 12px' }}>{f.budgetLine}</td>
                          <td style={{ padding: '8px 12px' }}>{f.approvedBudget.toLocaleString()}</td>
                          <td style={{ padding: '8px 12px' }}>{f.cumulativeUtilized.toLocaleString()}</td>
                          <td style={{ padding: '8px 12px' }}>{(f.utilizationRate * 100).toFixed(1)}%</td>
                          <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>{f.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Evidence & Media Gallery */}
          {media.length > 0 && (
            <div className="fact-panel">
              <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <PictureOutlined /> Evidence & Media ({media.length} assets)
              </h3>
              <div className="media-gallery">
                {media.map((m) => (
                  <div className="media-item" key={m.id}>
                    <Image
                      src={`/api/media/${m.fileName}`}
                      alt={m.title}
                      style={{ width: '100%', height: 160, objectFit: 'cover' }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
                    />
                    <div className="media-caption">
                      <strong>{m.title}</strong>
                      <p style={{ marginTop: 4, fontSize: 11, lineHeight: 1.4 }}>{m.caption}</p>
                      {m.usageNote && (
                        <p style={{ marginTop: 4, fontSize: 10, fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                          {m.usageNote}
                        </p>
                      )}
                      <Tag style={{ marginTop: 6 }} color={m.recordType === 'image' ? 'green' : 'blue'}>
                        {m.recordType}
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Narrative */}
          {narrativeText && (
            <div className="narrative-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4><FileTextOutlined /> Generated Grant Report Section</h4>
                <Button icon={<CopyOutlined />} size="small" onClick={handleCopyNarrative}>
                  Copy Report
                </Button>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              {narrativeText.split('\n').map((line, i) => (
                <p key={i} style={{ marginBottom: line === '' ? 8 : 4 }}>{line}</p>
              ))}
              <Divider style={{ margin: '16px 0 8px' }} />
              <p style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                ℹ️ This narrative is generated deterministically from computed facts. All metrics, rates, and counts are sourced directly from the database.
                No AI hallucination is involved — this report works identically with AI disabled.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default GrantAssistantView;
