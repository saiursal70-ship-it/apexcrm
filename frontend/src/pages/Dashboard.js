import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import { getDashboardStats, createRecord } from '../api/api';
import { useAuth } from '../context/AuthContext';

// Helper Sparkline SVG Component
const MiniSparkline = ({ color = "#8b5cf6", id = "grad" }) => (
  <svg viewBox="0 0 160 40" className="sparkline-svg">
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={0.35} />
        <stop offset="100%" stopColor={color} stopOpacity={0.0} />
      </linearGradient>
    </defs>
    <path
      d="M 0,30 Q 20,24 40,16 T 80,22 T 120,8 T 160,4"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M 0,30 Q 20,24 40,16 T 80,22 T 120,8 T 160,4 L 160,40 L 0,40 Z"
      fill={`url(#${id})`}
    />
  </svg>
);

// Helper Circular Progress Ring Component for Tasks Overview
const CircularProgress = ({ percentage = 75 }) => {
  const radius = 48;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress-wrap">
      <svg height={radius * 2} width={radius * 2} className="circular-progress-svg">
        <circle
          stroke="rgba(255, 255, 255, 0.08)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#10b981"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.6s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </svg>
      <div className="circular-progress-text">
        <span className="progress-value">{percentage}%</span>
        <span className="progress-label">Completed</span>
      </div>
    </div>
  );
};

// Default Mock/Fallback Data for Charts
const defaultSalesOverview = [
  { month: 'Jan', thisYear: 8000, lastYear: 5000 },
  { month: 'Feb', thisYear: 18000, lastYear: 10000 },
  { month: 'Mar', thisYear: 28000, lastYear: 15000 },
  { month: 'Apr', thisYear: 24000, lastYear: 18000 },
  { month: 'May', thisYear: 38000, lastYear: 28000 },
  { month: 'Jun', thisYear: 45000, lastYear: 32000 },
  { month: 'Jul', thisYear: 58420, lastYear: 30000 },
  { month: 'Aug', thisYear: 48000, lastYear: 42000 },
  { month: 'Sep', thisYear: 54000, lastYear: 38000 },
  { month: 'Oct', thisYear: 42000, lastYear: 36000 },
  { month: 'Nov', thisYear: 52000, lastYear: 44000 },
  { month: 'Dec', thisYear: 62000, lastYear: 48000 },
];

const revenueSourceData = [
  { name: 'Website', value: 38, color: '#8b5cf6' },
  { name: 'Referral', value: 25, color: '#a855f7' },
  { name: 'Social Media', value: 18, color: '#f59e0b' },
  { name: 'Email Campaign', value: 12, color: '#10b981' },
  { name: 'Others', value: 7, color: '#06b6d4' },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Quick Action Modal state
  const [quickModal, setQuickModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      setError('Could not load dashboard stats. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const openQuickModal = (type) => {
    setQuickModal(type);
    if (type === 'lead') {
      setForm({ lead_name: '', company_name: '', email: '', phone: '', source: 'Website', lead_status: 'New' });
    } else if (type === 'deal') {
      setForm({ deal_name: '', account_name: '', value: '', stage: 'New Leads', probability: 50 });
    } else if (type === 'task') {
      setForm({ task_name: '', related_to: '', type: 'Call', priority: 'Medium', status: 'Pending' });
    }
  };

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const entityMap = { lead: 'leads', deal: 'deals', task: 'tasks' };
      await createRecord(entityMap[quickModal], form);
      setQuickModal(null);
      await fetchStats();
    } catch (err) {
      alert('Error creating record: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Process recent deals list
  const recentDeals = (stats?.topDeals && stats.topDeals.length > 0) 
    ? stats.topDeals.slice(0, 4).map((d, index) => {
        const icons = ['grid', 'phone', 'settings', 'users'];
        const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];
        const bgs = ['won', 'progress', 'proposal', 'negotiation'];
        return {
          id: d.id || index,
          name: d.deal_name || 'Deal Item',
          company: d.account_name || 'Account Client',
          amount: `₹${Number(d.value || 5000).toLocaleString('en-IN')}`,
          stage: d.stage || 'In Progress',
          stageClass: bgs[index % bgs.length],
          icon: icons[index % icons.length],
          color: colors[index % colors.length]
        };
      })
    : [
        { id: 1, name: 'Website Redesign', company: 'TechCorp Solutions', amount: '₹12,540', stage: 'Won', stageClass: 'won', icon: 'grid', color: '#8b5cf6' },
        { id: 2, name: 'Mobile App Development', company: 'DesignHub Agency', amount: '₹8,750', stage: 'In Progress', stageClass: 'progress', icon: 'phone', color: '#ec4899' },
        { id: 3, name: 'CRM Implementation', company: 'Global Innovations', amount: '₹6,980', stage: 'Proposal', stageClass: 'proposal', icon: 'settings', color: '#f59e0b' },
        { id: 4, name: 'Digital Marketing Campaign', company: 'Marketing Profs', amount: '₹5,430', stage: 'Negotiation', stageClass: 'negotiation', icon: 'users', color: '#06b6d4' }
      ];

  const totalRevDisplay = stats?.revenueThisMonth ? `₹${Number(stats.revenueThisMonth).toLocaleString('en-IN')}` : '₹5,84,200';
  const customersDisplay = stats?.totalLeads ? Number(stats.totalLeads).toLocaleString() : '1,265';
  const dealsDisplay = stats?.openOpportunities ? Number(stats.openOpportunities).toLocaleString() : '256';
  const winRateDisplay = stats?.winRate ? `${stats.winRate}%` : '24.6%';

  return (
    <Layout showAdd={false} searchValue={search} onSearchChange={setSearch}>
      <div className="apex-dashboard-container">
        
        {/* HEADER GREETING & QUICK ACTION TRIGGER BAR */}
        <div className="apex-dash-header">
          <div>
            <h1 className="greeting-title">{getGreeting()}, {user?.name || 'Alex'}! 👋</h1>
            <p className="greeting-sub">Here's what's happening with your business today.</p>
          </div>
          <div className="quick-add-pills">
            <button className="quick-pill-btn" onClick={() => openQuickModal('lead')}>
              <Icon name="plus" size={15} /> Lead
            </button>
            <button className="quick-pill-btn" onClick={() => openQuickModal('deal')}>
              <Icon name="plus" size={15} /> Deal
            </button>
            <button className="quick-pill-btn" onClick={() => openQuickModal('task')}>
              <Icon name="plus" size={15} /> Task
            </button>
          </div>
        </div>

        {loading && <p className="loading-text">Loading workspace metrics...</p>}
        {error && <p className="form-status error">{error}</p>}

        {/* TOP 4 METRIC KPI CARDS */}
        <div className="apex-kpi-grid">
          {/* CARD 1: Total Revenue */}
          <div className="apex-kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">Total Revenue</span>
              <div className="kpi-icon-badge badge-purple">
                <span className="currency-symbol">₹</span>
              </div>
            </div>
            <div className="kpi-value-row">
              <h2 className="kpi-number">{totalRevDisplay}</h2>
            </div>
            <div className="kpi-growth-row">
              <span className="growth-tag positive">↑ 12.5%</span>
              <span className="growth-sub">vs last month</span>
            </div>
            <MiniSparkline color="#8b5cf6" id="sparkRevenue" />
          </div>

          {/* CARD 2: New Customers / Total Leads */}
          <div className="apex-kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">New Customers</span>
              <div className="kpi-icon-badge badge-blue">
                <Icon name="users" size={18} />
              </div>
            </div>
            <div className="kpi-value-row">
              <h2 className="kpi-number">{customersDisplay}</h2>
            </div>
            <div className="kpi-growth-row">
              <span className="growth-tag positive">↑ 18.2%</span>
              <span className="growth-sub">vs last month</span>
            </div>
            <MiniSparkline color="#06b6d4" id="sparkCustomers" />
          </div>

          {/* CARD 3: Deals in Progress */}
          <div className="apex-kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">Deals in Progress</span>
              <div className="kpi-icon-badge badge-orange">
                <Icon name="target" size={18} />
              </div>
            </div>
            <div className="kpi-value-row">
              <h2 className="kpi-number">{dealsDisplay}</h2>
            </div>
            <div className="kpi-growth-row">
              <span className="growth-tag orange">↑ 8.7%</span>
              <span className="growth-sub">vs last month</span>
            </div>
            <MiniSparkline color="#f59e0b" id="sparkDeals" />
          </div>

          {/* CARD 4: Conversion Rate / Win Rate */}
          <div className="apex-kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">Conversion Rate</span>
              <div className="kpi-icon-badge badge-green">
                <Icon name="check" size={18} />
              </div>
            </div>
            <div className="kpi-value-row">
              <h2 className="kpi-number">{winRateDisplay}</h2>
            </div>
            <div className="kpi-growth-row">
              <span className="growth-tag positive">↑ 11.3%</span>
              <span className="growth-sub">vs last month</span>
            </div>
            <MiniSparkline color="#10b981" id="sparkConversion" />
          </div>
        </div>

        {/* MIDDLE SECTION GRID: Sales Overview & Revenue by Source */}
        <div className="apex-mid-grid">
          {/* Sales Overview Line Chart */}
          <div className="apex-card sales-overview-card">
            <div className="card-top-bar">
              <div>
                <h3 className="card-heading">Sales Overview</h3>
                <span className="card-subheading">This Year vs Last Year</span>
              </div>
              <div className="card-actions">
                <select className="chart-select-dropdown" defaultValue="This Year">
                  <option value="This Year">This Year</option>
                  <option value="Quarter">This Quarter</option>
                  <option value="Month">This Month</option>
                </select>
              </div>
            </div>

            <div className="chart-legend-pills">
              <div className="legend-pill">
                <span className="dot dot-purple"></span>
                <span>This Year <b>{totalRevDisplay}</b></span>
              </div>
              <div className="legend-pill">
                <span className="dot dot-blue"></span>
                <span>Last Year <b>₹4,85,600</b></span>
              </div>
            </div>

            <div className="chart-container-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={defaultSalesOverview} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', color: '#fff' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Line type="monotone" dataKey="thisYear" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', stroke: '#ffffff', strokeWidth: 2 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="lastYear" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Source Donut Chart */}
          <div className="apex-card revenue-source-card">
            <div className="card-top-bar">
              <h3 className="card-heading">Revenue by Source</h3>
            </div>

            <div className="donut-chart-layout">
              <div className="donut-wrapper">
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={revenueSourceData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {revenueSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center-info">
                  <span className="donut-amount">{totalRevDisplay}</span>
                  <span className="donut-label">Total</span>
                </div>
              </div>

              <div className="donut-legend-vertical">
                {revenueSourceData.map((item, idx) => (
                  <div className="legend-row" key={idx}>
                    <div className="legend-label-group">
                      <span className="legend-color-dot" style={{ background: item.color }}></span>
                      <span className="legend-name">{item.name}</span>
                    </div>
                    <span className="legend-pct">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION GRID: Recent Deals & Tasks Overview */}
        <div className="apex-bottom-grid">
          {/* Recent Deals Card */}
          <div className="apex-card recent-deals-card">
            <div className="card-top-bar">
              <h3 className="card-heading">Recent Deals</h3>
              <Link to="/deals" className="view-all-link">View All</Link>
            </div>

            <div className="recent-deals-list">
              {recentDeals.map((deal) => (
                <div className="deal-row-item" key={deal.id}>
                  <div className="deal-icon-box" style={{ background: `${deal.color}20`, color: deal.color }}>
                    <Icon name={deal.icon} size={18} />
                  </div>
                  <div className="deal-info">
                    <h4 className="deal-name">{deal.name}</h4>
                    <span className="deal-company">{deal.company}</span>
                  </div>
                  <div className="deal-amount-tag">{deal.amount}</div>
                  <div className={`deal-stage-pill pill-${deal.stageClass}`}>
                    {deal.stage}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Overview Card */}
          <div className="apex-card tasks-overview-card">
            <div className="card-top-bar">
              <h3 className="card-heading">Tasks Overview</h3>
              <Link to="/tasks" className="view-all-link">View All</Link>
            </div>

            <div className="tasks-overview-layout">
              <div className="tasks-gauge-section">
                <CircularProgress percentage={75} />
              </div>

              <div className="tasks-stats-grid">
                <div className="task-stat-item">
                  <span className="stat-dot dot-green"></span>
                  <span className="task-stat-label">Completed</span>
                  <span className="task-stat-val text-green">15</span>
                </div>
                <div className="task-stat-item">
                  <span className="stat-dot dot-blue"></span>
                  <span className="task-stat-label">In Progress</span>
                  <span className="task-stat-val text-blue">6</span>
                </div>
                <div className="task-stat-item">
                  <span className="stat-dot dot-amber"></span>
                  <span className="task-stat-label">Pending</span>
                  <span className="task-stat-val text-amber">4</span>
                </div>
                <div className="task-stat-item">
                  <span className="stat-dot dot-red"></span>
                  <span className="task-stat-label">Overdue</span>
                  <span className="task-stat-val text-red">2</span>
                </div>
              </div>
            </div>

            {/* Project Progress Bars */}
            <div className="project-progress-section">
              <div className="project-bar-row">
                <div className="project-bar-info">
                  <span>Project Alpha</span>
                  <b>78%</b>
                </div>
                <div className="project-bar-track">
                  <div className="project-bar-fill fill-purple" style={{ width: '78%' }}></div>
                </div>
              </div>

              <div className="project-bar-row">
                <div className="project-bar-info">
                  <span>Website Redesign</span>
                  <b>45%</b>
                </div>
                <div className="project-bar-track">
                  <div className="project-bar-fill fill-blue" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Modal */}
        {quickModal && (
          <div className="quick-modal-overlay" onClick={() => setQuickModal(null)}>
            <div className="quick-modal" onClick={(e) => e.stopPropagation()}>
              <div className="quick-modal-header">
                <h3>+ Add Quick {quickModal.toUpperCase()}</h3>
                <button className="icon-btn" onClick={() => setQuickModal(null)}>
                  <Icon name="close" size={18} />
                </button>
              </div>

              <form onSubmit={handleQuickSubmit}>
                {quickModal === 'lead' && (
                  <>
                    <div className="form-group">
                      <label>Lead Name *</label>
                      <input
                        type="text"
                        required
                        value={form.lead_name || ''}
                        onChange={(e) => setForm({ ...form, lead_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={form.company_name || ''}
                        onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {quickModal === 'deal' && (
                  <>
                    <div className="form-group">
                      <label>Deal Name *</label>
                      <input
                        type="text"
                        required
                        value={form.deal_name || ''}
                        onChange={(e) => setForm({ ...form, deal_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Value (₹) *</label>
                      <input
                        type="number"
                        required
                        value={form.value || ''}
                        onChange={(e) => setForm({ ...form, value: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {quickModal === 'task' && (
                  <>
                    <div className="form-group">
                      <label>Task Subject *</label>
                      <input
                        type="text"
                        required
                        value={form.task_name || ''}
                        onChange={(e) => setForm({ ...form, task_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={form.priority || 'Medium'}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Create'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setQuickModal(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Dashboard;
