import { useState } from 'react'
import './DriveForm.css'

const BRANCHES = ['CSE', 'ECE', 'EE', 'ME', 'CE', 'CH', 'MM', 'PH', 'MCA', 'MBA']
const PROGRAMS = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'M.Sc']
const OFFER_TYPES = ['6M Intern', '2M Intern', '6M + PPO', '2M + PPO', 'FTE', '6M + FTE', '6 Months Internship + PPO', 'Full Time Employment (FTE)']
const DRIVE_TYPES = [
  { value: 'on-campus', label: 'On-Campus' },
  { value: 'off-campus', label: 'Off-Campus' },
  { value: 'ppo', label: 'PPO' },
  { value: 'internship', label: 'Internship' }
]

const normalizeArray = (val, fallback) => {
  if (Array.isArray(val)) return val.length > 0 ? val : fallback
  if (typeof val === 'string' && val.trim()) return [val]
  return fallback
}

export default function DriveForm({ onSubmit, onCancel, initial = {} }) {
  const [form, setForm] = useState(() => ({
    company: initial.company || '',
    role: initial.role || '',
    date: initial.date || '',
    count: initial.count !== undefined ? initial.count : 0,
    branch: normalizeArray(initial.branch || initial.branches, ['CSE', 'ECE', 'EE']),
    program: normalizeArray(initial.program, ['B.Tech']),
    offerType: initial.offerType || 'FTE',
    ctc: initial.ctc !== undefined ? initial.ctc : '',
    driveType: initial.driveType || 'on-campus',
    status: initial.status || 'completed',
    batch: initial.batch || '2026',
    cgpaReq: initial.cgpaReq || 0,
    backlogsAllowed: initial.backlogsAllowed || 0,
    requiredSkills: Array.isArray(initial.requiredSkills) ? initial.requiredSkills.join(', ') : (initial.requiredSkills || '')
  }))

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const toggleBranch = (b) => {
    setForm(f => {
      const current = Array.isArray(f.branch) ? f.branch : [f.branch]
      const updated = current.includes(b)
        ? current.filter(x => x !== b)
        : [...current, b]
      return { ...f, branch: updated }
    })
  }

  const selectAllBranches = () => setForm(f => ({ ...f, branch: [...BRANCHES] }))
  const clearBranches = () => setForm(f => ({ ...f, branch: [] }))

  const toggleProgram = (p) => {
    setForm(f => {
      const current = Array.isArray(f.program) ? f.program : [f.program]
      const updated = current.includes(p)
        ? current.filter(x => x !== p)
        : [...current, p]
      return { ...f, program: updated }
    })
  }

  const selectAllPrograms = () => setForm(f => ({ ...f, program: [...PROGRAMS] }))
  const clearPrograms = () => setForm(f => ({ ...f, program: [] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.company || !form.role || !form.date) {
      setError('Please fill in all required fields.')
      return
    }
    if (!form.branch || form.branch.length === 0) {
      setError('Please select at least one eligible branch.')
      return
    }
    if (!form.program || form.program.length === 0) {
      setError('Please select at least one eligible program.')
      return
    }

    setLoading(true)
    try {
      const skillsArray = typeof form.requiredSkills === 'string'
        ? form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
        : form.requiredSkills

      await onSubmit({
        ...form,
        branches: form.branch,
        count: parseInt(form.count) || 0,
        ctc: parseFloat(form.ctc) || 0,
        cgpaReq: parseFloat(form.cgpaReq) || 0,
        backlogsAllowed: parseInt(form.backlogsAllowed) || 0,
        requiredSkills: skillsArray
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="drive-form" onSubmit={handleSubmit} noValidate>
      {error && <div className="form-error">{error}</div>}

      <div className="form-row">
        <div className="form-field">
          <label>Company Name *</label>
          <input type="text" placeholder="e.g. Google" value={form.company} onChange={e => set('company', e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Role *</label>
          <input type="text" placeholder="e.g. SDE-1" value={form.role} onChange={e => set('role', e.target.value)} required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Drive Date *</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Students Placed</label>
          <input type="number" placeholder="0" min="0" value={form.count} onChange={e => set('count', e.target.value)} />
        </div>
      </div>

      {/* Branch Eligible Section (Multiple Choice) */}
      <div className="form-field-full">
        <div className="field-header">
          <label>Eligible Branches *</label>
          <div className="quick-select-btns">
            <button type="button" onClick={selectAllBranches}>Select All</button>
            <span>•</span>
            <button type="button" onClick={clearBranches}>Clear</button>
          </div>
        </div>
        <div className="pill-group">
          {BRANCHES.map(b => {
            const isSelected = Array.isArray(form.branch) && form.branch.includes(b)
            return (
              <button
                key={b}
                type="button"
                className={`pill-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleBranch(b)}
              >
                {isSelected && <span className="pill-check">✓</span>}
                {b}
              </button>
            )
          })}
        </div>
      </div>

      {/* Program Eligible Section (Multiple Choice) */}
      <div className="form-field-full">
        <div className="field-header">
          <label>Eligible Programs *</label>
          <div className="quick-select-btns">
            <button type="button" onClick={selectAllPrograms}>Select All</button>
            <span>•</span>
            <button type="button" onClick={clearPrograms}>Clear</button>
          </div>
        </div>
        <div className="pill-group">
          {PROGRAMS.map(p => {
            const isSelected = Array.isArray(form.program) && form.program.includes(p)
            return (
              <button
                key={p}
                type="button"
                className={`pill-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleProgram(p)}
              >
                {isSelected && <span className="pill-check">✓</span>}
                {p}
              </button>
            )
          })}
        </div>
      </div>

      {/* Type of Offer & CTC */}
      <div className="form-row">
        <div className="form-field">
          <label>Type of Offer *</label>
          <select value={form.offerType} onChange={e => set('offerType', e.target.value)}>
            {OFFER_TYPES.map(ot => (
              <option key={ot} value={ot}>{ot}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>CTC (LPA)</label>
          <input type="number" placeholder="0.0" min="0" step="0.1" value={form.ctc} onChange={e => set('ctc', e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Min. CGPA Required</label>
          <input type="number" placeholder="0.0" min="0" max="10" step="0.1" value={form.cgpaReq} onChange={e => set('cgpaReq', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Backlogs Allowed</label>
          <input type="number" placeholder="0" min="0" value={form.backlogsAllowed} onChange={e => set('backlogsAllowed', e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Batch Year</label>
          <select value={form.batch} onChange={e => set('batch', e.target.value)}>
            {['2024', '2025', '2026', '2027'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Drive Type</label>
          <select value={form.driveType} onChange={e => set('driveType', e.target.value)}>
            {DRIVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="completed">Completed</option>
            <option value="upcoming">Upcoming</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? <span className="spinner-sm" /> : initial.company ? 'Save Changes' : 'Post Drive'}
        </button>
      </div>
    </form>
  )
}
