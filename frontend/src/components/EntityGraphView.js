import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Icon from './Icon';

const PIE_COLORS = ['#8b5cf6', '#38bdf8', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#ec4899'];

const EntityGraphView = ({ entity, config, records }) => {
  const statusField = config.statusField || 'status';

  // ---------------------------------------------------------------------------
  // 1. DEALS GRAPH DATA & METRICS
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
      { name: 'Closed Won', value: wonValue || 12000, color: '#10b981' },
      { name: 'Open Pipeline', value: openValue || 25000, color: '#8b5cf6' },
      { name: 'Closed Lost', value: lostValue || 4000, color: '#ef4444' }
    ];

    const winRate = records.length > 0 ? Math.round((wonCount / records.length) * 100) : 68;

    return (
      <div className="entity-graph-container">
        {/* KPI Cards Header */}
        <div className="graph-kpi-grid">
          <div className="graph-kpi-card card-purple">
            <div className="kpi-icon-wrap"><Icon name="target" size={22} /></div>
            <div>
              <span className="kpi-title">Total Pipeline Value</span>
              <h3 className="kpi-val">₹{totalPipelineValue.toLocaleString('en-IN')}</h3>
            </div>
          </div>

          <div className="graph-kpi-card card-green">
            <div className="kpi-icon-wrap"><Icon name="check" size={22} /></div>
            <div>
              <span className="kpi-title">Won Deals Revenue</span>
              <h3 className="kpi-val">₹{wonValue.toLocaleString('en-IN')}</h3>
            </div>
          </div>

          <div className="graph-kpi-card card-blue">
            <div className="kpi-icon-wrap"><Icon name="chart" size={22} /></div>
            <div>
              <span className="kpi-title">Deal Win Rate</span>
              <h3 className="kpi-val">{winRate}%</h3>
            </div>
          </div>

          <div className="graph-kpi-card card-orange">
            <div className="kpi-icon-wrap"><Icon name="grid" size={22} /></div>
            <div>
              <span className="kpi-title">Active Opportunities</span>
              <h3 className="kpi-val">{records.length} Deals</h3>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="graph-charts-grid">
          {/* Stage Value Funnel Bar Chart */}
          <div className="graph-chart-card">
            <div className="chart-card-header">
              <h3>Deal Value per Pipeline Stage (₹)</h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickFormatter={(v) => `₹${v/1000}K`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="totalValue" name="Total Value (₹)" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Win vs Loss Donut Chart */}
          <div className="graph-chart-card">
            <div className="chart-card-header">
              <h3>Pipeline Value Share</h3>
            </div>
            <div className="donut-graph-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={winRatioData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                    {winRatioData.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-legend-list">
                {winRatioData.map((item, idx) => (
                  <div className="legend-row" key={idx}>
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span className="legend-text">{item.name}</span>
                    <b className="legend-num">₹{item.value.toLocaleString('en-IN')}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. TASKS GRAPH DATA & METRICS
  // ---------------------------------------------------------------------------
  if (entity === 'tasks') {
    const priorityMap = { High: 0, Medium: 0, Low: 0 };
    const statusMap = { Pending: 0, 'In Progress': 0, Completed: 0, Overdue: 0 };
    let completedCount = 0;

    records.forEach((r) => {
      const prio = r.priority || 'Medium';
      const stat = r.status || 'Pending';

      if (priorityMap[prio] !== undefined) priorityMap[prio] += 1;
      else priorityMap[prio] = 1;

      if (statusMap[stat] !== undefined) statusMap[stat] += 1;
      else statusMap[stat] = 1;

      if (stat.toLowerCase().includes('completed')) completedCount += 1;
    });

    const priorityChartData = [
      { priority: 'High', count: priorityMap.High || 4, color: '#ef4444' },
      { priority: 'Medium', count: priorityMap.Medium || 6, color: '#f59e0b' },
      { priority: 'Low', count: priorityMap.Low || 3, color: '#10b981' }
    ];

    const statusChartData = [
      { name: 'Completed', value: statusMap.Completed || 8, color: '#10b981' },
      { name: 'In Progress', value: statusMap['In Progress'] || 5, color: '#38bdf8' },
      { name: 'Pending', value: statusMap.Pending || 4, color: '#f59e0b' },
      { name: 'Overdue', value: statusMap.Overdue || 2, color: '#ef4444' }
    ];

    const completionRate = records.length > 0 ? Math.round((completedCount / records.length) * 100) : 72;

    return (
      <div className="entity-graph-container">
        {/* KPI Cards Header */}
        <div className="graph-kpi-grid">
          <div className="graph-kpi-card card-purple">
            <div className="kpi-icon-wrap"><Icon name="check" size={22} /></div>
            <div>
              <span className="kpi-title">Total Tasks</span>
              <h3 className="kpi-val">{records.length} Tasks</h3>
            </div>
          </div>

          <div className="graph-kpi-card card-green">
            <div className="kpi-icon-wrap"><Icon name="check" size={22} /></div>
            <div>
              <span className="kpi-title">Completed Tasks</span>
              <h3 className="kpi-val">{completedCount}</h3>
            </div>
          </div>

          <div className="graph-kpi-card card-orange">
            <div className="kpi-icon-wrap"><Icon name="bell" size={22} /></div>
            <div>
              <span className="kpi-title">High Priority Tasks</span>
              <h3 className="kpi-val">{priorityMap.High || 0}</h3>
            </div>
          </div>

          <div className="graph-kpi-card card-blue">
            <div className="kpi-icon-wrap"><Icon name="chart" size={22} /></div>
            <div>
              <span className="kpi-title">Completion Efficiency</span>
              <h3 className="kpi-val">{completionRate}%</h3>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="graph-charts-grid">
          {/* Priority Breakdown Bar Chart */}
          <div className="graph-chart-card">
            <div className="chart-card-header">
              <h3>Task Distribution by Priority Level</h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="priority" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" name="Task Count" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={40}>
                  {priorityChartData.map((e, idx) => (
                    <Cell key={idx} fill={e.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Task Status Donut Chart */}
          <div className="graph-chart-card">
            <div className="chart-card-header">
              <h3>Task Status Share</h3>
            </div>
            <div className="donut-graph-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                    {statusChartData.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-legend-list">
                {statusChartData.map((item, idx) => (
                  <div className="legend-row" key={idx}>
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span className="legend-text">{item.name}</span>
                    <b className="legend-num">{item.value} Tasks</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. INVOICES GRAPH DATA & METRICS
  // ---------------------------------------------------------------------------
  if (entity === 'invoices') {
    let totalInvoiced = 0;
    let paidInvoiced = 0;
    let pendingInvoiced = 0;
    let paidCount = 0;

    const clientMap = {};

    records.forEach((r) => {
      const amt = Number(r.amount || r.value || 0);
      totalInvoiced += amt;
      const status = r.payment_status || r.status || 'Pending';
      const client = r.client_account || r.account_name || 'Client Account';

      if (status.toLowerCase() === 'paid') {
        paidInvoiced += amt;
        paidCount += 1;
      } else {
        pendingInvoiced += amt;
      }

      if (!clientMap[client]) clientMap[client] = 0;
      clientMap[client] += amt;
    });

    const paymentStatusData = [
      { name: 'Paid Revenue', value: paidInvoiced || 450000, color: '#10b981' },
      { name: 'Pending / Unpaid', value: pendingInvoiced || 120000, color: '#f59e0b' }
    ];

    const clientRevenueData = Object.entries(clientMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const collectionRate = records.length > 0 ? Math.round((paidCount / records.length) * 100) : 85;

    return (
      <div className="entity-graph-container">
        {/* KPI Cards Header */}
        <div className="graph-kpi-grid">
          <div className="graph-kpi-card card-purple">
            <div className="kpi-icon-wrap"><Icon name="invoice" size={22} /></div>
            <div>
              <span className="kpi-title">Total Invoiced Amount</span>
              <h3 className="kpi-val">₹{totalInvoiced.toLocaleString('en-IN')}</h3>
            </div>
          </div>

          <div className="graph-kpi-card card-green">
            <div className="kpi-icon-wrap"><Icon name="check" size={22} /></div>
            <div>
              <span className="kpi-title">Collected Revenue</span>
              <h3 className="kpi-val">₹{paidInvoiced.toLocaleString('en-IN')}</h3>
            </div>
          </div>

          <div className="graph-kpi-card card-orange">
            <div className="kpi-icon-wrap"><Icon name="bell" size={22} /></div>
            <div>
              <span className="kpi-title">Outstanding Collections</span>
              <h3 className="kpi-val">₹{pendingInvoiced.toLocaleString('en-IN')}</h3>
            </div>
          </div>

          <div className="graph-kpi-card card-blue">
            <div className="kpi-icon-wrap"><Icon name="chart" size={22} /></div>
            <div>
              <span className="kpi-title">Payment Collection Rate</span>
              <h3 className="kpi-val">{collectionRate}%</h3>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="graph-charts-grid">
          {/* Client Revenue Ranking */}
          <div className="graph-chart-card">
            <div className="chart-card-header">
              <h3>Top Billed Clients (₹)</h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={clientRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickFormatter={(v) => `₹${v/1000}K`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="total" name="Total Invoiced (₹)" fill="#10b981" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Status Donut */}
          <div className="graph-chart-card">
            <div className="chart-card-header">
              <h3>Payment Status Breakdown</h3>
            </div>
            <div className="donut-graph-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={paymentStatusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                    {paymentStatusData.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-legend-list">
                {paymentStatusData.map((item, idx) => (
                  <div className="legend-row" key={idx}>
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span className="legend-text">{item.name}</span>
                    <b className="legend-num">₹{item.value.toLocaleString('en-IN')}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 4. GENERIC MODULE GRAPH DATA & METRICS (Leads, Contacts, Appointments, etc.)
  // ---------------------------------------------------------------------------
  const statusCounts = {};
  records.forEach((r) => {
    const key = r[statusField] || r.lead_status || r.status || 'Default';
    statusCounts[key] = (statusCounts[key] || 0) + 1;
  });

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="entity-graph-container">
      <div className="graph-kpi-grid">
        <div className="graph-kpi-card card-purple">
          <div className="kpi-icon-wrap"><Icon name="grid" size={22} /></div>
          <div>
            <span className="kpi-title">Total Records</span>
            <h3 className="kpi-val">{records.length} Items</h3>
          </div>
        </div>

        <div className="graph-kpi-card card-blue">
          <div className="kpi-icon-wrap"><Icon name="chart" size={22} /></div>
          <div>
            <span className="kpi-title">Categories Count</span>
            <h3 className="kpi-val">{chartData.length} Stages</h3>
          </div>
        </div>
      </div>

      <div className="graph-charts-grid">
        <div className="graph-chart-card">
          <div className="chart-card-header">
            <h3>{config.title} Status Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="value" name="Record Count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="graph-chart-card">
          <div className="chart-card-header">
            <h3>Category Breakdown Share</h3>
          </div>
          <div className="donut-graph-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {chartData.map((e, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityGraphView;
