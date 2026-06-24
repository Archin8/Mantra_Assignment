import React, { useState, useEffect, useCallback } from 'react';
import { Select, Spin, Table, Tag } from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import KPICard from '../components/KPICard';
import RiskEngine from '../components/RiskEngine';
import ReviewSummary from '../components/ReviewSummary';
import {
  fetchSchoolsSummary, fetchTrends, fetchRiskDistribution,
  fetchDistricts, fetchBlocks, fetchMonths, fetchSchools,
} from '../api/client';
import type { SchoolSummary, TrendData, RiskDistribution, SchoolMonthly } from '../types';

const PIE_COLORS = ['#4CAF50', '#FF9800', '#F44336', '#9C27B0'];

const DashboardView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);

  const [selectedMonth, setSelectedMonth] = useState<string | undefined>();
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>();
  const [selectedBlock, setSelectedBlock] = useState<string | undefined>();

  const [summary, setSummary] = useState<SchoolSummary | null>(null);
  const [prevSummary, setPrevSummary] = useState<SchoolSummary | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [riskData, setRiskData] = useState<RiskDistribution[]>([]);
  const [topSchools, setTopSchools] = useState<SchoolMonthly[]>([]);
  const [bottomSchools, setBottomSchools] = useState<SchoolMonthly[]>([]);

  // Load filter options
  useEffect(() => {
    Promise.all([fetchMonths(), fetchDistricts()]).then(([m, d]) => {
      setMonths(m);
      setDistricts(d);
    });
  }, []);

  // Load blocks when district changes
  useEffect(() => {
    if (selectedDistrict) {
      fetchBlocks(selectedDistrict).then(setBlocks);
    } else {
      setBlocks([]);
    }
    setSelectedBlock(undefined);
  }, [selectedDistrict]);

  // Load data when filters change
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = { month: selectedMonth, district: selectedDistrict };

      const [sum, trend, risk] = await Promise.all([
        fetchSchoolsSummary(filters),
        fetchTrends({ district: selectedDistrict, block: selectedBlock }),
        fetchRiskDistribution(filters),
      ]);

      setSummary(sum);
      setTrends(trend);
      setRiskData(risk);

      // Previous month summary for MoM
      if (selectedMonth && months.length > 0) {
        const idx = months.indexOf(selectedMonth);
        if (idx > 0) {
          const prev = await fetchSchoolsSummary({ month: months[idx - 1], district: selectedDistrict });
          setPrevSummary(prev);
        } else {
          setPrevSummary(null);
        }
      } else {
        setPrevSummary(null);
      }

      // Top and bottom performing schools
      const topRes = await fetchSchools({
        month: selectedMonth, district: selectedDistrict, block: selectedBlock,
        sortBy: 'attendanceRate', sortOrder: 'desc', limit: 5,
      });
      setTopSchools(topRes.data);

      const bottomRes = await fetchSchools({
        month: selectedMonth, district: selectedDistrict, block: selectedBlock,
        sortBy: 'attendanceRate', sortOrder: 'asc', limit: 5,
      });
      setBottomSchools(bottomRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedDistrict, selectedBlock, months]);

  useEffect(() => { loadData(); }, [loadData]);

  const formatNum = (val: string | number) => {
    const n = typeof val === 'string' ? parseInt(val, 10) : val;
    return isNaN(n) ? '0' : n.toLocaleString();
  };

  const trendChartData = trends.map((t) => ({
    month: t.month,
    'Attendance %': +(parseFloat(t.avgAttendanceRate) * 100).toFixed(1),
    'Participation': parseInt(t.schoolsConducted, 10),
    'Evidence': parseInt(t.schoolsWithEvidence, 10),
    'Total Records': parseInt(t.totalRecords, 10),
  }));

  const riskPieData = riskData.map((r) => ({
    name: r.riskStatus,
    value: parseInt(r.count, 10),
  }));

  const riskOrder = ['On Track', 'Behind', 'At Risk', 'Critical'];
  const riskBarData = riskData
    .map((r) => ({ status: r.riskStatus, count: parseInt(r.count, 10) }))
    .sort((a, b) => riskOrder.indexOf(a.status) - riskOrder.indexOf(b.status));

  const schoolColumns = [
    { title: 'School', dataIndex: 'schoolName', key: 'schoolName', ellipsis: true },
    { title: 'District', dataIndex: 'district', key: 'district', width: 120 },
    { title: 'Block', dataIndex: 'block', key: 'block', width: 150, ellipsis: true },
    { title: 'Attendance', dataIndex: 'attendanceRate', key: 'attendanceRate', width: 100,
      render: (v: number) => `${(v * 100).toFixed(1)}%` },
    { title: 'Risk', dataIndex: 'riskStatus', key: 'riskStatus', width: 100,
      render: (v: string) => {
        const colorMap: Record<string, string> = { 'On Track': 'green', 'Behind': 'orange', 'At Risk': 'red', 'Critical': 'purple' };
        return <Tag color={colorMap[v] || 'default'}>{v}</Tag>;
      },
    },
  ];

  if (loading && !summary) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  const totalRecords = parseInt(summary?.totalRecords || '0', 10);
  const conducted = parseInt(summary?.schoolsConducted || '0', 10);
  const evidence = parseInt(summary?.schoolsWithEvidence || '0', 10);
  const avgRate = parseFloat(summary?.avgAttendanceRate || '0');

  const prevConducted = prevSummary ? parseInt(prevSummary.schoolsConducted, 10) : undefined;
  const prevEvidence = prevSummary ? parseInt(prevSummary.schoolsWithEvidence, 10) : undefined;
  const prevRate = prevSummary ? parseFloat(prevSummary.avgAttendanceRate) : undefined;

  return (
    <div>
      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-item">
          <span className="filter-label">Month</span>
          <Select
            placeholder="All Months"
            allowClear
            value={selectedMonth}
            onChange={setSelectedMonth}
            style={{ width: 160 }}
            options={months.map((m) => ({ label: m, value: m }))}
          />
        </div>
        <div className="filter-item">
          <span className="filter-label">District</span>
          <Select
            placeholder="All Districts"
            allowClear
            showSearch
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            style={{ width: 180 }}
            options={districts.map((d) => ({ label: d, value: d }))}
          />
        </div>
        <div className="filter-item">
          <span className="filter-label">Block</span>
          <Select
            placeholder="All Blocks"
            allowClear
            showSearch
            value={selectedBlock}
            onChange={setSelectedBlock}
            style={{ width: 200 }}
            disabled={!selectedDistrict}
            options={blocks.map((b) => ({ label: b, value: b }))}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          label="Total Schools"
          value={formatNum(summary?.totalSchools || '0')}
          icon={<TeamOutlined />}
        />
        <KPICard
          label="PBL Participation"
          value={totalRecords > 0 ? `${((conducted / totalRecords) * 100).toFixed(1)}` : '0'}
          suffix="%"
          icon={<CheckCircleOutlined />}
          previousValue={prevConducted}
          currentValue={conducted}
        />
        <KPICard
          label="Evidence Submission"
          value={totalRecords > 0 ? `${((evidence / totalRecords) * 100).toFixed(1)}` : '0'}
          suffix="%"
          icon={<FileProtectOutlined />}
          previousValue={prevEvidence}
          currentValue={evidence}
        />
        <KPICard
          label="Avg Attendance"
          value={`${(avgRate * 100).toFixed(1)}`}
          suffix="%"
          icon={<BarChartOutlined />}
          previousValue={prevRate ? prevRate * 100 : undefined}
          currentValue={avgRate * 100}
        />
        <KPICard
          label="Total Enrollment"
          value={formatNum(summary?.totalEnrollment || '0')}
          icon={<ReadOutlined />}
        />
        <KPICard
          label="On Track Schools"
          value={formatNum(summary?.onTrack || '0')}
          icon={<SafetyCertificateOutlined />}
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Attendance Trend */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>📈 Attendance Trend</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E8E0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E0E8E0' }}
                  formatter={(value: any) => [`${value}%`, 'Attendance']}
                />
                <Line
                  type="monotone"
                  dataKey="Attendance %"
                  stroke="#4CAF50"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#4CAF50' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Pie */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>🎯 Risk Distribution</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={riskPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={{ strokeWidth: 1 }}
                >
                  {riskPieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Participation Bar */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>📊 Monthly Participation & Evidence</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E8E0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E0E8E0' }} />
                <Legend />
                <Bar dataKey="Participation" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Evidence" fill="#81C784" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Bar */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>📉 Risk Status Counts</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riskBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E8E0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="status" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E0E8E0' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {riskBarData.map((entry, idx) => {
                    const colorMap: Record<string, string> = { 'On Track': '#4CAF50', 'Behind': '#FF9800', 'At Risk': '#F44336', 'Critical': '#9C27B0' };
                    return <Cell key={idx} fill={colorMap[entry.status] || '#ccc'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Engine */}
      <div style={{ marginBottom: 24 }}>
        <RiskEngine data={riskData} loading={loading} />
      </div>

      {/* Geographic Performance Tables */}
      <div className="charts-grid" style={{ marginBottom: 24 }}>
        <div className="dashboard-card">
          <div className="card-header">
            <h3>🏆 Top Performing Schools</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <Table
              dataSource={topSchools}
              columns={schoolColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        </div>
        <div className="dashboard-card">
          <div className="card-header">
            <h3>⚠️ Schools Needing Follow-up</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <Table
              dataSource={bottomSchools}
              columns={schoolColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        </div>
      </div>

      {/* Review Summary */}
      <ReviewSummary
        summary={summary}
        trends={trends}
        selectedMonth={selectedMonth}
        selectedDistrict={selectedDistrict}
      />
    </div>
  );
};

export default DashboardView;
