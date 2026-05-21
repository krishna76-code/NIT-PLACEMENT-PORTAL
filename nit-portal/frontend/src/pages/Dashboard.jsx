import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js'
import 'react-circular-progressbar/dist/styles.css'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { fetchDrives, fetchStats, createDrive, deleteDrive, getStudentDashboardStats, getStudentProfile } from '../services/api'
import DriveForm from '../components/DriveForm'
import './Dashboard.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const PLACEMENT_GOAL = 1200

const KpiCard = ({ icon, label, value, sub, color }) => (
  <div className="kpi-card">
    <div className="kpi-icon" style={{ background: `var(--${color}-light)`, color: `var(--${color})` }}>
      {icon}
    </div>
    <div>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
      {sub && <p className="kpi-sub">{sub}</p>}
    </div>
  </div>
)

export default function Dashboard() {
  const { user, token, isCoordinator } = useAuth()
  const { theme } = useTheme()
  const [drives, setDrives] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [studentStats, setStudentStats] = useState(null)
  const [profile, setProfile] = useState(null)

  const isDark = theme === 'dark'

  const loadData = async () => {
    try {
      if (isCoordinator) {
        const [dRes, sRes] = await Promise.all([
          fetchDrives({ limit: 200 }),
          fetchStats('2026')
        ])
        setDrives(dRes.data.drives)
        setStats(sRes.data)
      } else {
        const [dRes, sRes, pRes] = await Promise.all([
          fetchDrives({ limit: 200 }),
          getStudentDashboardStats(),
          getStudentProfile()
        ])
        setDrives(dRes.data.drives)
        setStudentStats(sRes.data)
        setProfile(pRes.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [isCoordinator])

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this record?')) return
    try {
      await deleteDrive(id)
      setDrives(prev => prev.filter(d => d._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.')
    }
  }

  const handleCreate = async (data) => {
    try {
      const res = await createDrive(data)
      setDrives(prev => [res.data, ...prev])
      setShowForm(false)
      await loadData() // refresh stats
    } catch (err) {
      throw err
    }
  }

  const totalPlaced = stats?.totalPlaced || 0
  const goalPct = Math.min(Math.round((totalPlaced / PLACEMENT_GOAL) * 100), 100)
  const filtered = drives.filter(d =>
    d.company.toLowerCase().includes(search.toLowerCase())
  )

  const branchWise = stats?.branchWise || {}
  const chartData = {
    labels: Object.keys(branchWise),
    datasets: [{
      label: 'Students Placed',
      data: Object.values(branchWise),
      backgroundColor: isDark ? 'rgba(77,123,239,0.8)' : 'rgba(42,82,190,0.82)',
      borderRadius: 8,
      hoverBackgroundColor: isDark ? '#4d7bef' : '#2a52be',
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1c1c1a' : '#fff',
        titleColor: isDark ? '#f0ede6' : '#1a1916',
        bodyColor: isDark ? '#a8a49a' : '#5a5850',
        borderColor: isDark ? '#2e2e2a' : '#e2e0d6',
        borderWidth: 1,
        padding: 10,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: isDark ? '#2e2e2a' : '#f0efe9', drawBorder: false },
        ticks: { color: isDark ? '#a8a49a' : '#5a5850', font: { family: 'DM Sans', size: 12 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#a8a49a' : '#5a5850', font: { family: 'DM Sans', size: 12 } }
      }
    }
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Placement season 2026 — live overview</p>
        </div>
        {isCoordinator && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Post Drive
          </button>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Post New Drive</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <DriveForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="kpi-row">
        {isCoordinator ? (
          <>
            <div className="kpi-goal-card">
              <div className="progress-ring">
                <CircularProgressbar
                  value={goalPct}
                  text={`${goalPct}%`}
                  styles={buildStyles({
                    pathColor: isDark ? '#4d7bef' : '#2a52be',
                    textColor: isDark ? '#f0ede6' : '#1a1916',
                    trailColor: isDark ? '#2e2e2a' : '#f0efe9',
                    textSize: '22px'
                  })}
                />
              </div>
              <div>
                <p className="kpi-label">Placement Target</p>
                <p className="kpi-value">{totalPlaced.toLocaleString()}</p>
                <p className="kpi-sub">of {PLACEMENT_GOAL} students</p>
              </div>
            </div>

            <KpiCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>}
              label="Total Recruiters"
              value={stats?.totalCompanies || 0}
              color="accent"
            />
            <KpiCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
              label="Avg. CTC"
              value={`${stats?.avgCTC || '—'} LPA`}
              color="green"
            />
            <KpiCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
              label="Highest CTC"
              value={`${stats?.maxCTC || '—'} LPA`}
              color="amber"
            />
          </>
        ) : (
          <>
            <div className="kpi-goal-card">
              <div className="progress-ring">
                <CircularProgressbar
                  value={(() => {
                    if (!profile) return 0;
                    const fields = ['branch', 'program', 'cgpa', 'phone', 'resumeLink', 'passingYear'];
                    const filled = fields.filter(f => profile[f] && profile[f] !== 0 && profile[f] !== '').length;
                    return Math.round((filled / fields.length) * 100);
                  })()}
                  text={`${(() => {
                    if (!profile) return 0;
                    const fields = ['branch', 'program', 'cgpa', 'phone', 'resumeLink', 'passingYear'];
                    const filled = fields.filter(f => profile[f] && profile[f] !== 0 && profile[f] !== '').length;
                    return Math.round((filled / fields.length) * 100);
                  })()}%`}
                  styles={buildStyles({
                    pathColor: isDark ? '#10b981' : '#059669',
                    textColor: isDark ? '#f0ede6' : '#1a1916',
                    trailColor: isDark ? '#2e2e2a' : '#f0efe9',
                    textSize: '22px'
                  })}
                />
              </div>
              <div>
                <p className="kpi-label">Profile Completion</p>
                <p className="kpi-sub">Complete profile to apply</p>
                <Link to="/profile" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>Update Profile →</Link>
              </div>
            </div>

            <KpiCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>}
              label="Applications"
              value={studentStats?.appliedCount || 0}
              color="accent"
            />
            <KpiCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              label="Eligible Drives"
              value={studentStats?.eligibleCount || 0}
              color="green"
            />
            <KpiCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
              label="Rejected"
              value={studentStats?.rejectedCount || 0}
              color="red"
            />
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="dash-grid">
        <div className="card chart-card">
          <div className="card-header">
            <h3>{isCoordinator ? 'Branch-wise Placements' : 'Upcoming Deadlines'}</h3>
            {isCoordinator ? <Link to="/stats" className="card-link">View all stats →</Link> : <Link to="/drives" className="card-link">View all drives →</Link>}
          </div>
          <div className="chart-wrap">
            {isCoordinator ? (
              Object.keys(branchWise).length > 0 ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <div className="empty-chart">No data yet</div>
              )
            ) : (
              <div className="upcoming-deadlines-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {studentStats?.upcomingDeadlines?.length > 0 ? (
                  studentStats.upcomingDeadlines.map(d => (
                    <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'var(--surface-50)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>{d.company} <span className="type-tag">{d.driveType}</span></h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.role} • {d.ctc ? `${d.ctc} LPA` : 'CTC TBA'}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ color: 'var(--amber)', fontSize: '0.9rem', display: 'block' }}>{d.registrationEnd ? new Date(d.registrationEnd).toLocaleDateString() : d.date}</strong>
                        <Link to={`/drives`} style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>Apply →</Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-chart">No upcoming deadlines!</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="side-col">
          <div className="card feed-card">
            <div className="card-header">
              <h3>Live Feed</h3>
              <div className="search-mini">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="feed-list">
              {loading && <div className="feed-loading">Loading...</div>}
              {!loading && filtered.length === 0 && (
                <div className="feed-empty">No drives found</div>
              )}
              {filtered.slice(0, 12).map(drive => (
                <div key={drive._id} className="feed-item">
                  <div className="feed-avatar">{drive.company.charAt(0).toUpperCase()}</div>
                  <div className="feed-info">
                    <h5>{drive.company}</h5>
                    <p>{(drive.branches || []).join(', ')} · {drive.role} · {drive.status === 'completed' ? <span><strong>{drive.count}</strong> placed</span> : <span>Results Pending</span>}</p>
                  </div>
                  <div className="feed-right">
                    {drive.ctc > 0 && <span className="ctc-badge">{drive.ctc} LPA</span>}
                    {isCoordinator && (
                      <button className="btn-delete" onClick={() => handleDelete(drive._id)} title="Delete">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {filtered.length > 12 && (
              <Link to="/drives" className="feed-more">View all {filtered.length} drives →</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
