import { useState, useEffect } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
} from 'chart.js'
import { fetchStats } from '../services/api'
import { useTheme } from '../context/ThemeContext'
import './Stats.css'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip,
  Legend, ArcElement, PointElement, LineElement, Filler
)

const BATCHES = ['2026', '2025', '2024']

export default function StatsPage() {
  const { theme } = useTheme()
  const [stats, setStats] = useState(null)
  const [batch, setBatch] = useState('2026')
  const [loading, setLoading] = useState(true)
  const isDark = theme === 'dark'

  useEffect(() => {
    setLoading(true)
    fetchStats(batch)
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [batch])

  const tooltipDefaults = {
    backgroundColor: isDark ? '#1c1c1a' : '#fff',
    titleColor: isDark ? '#f0ede6' : '#1a1916',
    bodyColor: isDark ? '#a8a49a' : '#5a5850',
    borderColor: isDark ? '#2e2e2a' : '#e2e0d6',
    borderWidth: 1,
    padding: 10,
  }

  const gridColor = isDark ? '#2e2e2a' : '#f0efe9'
  const tickColor = isDark ? '#a8a49a' : '#5a5850'
  const axisStyle = { color: tickColor, font: { family: 'DM Sans', size: 12 } }

  // Branch chart
  const branchData = {
    labels: Object.keys(stats?.branchWise || {}),
    datasets: [{
      label: 'Students Placed',
      data: Object.values(stats?.branchWise || {}),
      backgroundColor: isDark
        ? ['rgba(77,123,239,0.8)', 'rgba(61,184,118,0.8)', 'rgba(245,166,35,0.8)', 'rgba(240,112,96,0.8)', 'rgba(140,100,255,0.8)']
        : ['rgba(42,82,190,0.82)', 'rgba(26,122,74,0.82)', 'rgba(181,106,0,0.82)', 'rgba(194,59,34,0.82)', 'rgba(110,70,220,0.82)'],
      borderRadius: 8,
    }]
  }

  // Doughnut — drive types
  const typeLabels = Object.keys(stats?.driveTypes || {})
  const typeData = {
    labels: typeLabels,
    datasets: [{
      data: Object.values(stats?.driveTypes || {}),
      backgroundColor: isDark
        ? ['#4d7bef', '#3db876', '#f5a623', '#f07060']
        : ['#2a52be', '#1a7a4a', '#b56a00', '#c23b22'],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  }

  // Monthly trend line
  const sortedMonths = Object.entries(stats?.monthlyTrend || {}).sort(([a], [b]) => a.localeCompare(b))
  const monthData = {
    labels: sortedMonths.map(([m]) => {
      const [y, mo] = m.split('-')
      return new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' })
    }),
    datasets: [{
      label: 'Students Placed',
      data: sortedMonths.map(([, v]) => v),
      borderColor: isDark ? '#4d7bef' : '#2a52be',
      backgroundColor: isDark ? 'rgba(77,123,239,0.12)' : 'rgba(42,82,190,0.08)',
      borderWidth: 2,
      pointBackgroundColor: isDark ? '#4d7bef' : '#2a52be',
      pointRadius: 4,
      tension: 0.4,
      fill: true,
    }]
  }

  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: tooltipDefaults },
    scales: {
      y: { beginAtZero: true, grid: { color: gridColor }, ticks: axisStyle },
      x: { grid: { display: false }, ticks: axisStyle }
    }
  }

  // Doughnut — application breakdown
  const appBreakdown = stats?.applicationBreakdown || {};
  const appLabels = Object.keys(appBreakdown);
  const appData = {
    labels: appLabels,
    datasets: [{
      data: Object.values(appBreakdown),
      backgroundColor: isDark
        ? ['#4d7bef', '#3db876', '#f5a623', '#8c64ff', '#3b82f6', '#f07060']
        : ['#2a52be', '#1a7a4a', '#b56a00', '#6e46dc', '#3b82f6', '#c23b22'],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  }

  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: tooltipDefaults },
    scales: {
      y: { beginAtZero: true, grid: { color: gridColor }, ticks: axisStyle },
      x: { grid: { display: false }, ticks: axisStyle }
    }
  }

  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: tickColor, font: { family: 'DM Sans', size: 12 }, padding: 16, boxWidth: 12 }
      },
      tooltip: tooltipDefaults
    },
    cutout: '62%'
  }

  return (
    <div className="stats-page">
      <div className="page-header">
        <div>
          <h1>Statistics</h1>
          <p>Placement analytics and trends</p>
        </div>
        <div className="batch-tabs">
          {BATCHES.map(b => (
            <button
              key={b}
              className={`batch-tab ${batch === b ? 'active' : ''}`}
              onClick={() => setBatch(b)}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="stats-loading">Loading statistics…</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="summary-grid">
            <div className="summary-card accent">
              <p className="sum-label">Total Placed</p>
              <p className="sum-val">{stats?.totalPlaced?.toLocaleString() || 0}</p>
            </div>
            <div className="summary-card green">
              <p className="sum-label">Companies</p>
              <p className="sum-val">{stats?.totalCompanies || 0}</p>
            </div>
            <div className="summary-card amber">
              <p className="sum-label">Avg. CTC</p>
              <p className="sum-val">{stats?.avgCTC || 0} <span>LPA</span></p>
            </div>
            <div className="summary-card red">
              <p className="sum-label">Highest CTC</p>
              <p className="sum-val">{stats?.maxCTC || 0} <span>LPA</span></p>
            </div>
          </div>

          {/* Charts grid */}
          <div className="charts-grid">
            <div className="chart-card full">
              <div className="card-header">
                <h3>Monthly Placement Trend</h3>
              </div>
              <div className="chart-body" style={{ height: 260 }}>
                {sortedMonths.length > 0
                  ? <Line data={monthData} options={lineOpts} />
                  : <div className="no-data">No monthly data available</div>}
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3>Branch-wise Placements</h3>
              </div>
              <div className="chart-body" style={{ height: 280 }}>
                {Object.keys(stats?.branchWise || {}).length > 0
                  ? <Bar data={branchData} options={barOpts} />
                  : <div className="no-data">No data available</div>}
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3>Drive Type Breakdown</h3>
              </div>
              <div className="chart-body" style={{ height: 280 }}>
                {typeLabels.length > 0
                  ? <Doughnut data={typeData} options={doughnutOpts} />
                  : <div className="no-data">No data available</div>}
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3>Application Status Overview</h3>
              </div>
              <div className="chart-body" style={{ height: 280 }}>
                {appLabels.length > 0
                  ? <Doughnut data={appData} options={doughnutOpts} />
                  : <div className="no-data">No data available</div>}
              </div>
            </div>
          </div>

          {/* Branch table */}
          {Object.keys(stats?.branchWise || {}).length > 0 && (
            <div className="stats-table-card">
              <div className="card-header">
                <h3>Branch Summary</h3>
              </div>
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Students Placed</th>
                    <th>Share</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.branchWise)
                    .sort(([, a], [, b]) => b - a)
                    .map(([branch, count]) => {
                      const pct = Math.round((count / stats.totalPlaced) * 100) || 0
                      return (
                        <tr key={branch}>
                          <td><span className="branch-tag">{branch}</span></td>
                          <td><strong>{count}</strong></td>
                          <td>{pct}%</td>
                          <td>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
