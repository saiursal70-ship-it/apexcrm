import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Icon from './Icon';

// Full 12-month dataset
const rawSalesDataset = [
  { month: 'Jan', thisYear: 18500, lastYear: 12000, deals: 8, avgDeal: 2312 },
  { month: 'Feb', thisYear: 28400, lastYear: 16500, deals: 12, avgDeal: 2366 },
  { month: 'Mar', thisYear: 39200, lastYear: 22000, deals: 17, avgDeal: 2305 },
  { month: 'Apr', thisYear: 34800, lastYear: 26000, deals: 15, avgDeal: 2320 },
  { month: 'May', thisYear: 49500, lastYear: 31000, deals: 21, avgDeal: 2357 },
  { month: 'Jun', thisYear: 58200, lastYear: 36500, deals: 26, avgDeal: 2238 },
  { month: 'Jul', thisYear: 67400, lastYear: 34000, deals: 29, avgDeal: 2324 },
  { month: 'Aug', thisYear: 61800, lastYear: 45000, deals: 27, avgDeal: 2288 },
  { month: 'Sep', thisYear: 72500, lastYear: 42000, deals: 31, avgDeal: 2338 },
  { month: 'Oct', thisYear: 59000, lastYear: 41000, deals: 24, avgDeal: 2458 },
  { month: 'Nov', thisYear: 68400, lastYear: 48000, deals: 28, avgDeal: 2442 },
  { month: 'Dec', thisYear: 84600, lastYear: 53500, deals: 36, avgDeal: 2350 },
];

// Custom Pulsating Active Dot
const ModernActiveDot = ({ cx, cy, stroke }) => {
  if (!cx || !cy) return null;
  return (
    <g>
      {/* Outer ambient glow pulse */}
      <circle cx={cx} cy={cy} r={12} fill={stroke} opacity={0.25} />
      {/* Middle halo */}
      <circle cx={cx} cy={cy} r={7} fill="#ffffff" stroke={stroke} strokeWidth={2.5} />
      {/* Center core */}
      <circle cx={cx} cy={cy} r={3.5} fill={stroke} />
    </g>
  );
};

// Custom Frosted Glassmorphism Tooltip
const CustomModernTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const thisYearItem = payload.find((p) => p.dataKey === 'thisYear');
  const lastYearItem = payload.find((p) => p.dataKey === 'lastYear');

  const thisYearVal = thisYearItem ? Number(thisYearItem.value) : 0;
  const lastYearVal = lastYearItem ? Number(lastYearItem.value) : 0;

  const diff = thisYearVal - lastYearVal;
  const pctGrowth = lastYearVal > 0 ? ((diff / lastYearVal) * 100).toFixed(1) : '100';
  const isPositive = diff >= 0;

  return (
    <div className="modern-chart-tooltip">
      <div className="tooltip-header">
        <span className="tooltip-month">{label} Performance</span>
        <span className="tooltip-badge">Monthly Audit</span>
      </div>

      <div className="tooltip-metrics">
        {thisYearItem && (
          <div className="tooltip-row this-year">
            <div className="tooltip-label-wrap">
              <span className="tooltip-dot dot-violet"></span>
              <span className="tooltip-label">Current Period</span>
            </div>
            <span className="tooltip-val">₹{thisYearVal.toLocaleString('en-IN')}</span>
          </div>
        )}

        {lastYearItem && (
          <div className="tooltip-row last-year">
            <div className="tooltip-label-wrap">
              <span className="tooltip-dot dot-cyan"></span>
              <span className="tooltip-label">Previous Year</span>
            </div>
            <span className="tooltip-val">₹{lastYearVal.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {thisYearItem && lastYearItem && (
        <div className={`tooltip-growth-bar ${isPositive ? 'positive' : 'negative'}`}>
          <div className="growth-indicator">
            <Icon name={isPositive ? 'check' : 'close'} size={12} />
            <span>
              {isPositive ? '+' : ''}₹{Math.abs(diff).toLocaleString('en-IN')} ({isPositive ? '+' : ''}{pctGrowth}%)
            </span>
          </div>
          <span className="growth-subtext">YoY Variance</span>
        </div>
      )}
    </div>
  );
};

const ModernSalesChart = ({ liveTotalRevenue = null }) => {
  const [timeRange, setTimeRange] = useState('12M'); // '12M', '6M', '3M', '30D'
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'
  const [showThisYear, setShowThisYear] = useState(true);
  const [showLastYear, setShowLastYear] = useState(true);

  // Filter dataset based on time range
  const chartData = useMemo(() => {
    switch (timeRange) {
      case '30D':
      case '3M':
        return rawSalesDataset.slice(9, 12);
      case '6M':
        return rawSalesDataset.slice(6, 12);
      case '12M':
      default:
        return rawSalesDataset;
    }
  }, [timeRange]);

  // Aggregate statistics for selected timeframe
  const summaryStats = useMemo(() => {
    const totalThisYear = chartData.reduce((acc, curr) => acc + curr.thisYear, 0);
    const totalLastYear = chartData.reduce((acc, curr) => acc + curr.lastYear, 0);
    const growth = totalLastYear > 0 ? (((totalThisYear - totalLastYear) / totalLastYear) * 100).toFixed(1) : '24.8';
    
    // Find peak month
    let peak = chartData[0];
    chartData.forEach((item) => {
      if (item.thisYear > peak.thisYear) peak = item;
    });

    return {
      totalThisYear,
      totalLastYear,
      growth,
      peakMonth: peak.month,
      peakValue: peak.thisYear,
      avgMonthly: Math.round(totalThisYear / chartData.length)
    };
  }, [chartData]);

  const displayTotal = (liveTotalRevenue && liveTotalRevenue !== '₹0')
    ? liveTotalRevenue
    : `₹${summaryStats.totalThisYear.toLocaleString('en-IN')}`;

  return (
    <div className="modern-sales-card">
      {/* Top Header Bar */}
      <div className="modern-card-header">
        <div className="header-left">
          <div className="title-row">
            <h3 className="chart-main-title">Sales Overview</h3>
            <span className="live-pulse-badge">
              <span className="pulse-dot"></span>
              Live Pipeline
            </span>
          </div>
          <p className="chart-sub-text">Comparative revenue analytics &amp; performance projection</p>
        </div>

        {/* Action Controls & Granularity Switcher */}
        <div className="header-right-controls">
          {/* Chart Type Toggle (Area vs Bar) */}
          <div className="segmented-chart-type">
            <button
              type="button"
              className={`type-btn ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
              title="Spline Area Curve"
            >
              <Icon name="chart" size={14} />
              <span>Spline</span>
            </button>
            <button
              type="button"
              className={`type-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
              title="Volume Bars"
            >
              <Icon name="kanban" size={14} />
              <span>Bars</span>
            </button>
          </div>

          {/* Timeframe Pill Tabs */}
          <div className="timeframe-pill-group">
            {['12M', '6M', '3M'].map((range) => (
              <button
                key={range}
                type="button"
                className={`time-pill ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="modern-kpi-strip">
        <div className="kpi-block main-rev">
          <span className="kpi-caption">Current Revenue</span>
          <div className="kpi-val-wrap">
            <span className="kpi-val">{displayTotal}</span>
            <span className="kpi-trend-pill positive">
              ↑ +{summaryStats.growth}% YoY
            </span>
          </div>
        </div>

        <div className="kpi-block-divider"></div>

        <div className="kpi-block peak-stat">
          <span className="kpi-caption">Peak Velocity Month</span>
          <div className="kpi-val-wrap">
            <span className="kpi-val-sm">{summaryStats.peakMonth}</span>
            <span className="kpi-sub-chip">₹{summaryStats.peakValue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="kpi-block-divider"></div>

        <div className="kpi-block avg-stat">
          <span className="kpi-caption">Monthly Average</span>
          <div className="kpi-val-wrap">
            <span className="kpi-val-sm">₹{summaryStats.avgMonthly.toLocaleString('en-IN')}</span>
            <span className="kpi-sub-chip">Target Met</span>
          </div>
        </div>
      </div>

      {/* Interactive Legend Toggles */}
      <div className="interactive-legend-bar">
        <button
          type="button"
          className={`legend-toggle-pill ${showThisYear ? 'active' : 'muted'}`}
          onClick={() => setShowThisYear(!showThisYear)}
        >
          <span className="legend-indicator dot-violet"></span>
          <span className="legend-text">
            Current Period: <b>₹{summaryStats.totalThisYear.toLocaleString('en-IN')}</b>
          </span>
        </button>

        <button
          type="button"
          className={`legend-toggle-pill ${showLastYear ? 'active' : 'muted'}`}
          onClick={() => setShowLastYear(!showLastYear)}
        >
          <span className="legend-indicator dot-cyan"></span>
          <span className="legend-text">
            Benchmark (Last Year): <b>₹{summaryStats.totalLastYear.toLocaleString('en-IN')}</b>
          </span>
        </button>
      </div>

      {/* Main Chart Canvas */}
      <div className="modern-chart-canvas-wrap">
        <ResponsiveContainer width="100%" height={290}>
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 20, right: 15, left: -15, bottom: 0 }}>
              <defs>
                {/* Series 1: Vibrant Violet / Indigo Neon Gradient */}
                <linearGradient id="areaGradientViolet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.48} />
                  <stop offset="60%" stopColor="#6366f1" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>

                {/* Series 2: Electric Cyan / Sky Glow Gradient */}
                <linearGradient id="areaGradientCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="70%" stopColor="#0ea5e9" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>

                {/* Ambient glow filter */}
                <filter id="neonGlowViolet" height="130%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="var(--chart-grid-stroke, rgba(148, 163, 184, 0.15))"
              />

              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--chart-axis-text, #64748b)', fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />

              <YAxis
                tick={{ fill: 'var(--chart-axis-text, #64748b)', fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
                dx={-4}
              />

              <Tooltip
                content={<CustomModernTooltip />}
                cursor={{
                  stroke: 'rgba(139, 92, 246, 0.35)',
                  strokeWidth: 1.5,
                  strokeDasharray: '4 4'
                }}
              />

              {/* Benchmark Line (Last Year) */}
              {showLastYear && (
                <Area
                  type="monotone"
                  dataKey="lastYear"
                  name="Last Year"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#areaGradientCyan)"
                  dot={{ r: 3.5, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={<ModernActiveDot stroke="#06b6d4" />}
                />
              )}

              {/* Current Period Line (This Year) */}
              {showThisYear && (
                <Area
                  type="monotone"
                  dataKey="thisYear"
                  name="This Year"
                  stroke="#8b5cf6"
                  strokeWidth={3.5}
                  fillOpacity={1}
                  fill="url(#areaGradientViolet)"
                  dot={{ r: 4, fill: '#8b5cf6', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={<ModernActiveDot stroke="#8b5cf6" />}
                />
              )}
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 20, right: 15, left: -15, bottom: 0 }} barGap={8}>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="var(--chart-grid-stroke, rgba(148, 163, 184, 0.15))"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--chart-axis-text, #64748b)', fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                tick={{ fill: 'var(--chart-axis-text, #64748b)', fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
                dx={-4}
              />
              <Tooltip content={<CustomModernTooltip />} />

              {showLastYear && (
                <Bar
                  dataKey="lastYear"
                  name="Last Year"
                  fill="#06b6d4"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={22}
                />
              )}

              {showThisYear && (
                <Bar
                  dataKey="thisYear"
                  name="This Year"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={22}
                />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ModernSalesChart;
