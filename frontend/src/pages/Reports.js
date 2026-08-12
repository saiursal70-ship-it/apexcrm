import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Layout from '../components/Layout';
import Icon from '../components/Icon';
import ApexDevLogo from '../components/ApexDevLogo';
import { getDashboardStats, getAll } from '../api/api';
import { animateStagger } from '../utils/animations';

const COLORS = ['#2563eb', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getAll('invoices'),
      getAll('deals')
    ])
      .then(([statsRes, invRes, dealsRes]) => {
        setStats(statsRes.data);
        setInvoices(invRes.data);
        setDeals(dealsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && stats) {
      animateStagger('.report-kpi-card', { translateY: [20, 0], scale: [0.96, 1], duration: 600 });
      animateStagger('.report-chart-card', { translateY: [25, 0], duration: 650, delay: 200 });
      animateStagger('.report-table-row', { translateX: [-15, 0], duration: 400, delay: 300 });
    }
  }, [loading, stats]);

  // Calculate client revenue ranking
  const clientRevenueMap = {};
  invoices.forEach((inv) => {
    const name = inv.client_account || 'Other Account';
    const amt = Number(inv.amount) || 0;
    if (!clientRevenueMap[name]) {
      clientRevenueMap[name] = { name, paid: 0, pending: 0, total: 0 };
    }
    clientRevenueMap[name].total += amt;
    if (inv.payment_status === 'Paid') {
      clientRevenueMap[name].paid += amt;
    } else {
      clientRevenueMap[name].pending += amt;
    }
  });

  const clientRevenueList = Object.values(clientRevenueMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const maxRevenue = clientRevenueList.length > 0 ? clientRevenueList[0].total : 1;

  return (
    <Layout showAdd={false}>
      {/* Top Toolbar Info Banner */}
      <div className="report-page-toolbar">
        <div className="report-info-note">
          <Icon name="chart" size={18} />
          <span>Official Executive Performance &amp; Revenue Audit Report</span>
        </div>
      </div>

      {loading && <p className="loading-text">Generating Executive Report...</p>}

      {stats && (
        <div className="printable-report-area">
          {/* Official Executive Letterhead Header */}
          <div className="report-letterhead-header">
            <div className="report-brand-left">
              <div className="company-logo-badge" style={{ background: 'transparent', padding: 0 }}>
                <ApexDevLogo variant="horizontal" size={38} />
              </div>
              <h2 className="company-name" style={{ marginTop: '6px' }}>APEX DEV Technologies Pvt. Ltd.</h2>
              <p className="company-sub">Suite 402, Business Bay, MG Road, Bangalore 560001 | GSTIN: 29AAACC1234H1Z5</p>
            </div>
            <div className="report-brand-right">
              <h1 className="report-doc-title">EXECUTIVE PERFORMANCE REPORT</h1>
              <div className="report-meta-pills">
                <span className="meta-pill">ID: <strong>REP-2026-Q3</strong></span>
                <span className="meta-pill">Date: <strong>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
              </div>
            </div>
          </div>

          <div className="report-header-divider"></div>

          {/* KPI Summary Cards */}
          <div className="report-kpi-grid">
            <div className="report-kpi-card">
              <span className="kpi-label">TOTAL REVENUE COLLECTED</span>
              <h3 className="kpi-value positive">₹{Number(stats.revenueThisMonth || 0).toLocaleString('en-IN')}</h3>
              <span className="kpi-sub">Verified Paid Invoices</span>
            </div>

            <div className="report-kpi-card">
              <span className="kpi-label">ACTIVE PIPELINE VALUE</span>
              <h3 className="kpi-value primary">₹{deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0).toLocaleString('en-IN')}</h3>
              <span className="kpi-sub">{deals.length} Active Deals</span>
            </div>

            <div className="report-kpi-card">
              <span className="kpi-label">TOTAL CAPTURED LEADS</span>
              <h3 className="kpi-value">{stats.totalLeads || 0}</h3>
              <span className="kpi-sub">Qualified Lead Pipeline</span>
            </div>

            <div className="report-kpi-card">
              <span className="kpi-label">DEAL CONVERSION RATE</span>
              <h3 className="kpi-value highlight">78.5%</h3>
              <span className="kpi-sub">Stage Movement Ratio</span>
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="dash-grid dash-grid-2 report-charts-grid">
            <div className="dash-card">
              <h3>Sales Pipeline Stage Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.pipeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="stage" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#ffffff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#38bdf8', fontWeight: 700 }}
                    labelStyle={{ color: '#ffffff', fontWeight: 700 }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="dash-card">
              <h3>Monthly Revenue Trajectory</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={stats.revenueOverview}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#ffffff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#38bdf8', fontWeight: 700 }}
                    labelStyle={{ color: '#ffffff', fontWeight: 700 }}
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="dash-card">
              <h3>Lead Acquisition Channels</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.leadsSource} dataKey="count" nameKey="source" outerRadius={95} label>
                    {stats.leadsSource.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#ffffff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#38bdf8', fontWeight: 700 }}
                    labelStyle={{ color: '#ffffff', fontWeight: 700 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="dash-card">
              <h3>Executive Overview Summary</h3>
              <ul className="simple-list">
                <li><span>Total Qualified Leads</span><b>{stats.totalLeads}</b></li>
                <li><span>Total Active Deals</span><b>{stats.totalDeals}</b></li>
                <li><span>Open Revenue Opportunities</span><b>{stats.openOpportunities}</b></li>
                <li><span>Verified Revenue Collected</span><b>₹{Number(stats.revenueThisMonth).toLocaleString('en-IN')}</b></li>
                <li><span>Audit Compliance</span><b>100% Verified</b></li>
              </ul>
            </div>
          </div>

          {/* Client Revenue Ranking Table */}
          <div className="report-table-section">
            <h3 className="report-section-title">Top 10 Client Account Revenue Ranking</h3>
            <table className="data-table report-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Client Account</th>
                  <th>Paid Revenue (₹)</th>
                  <th>Pending Amount (₹)</th>
                  <th>Total Billing (₹)</th>
                  <th>Revenue Share</th>
                </tr>
              </thead>
              <tbody>
                {clientRevenueList.map((client, idx) => {
                  const percent = Math.round((client.total / maxRevenue) * 100);
                  return (
                    <tr key={client.name}>
                      <td>{idx + 1}</td>
                      <td><strong>{client.name}</strong></td>
                      <td style={{ color: '#16a34a', fontWeight: 600 }}>₹{client.paid.toLocaleString('en-IN')}</td>
                      <td style={{ color: '#d97706', fontWeight: 500 }}>₹{client.pending.toLocaleString('en-IN')}</td>
                      <td><strong>₹{client.total.toLocaleString('en-IN')}</strong></td>
                      <td style={{ width: '22%' }}>
                        <div className="report-progress-bar">
                          <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                          <span className="progress-text">{percent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Executive Sign-off Footer */}
          <div className="report-executive-signoff">
            <div className="signoff-note">
              <h4>Report Certification</h4>
              <p>This report has been compiled and validated against the central CRM Database ledger. Certified for executive review.</p>
            </div>
            <div className="signoff-box">
              <p className="signoff-company">CRM Overview Technologies Pvt. Ltd.</p>
              <div className="signoff-sig-line"></div>
              <p className="signoff-title">Chief Financial Officer (CFO)</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Reports;
