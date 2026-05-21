import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchDrives, deleteDrive, updateDrive, applyToDrive } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import DriveForm from '../components/DriveForm'
import './Drives.css'

const STATUS_COLORS = {
  completed: 'green',
  upcoming: 'amber',
  cancelled: 'red'
}

export default function DrivesPage() {
  const { user, isCoordinator, isStudent } = useAuth()
  const navigate = useNavigate()
  const [drives, setDrives] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ branch: '', status: '', driveType: '', offerType: '', ctcRange: '', location: '' })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [editDrive, setEditDrive] = useState(null)
  const [viewDrive, setViewDrive] = useState(null)
  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  const load = async () => {
    setLoading(true)
    try {
      const apiFilters = { ...filters };
      if (apiFilters.ctcRange) {
        if (apiFilters.ctcRange === '<5') { apiFilters.packageMax = '5'; }
        else if (apiFilters.ctcRange === '5-10') { apiFilters.packageMin = '5'; apiFilters.packageMax = '10'; }
        else if (apiFilters.ctcRange === '10-20') { apiFilters.packageMin = '10'; apiFilters.packageMax = '20'; }
        else if (apiFilters.ctcRange === '>20') { apiFilters.packageMin = '20'; }
      }
      delete apiFilters.ctcRange;

      const res = await fetchDrives({
        search,
        ...Object.fromEntries(Object.entries(apiFilters).filter(([_, v]) => v !== '')),
        limit: PER_PAGE,
        page
      })
      setDrives(res.data.drives)
      setTotal(res.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, filters, page])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this drive?')) return
    await deleteDrive(id)
    setDrives(prev => prev.filter(d => d._id !== id))
    setTotal(t => t - 1)
  }

  const handleEdit = async (data) => {
    const res = await updateDrive(editDrive._id, data)
    setDrives(prev => prev.map(d => d._id === editDrive._id ? res.data : d))
    setEditDrive(null)
  }

  const handleApply = async (driveId) => {
    try {
      await applyToDrive(driveId)
      toast.success('Successfully applied to drive!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply')
    }
  }

  const setFilter = (k, v) => {
    setPage(1)
    setFilters(f => ({ ...f, [k]: v }))
  }

  const renderTimeline = (drive) => {
    const events = [
      { label: 'Registration Opens', date: drive.registrationStart },
      { label: 'Registration Closes', date: drive.registrationEnd },
      { label: 'Test Date', date: drive.testDate },
      { label: 'Interview Date', date: drive.interviewDate },
      { label: 'Results', date: drive.resultDate }
    ].filter(e => e.date);

    if (events.length === 0) return <p>No timeline available.</p>;

    return (
      <div className="vertical-timeline">
        {events.map((ev, i) => (
          <div key={i} className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <strong>{ev.label}</strong>
              <p>{new Date(ev.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="drives-page">
      <div className="page-header">
        <div>
          <h1>All Drives</h1>
          <p>{total} records found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filters-bar">
          <div className="search-bar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search company…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select value={filters.branch} onChange={e => setFilter('branch', e.target.value)}>
            <option value="">All branches</option>
            {['CSE','ECE','EE','ME','CE','CH','MM','PH','MCA','MBA'].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="upcoming">Upcoming</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={filters.driveType} onChange={e => setFilter('driveType', e.target.value)}>
            <option value="">All Types</option>
            <option value="On Campus">On Campus</option>
            <option value="Off Campus">Off Campus</option>
          </select>
          <select value={filters.offerType} onChange={e => setFilter('offerType', e.target.value)}>
            <option value="">All Offers</option>
            <option value="6 Months Internship + PPO">Internship + PPO</option>
            <option value="Full Time Employment (FTE)">FTE</option>
            <option value="6 Months Internship + FTE">Internship + FTE</option>
            <option value="Internship Only (6 Months)">Internship Only</option>
          </select>
          <select value={filters.ctcRange} onChange={e => setFilter('ctcRange', e.target.value)}>
            <option value="">All CTC</option>
            <option value="<5">&lt; 5 LPA</option>
            <option value="5-10">5 - 10 LPA</option>
            <option value="10-20">10 - 20 LPA</option>
            <option value=">20">&gt; 20 LPA</option>
          </select>
          <button className="btn-advanced-filters" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? 'Hide Location Filter' : 'Location Filter'}
          </button>
        </div>
        
        {showAdvanced && (
          <div className="advanced-filters-panel" style={{ display: 'flex', gap: '15px', padding: '15px', background: 'var(--surface-50)', borderRadius: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <div className="filter-group">
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Location</label>
              <input type="text" placeholder="e.g. Bangalore" value={filters.location} onChange={e => setFilter('location', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="drives-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Branches</th>
              <th>Date</th>
              <th>Placed</th>
              <th>CTC</th>
              <th>CGPA Req</th>
              <th>Drive / Offer Type</th>
              <th>Status</th>
              {isStudent && <th>AI Match</th>}
              {user && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={isStudent ? "11" : (user ? "10" : "9")} className="table-empty">Loading...</td></tr>
            )}
            {!loading && drives.length === 0 && (
              <tr><td colSpan={isStudent ? "11" : (user ? "10" : "9")} className="table-empty">No drives found</td></tr>
            )}
            {!loading && drives.map(d => (
              <tr key={d._id}>
                <td>
                  <div className="company-cell" style={{cursor: 'pointer'}} onClick={() => setViewDrive(d)}>
                    <span className="company-avatar">{d.company.charAt(0)}</span>
                    <span>{d.company}</span>
                  </div>
                </td>
                <td className="role-cell">{d.role}</td>
                <td>
                  <div style={{display:'flex', gap:'4px', flexWrap:'wrap', maxWidth: '100px'}}>
                    {(d.branches || []).map(b => <span key={b} className="branch-tag" style={{fontSize: '0.7rem', padding: '2px 4px'}}>{b}</span>)}
                  </div>
                </td>
                <td className="date-cell">{d.date}</td>
                <td>
                  {d.status === 'completed' 
                    ? <strong>{d.count}</strong> 
                    : <span className="status-tag upcoming" style={{fontSize:'0.75rem'}}>Results Pending</span>
                  }
                </td>
                <td>{d.ctc > 0 ? `${d.ctc} LPA` : '—'}</td>
                <td>{d.cgpaReq > 0 ? d.cgpaReq : '—'}</td>
                <td>
                  <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                    <span className="type-tag">{d.driveType || 'On Campus'}</span>
                    <span className="type-tag" style={{background: 'var(--primary-light)', color: 'var(--primary)'}}>{d.offerType || 'FTE'}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-tag ${STATUS_COLORS[d.status] || 'accent'}`}>
                    {d.status}
                  </span>
                </td>
                {isStudent && (
                  <td>
                    {d.matchScore !== null && d.matchScore !== undefined ? (
                      <span className="type-tag" style={{ background: d.matchScore >= 75 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: d.matchScore >= 75 ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                        {d.matchScore}% Match
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload Resume</span>
                    )}
                  </td>
                )}
                {user && (
                  <td>
                    <div className="action-btns" style={{gap: '8px', display: 'flex'}}>
                      <button className="btn-icon-view" style={{background: 'var(--surface-50)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', color: 'var(--text)'}} onClick={() => setViewDrive(d)} title="View Details">
                        Details
                      </button>
                      {isCoordinator && (
                        <>
                          <button className="btn-icon-edit" onClick={() => setEditDrive(d)} title="Edit">
                            Edit
                          </button>
                          <button className="btn-icon-del" onClick={() => handleDelete(d._id)} title="Delete">
                            Del
                          </button>
                          <button className="btn-icon-view" style={{background: 'var(--primary)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer'}} onClick={() => navigate(`/drives/${d._id}/applicants`)} title="View Applicants">
                            Applicants
                          </button>
                        </>
                      )}
                      {isStudent && (
                        d.status === 'upcoming' ? (
                          <button className="btn-icon-apply" style={{background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => handleApply(d._id)}>
                            Apply
                          </button>
                        ) : (
                          <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', padding: '6px 0'}}>Drive Closed</span>
                        )
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {/* View Details Modal */}
      {viewDrive && (
        <div className="modal-overlay" onClick={() => setViewDrive(null)}>
          <div className="modal-box details-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-head">
              <h2>{viewDrive.company} - {viewDrive.role}</h2>
              <button className="modal-close" onClick={() => setViewDrive(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                <div className="details-main">
                  <h3>Company Overview</h3>
                  <p>{viewDrive.companyOverview || 'No overview provided.'}</p>
                  
                  <h3 style={{marginTop: '20px'}}>Hiring Process</h3>
                  <p>{viewDrive.hiringProcess || 'No process details provided.'}</p>
                  
                  <h3 style={{marginTop: '20px'}}>Eligibility Criteria</h3>
                  <p>{viewDrive.eligibilityCriteria || 'No specific criteria provided.'}</p>
                  
                  <h3 style={{marginTop: '20px'}}>Previous Questions</h3>
                  <p>{viewDrive.previousQuestions || 'No previous questions available.'}</p>
                </div>
                <div className="details-sidebar" style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <h3>Drive Info</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 20px', lineHeight: '2' }}>
                    <li><strong>CTC:</strong> {viewDrive.ctc ? `${viewDrive.ctc} LPA` : 'Not specified'}</li>
                    <li><strong>Location:</strong> {viewDrive.location || 'Not specified'}</li>
                    <li><strong>Branches:</strong> {(viewDrive.branches || []).join(', ')}</li>
                    <li><strong>Batches:</strong> {(viewDrive.batches || []).join(', ')}</li>
                    <li><strong>Backlogs Allowed:</strong> {viewDrive.backlogsAllowed === 0 ? 'None' : viewDrive.backlogsAllowed}</li>
                    <li><strong>Drive Type:</strong> {viewDrive.driveType}</li>
                    <li><strong>Offer Type:</strong> {viewDrive.offerType}</li>
                    <li><strong>Status:</strong> {viewDrive.status}</li>
                    {viewDrive.status === 'completed' && (
                      <li><strong>Students Placed:</strong> {viewDrive.count}</li>
                    )}
                  </ul>
                  
                  <h3>Timeline</h3>
                  <div style={{ marginTop: '15px' }}>
                    {renderTimeline(viewDrive)}
                  </div>
                  
                  {isStudent && viewDrive.status === 'upcoming' && (
                    <button 
                      onClick={() => { handleApply(viewDrive._id); setViewDrive(null); }}
                      style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', width: '100%', marginTop: '20px', fontWeight: 'bold', fontSize: '1rem' }}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editDrive && (
        <div className="modal-overlay" onClick={() => setEditDrive(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Edit Drive</h3>
              <button className="modal-close" onClick={() => setEditDrive(null)}>✕</button>
            </div>
            <DriveForm
              initial={editDrive}
              onSubmit={handleEdit}
              onCancel={() => setEditDrive(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
