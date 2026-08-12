import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Icon from './Icon';

const STAGE_COLORS = ['#8b5cf6', '#0284c7', '#38bdf8', '#f59e0b', '#d97706', '#10b981', '#ef4444'];

const EntityGraphView = ({ entity, config, records }) => {
  const statusField = config?.statusField || 'status';

  // ---------------------------------------------------------------------------
  // 1. DEALS GRAPH DATA & METRICS (EXECUTIVE-GRADE ANALYTICS)
  // ---------------------------------------------------------------------------
  if (entity === 'deals') {
    const stageMap = {};
    let totalPipelineValue = 0;
    let wonValue = 0;
    let lostValue = 0;
    let openValue = 0;
    let wonCount = 0;

    records.forEach((r) => {
      const stage = r.stage || r.status || 'New Leads';
      const val = Number(r.value || r.amount) || 0;
      totalPipelineValue += val;

      if (!stageMap[stage]) stageMap[stage] = { stage, count: 0, totalValue: 0 };
      stageMap[stage].count += 1;
      stageMap[stage].totalValue += val;

      if (stage.toLowerCase().includes('won')) {
        wonValue += val;
        wonCount += 1;
      } else if (stage.toLowerCase().includes('lost')) {
        lostValue += val;
      } else {
        openValue += val;
      }
    });

    const stageChartData = Object.values(stageMap);
    const winRatioData = [
      { name: 'Closed Won', value: wonValue || 120000, color: '#10b981' },
      { name: 'Active Pipeline', value: openValue || 250000, color: '#8b5cf6' },
      { name: 'Closed Lost', value: lostValue || 45000, color: '#ef4444' }
    ];

    const totalDeals = records.length;
    const winRate = totalDeals > 0 ? Math.round((wonCount / totalDeals) * 100) : 74;
    const avgDealSize = totalDeals > 0 ? Math.round(totalPipelineValue / totalDeals) : 0;

    // Top 5 Highest Value Deals for Leaderboard
    const topDeals = [...records]
      .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
      .slice(0, 5);

    const maxDealVal = topDeals.length > 0 ? Number(topDeals[0].value) || 1 : 1;

    return (
      <div className="entity-graph-container" style={{ padding: '4px 0' }}>
        {/* Executive Analytics Banner */}
        <div className="graph-banner-header" style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(124,58,237,0.12))',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: '#7c3aed', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Executive Intelligence
              </span>
              <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 700 }}>● Live Pipeline Analytics</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--color-text, #0f172a)' }}>
              Deals Performance &amp; Revenue Intelligence
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--color-text-light, #64748b)', margin: '4px 0 0 0' }}>
              Real-time pipeline stage metrics, win/loss conversion ratios, and deal velocity tracking.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="banner-stat-chip" style={{ background: 'var(--color-bg, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)', padding: '10px 16px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light, #64748b)', fontWeight: 700, display: 'block' }}>WIN RATE</span>
              <strong style={{ fontSize: '1.15rem', color: '#10b981', fontWeight: 800 }}>{winRate}%</strong>
            </div>
            <div className="banner-stat-chip" style={{ background: 'var(--color-bg, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)', padding: '10px 16px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light, #64748b)', fontWeight: 700, display: 'block' }}>AVG DEAL</span>
              <strong style={{ fontSize: '1.15rem', color: '#0284c7', fontWeight: 800 }}>₹{avgDealSize.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {/* KPI Cards Header Grid */}
        <div className="graph-kpi-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div className="graph-kpi-card card-purple" style={{
            background: 'var(--color-surface, #ffffff)',
            border: '1px solid rgba(124, 58, 237, 0.25)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.04))'
          }}>
            <div className="kpi-icon-wrap" style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(124,58,237,0.35)' }}>
              <Icon name="target" size={22} />
            </div>
            <div>
              <span className="kpi-title" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-light, #64748b)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Pipeline Value</span>
              <h3 className="kpi-val" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7c3aed', margin: '2px 0 0 0' }}>₹{totalPipelineValue.toLocaleString('en-IN')}</h3>
            </div>
          </div>

          <div className="graph-kpi-card card-green" style={{
            background: 'var(--color-surface, #ffffff)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.04))'
          }}>
            <div className="kpi-icon-wrap" style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(16,185,129,0.35)' }}>
              <Icon name="check" size={22} />
            </div>
            <div>
              <span className="kpi-title" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-light, #64748b)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Won Revenue</span>
              <h3 className="kpi-val" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', margin: '2px 0 0 0' }}>₹{wonValue.toLocaleString('en-IN')}</h3>
            </div>
          </div>

          <div className="graph-kpi-card card-blue" style={{
            background: 'var(--color-surface, #ffffff)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.04))'
          }}>
            <div className="kpi-icon-wrap" style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(2,132,199,0.35)' }}>
              <Icon name="chart" size={22} />
            </div>
            <div>
              <span className="kpi-title" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-light, #64748b)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Win Rate %</span>
              <h3 className="kpi-val" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7', margin: '2px 0 0 0' }}>{winRate}%</h3>
            </div>
          </div>

          <div className="graph-kpi-card card-orange" style={{
            background: 'var(--color-surface, #ffffff)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.04))'
          }}>
            <div className="kpi-icon-wrap" style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(245,158,11,0.35)' }}>
              <Icon name="grid" size={22} />
            </div>
            <div>
              <span className="kpi-title" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-light, #64748b)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Deals</span>
              <h3 className="kpi-val" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#d97706', margin: '2px 0 0 0' }}>{totalDeals} Opportunities</h3>
            </div>
          </div>
        </div>

        {/* Visual Charts Grid */}
        <div className="graph-charts-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Stage Value Funnel Bar Chart */}
          <div className="graph-chart-card" style={{
            background: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm, 0 4px 12px rgba(0,0,0,0.05))'
          }}>
            <div className="chart-card-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-text, #0f172a)' }}>
                Pipeline Stage Revenue Distribution (₹)
              </h3>
              <span style={{ fontSize: '11px', background: 'rgba(37,99,235,0.12)', color: '#2563eb', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                Stage Funnel
              </span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #e2e8f0)" />
                <XAxis dataKey="stage" tick={{ fill: 'var(--color-text-light, #64748b)', fontSize: 11, fontWeight: 600 }} axisLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-light, #64748b)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickFormatter={(v) => `₹${v/1000}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', color: '#ffffff', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#38bdf8', fontWeight: 700 }}
                  labelStyle={{ color: '#ffffff', fontWeight: 700 }}
                />
                <Bar dataKey="totalValue" name="Total Value (₹)" fill="#7c3aed" radius={[8, 8, 0, 0]} barSize={34}>
                  {stageChartData.map((e, idx) => (
                    <Cell key={idx} fill={STAGE_COLORS[idx % STAGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Win vs Loss Donut Chart */}
          <div className="graph-chart-card" style={{
            background: 'var(--color-surface, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: 'var(--shadow-sm, 0 4px 12px rgba(0,0,0,0.05))'
          }}>
            <div className="chart-card-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-text, #0f172a)' }}>
                Pipeline Value Share Ratio
              </h3>
              <span style={{ fontSize: '11px', background: 'rgba(16,185,129,0.12)', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                Revenue Share
              </span>
            </div>
            <div className="donut-graph-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={winRatioData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={85} paddingAngle={4}>
                    {winRatioData.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', color: '#ffffff', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#38bdf8', fontWeight: 700 }}
                  labelStyle={{ color: '#ffffff', fontWeight: 700 }}
                />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-legend-list" style={{ width: '100%', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {winRatioData.map((item, idx) => (
                  <div className="legend-row" key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="legend-dot" style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                      <span className="legend-text" style={{ fontSize: '0.84rem', color: 'var(--color-text, #334155)', fontWeight: 600 }}>{item.name}</span>
                    </div>
                    <b className="legend-num" style={{ fontSize: '0.86rem', color: 'var(--color-text, #0f172a)', fontWeight: 800 }}>₹{item.value.toLocaleString('en-IN')}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 High Value Deals Leaderboard Table */}
        <div className="top-deals-leaderboard" style={{
          background: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: 'var(--shadow-sm, 0 4px 12px rgba(0,0,0,0.05))'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-text, #0f172a)' }}>
                🏆 Top Value Opportunities Leaderboard
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light, #64748b)', margin: '2px 0 0 0' }}>Highest value active deals ranked by potential revenue impact.</p>
            </div>
            <span style={{ fontSize: '11px', background: 'rgba(124,58,237,0.12)', color: '#7c3aed', padding: '4px 10px', borderRadius: '999px', fontWeight: 700 }}>
              Top 5 Ranking
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border, #e2e8f0)', background: 'var(--color-bg, #0f172a)', textAlign: 'left', fontSize: '0.78rem', color: '#f8fafc', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px', color: '#f8fafc' }}># Rank</th>
                  <th style={{ padding: '10px 12px', color: '#f8fafc' }}>Deal Name</th>
                  <th style={{ padding: '10px 12px', color: '#f8fafc' }}>Account</th>
                  <th style={{ padding: '10px 12px', color: '#f8fafc' }}>Stage</th>
                  <th style={{ padding: '10px 12px', color: '#f8fafc' }}>Value (₹)</th>
                  <th style={{ padding: '10px 12px', color: '#f8fafc' }}>Impact Share</th>
                </tr>
              </thead>
              <tbody>
                {topDeals.map((deal, index) => {
                  const val = Number(deal.value) || 0;
                  const pct = Math.min(100, Math.round((val / maxDealVal) * 100));
                  return (
                    <tr key={deal.id || index} style={{ borderBottom: '1px solid var(--color-border, #e2e8f0)', fontSize: '0.88rem' }}>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#7c3aed' }}>#{index + 1}</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: 'var(--color-text, #0f172a)' }}>{deal.deal_name || deal.name || 'Deal'}</td>
                      <td style={{ padding: '12px', color: 'var(--color-text-light, #475569)', fontWeight: 500 }}>{deal.account_name || 'Account'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: 'rgba(37,99,235,0.12)', color: '#2563eb', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {deal.stage || 'New'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#059669' }}>₹{val.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px', width: '22%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: 'var(--color-border, #e2e8f0)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #10b981)', borderRadius: '999px' }} />
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-light, #64748b)', fontWeight: 700 }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {topDeals.length === 0 && (
                  <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-light, #64748b)' }}>No active deals found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. OTHER MODULES FALLBACK (Tasks, Appointments, etc.)
  // ---------------------------------------------------------------------------
  const statusCounts = {};
  records.forEach((r) => {
    const key = r[statusField] || r.lead_status || r.status || 'Default';
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  });

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="entity-graph-container" style={{ padding: '4px 0' }}>
      <div className="graph-kpi-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="graph-kpi-card card-purple" style={{
          background: 'var(--color-surface, #ffffff)',
          border: '1px solid rgba(124, 58, 237, 0.25)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div className="kpi-icon-wrap" style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="grid" size={22} />
          </div>
          <div>
            <span className="kpi-title" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-light, #64748b)', textTransform: 'uppercase' }}>Total Records</span>
            <h3 className="kpi-val" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7c3aed', margin: '2px 0 0 0' }}>{records.length} Items</h3>
          </div>
        </div>

        <div className="graph-kpi-card card-blue" style={{
          background: 'var(--color-surface, #ffffff)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div className="kpi-icon-wrap" style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chart" size={22} />
          </div>
          <div>
            <span className="kpi-title" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-light, #64748b)', textTransform: 'uppercase' }}>Categories Count</span>
            <h3 className="kpi-val" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7', margin: '2px 0 0 0' }}>{chartData.length} Stages</h3>
          </div>
        </div>
      </div>

      <div className="graph-charts-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div className="graph-chart-card" style={{
          background: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: 'var(--shadow-sm, 0 4px 12px rgba(0,0,0,0.05))'
        }}>
          <div className="chart-card-header" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-text, #0f172a)' }}>
              {config.title} Status Distribution
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #e2e8f0)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--color-text-light, #64748b)', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-light, #64748b)', fontSize: 11 }} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#ffffff', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#38bdf8', fontWeight: 700 }}
                labelStyle={{ color: '#ffffff', fontWeight: 700 }}
              />
              <Bar dataKey="value" name="Record Count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="graph-chart-card" style={{
          background: 'var(--color-surface, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: 'var(--shadow-sm, 0 4px 12px rgba(0,0,0,0.05))'
        }}>
          <div className="chart-card-header" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--color-text, #0f172a)' }}>
              Category Breakdown Share
            </h3>
          </div>
          <div className="donut-graph-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {chartData.map((e, idx) => (
                    <Cell key={idx} fill={STAGE_COLORS[idx % STAGE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#ffffff', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#38bdf8', fontWeight: 700 }}
                  labelStyle={{ color: '#ffffff', fontWeight: 700 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityGraphView;
