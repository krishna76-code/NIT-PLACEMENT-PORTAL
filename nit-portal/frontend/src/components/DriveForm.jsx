import { useState } from 'react'
import './DriveForm.css'

const BRANCHES = ['CSE', 'ECE', 'EE', 'ME', 'CE', 'CH', 'MM', 'PH', 'MCA', 'MBA']
const PROGRAMS = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'PhD', 'Dual Degree']
const DRIVE_TYPES = [
  { value: 'on-campus', label: 'On-Campus' },
  { value: 'off-campus', label: 'Off-Campus' },
  { value: 'ppo', label: 'PPO' },
  { value: 'internship', label: 'Internship' }
]

const defaultForm = {
  company: '', role: '', date: '', count: '', branch: 'CSE',
  program: 'B.Tech', ctc: '', cgpaReq: '', driveType: 'on-campus', status: 'completed', batch: '2026'
}

export default function DriveForm({ onSubmit, onCancel, initial = {} }) {
  const [form, setForm] = useState({ ...defaultForm, ...initial })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.company || !form.role || !form.date || !form.count) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    try {
      await onSubmit({ ...form, count: parseInt(form.count), ctc: parseFloat(form.ctc) || 0 })
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
          <label>Students Placed *</label>
          <input type="number" placeholder="0" min="0" value={form.count} onChange={e => set('count', e.target.value)} required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Branch</label>
          <select value={form.branch} onChange={e => set('branch', e.target.value)}>
            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Program</label>
          <select value={form.program} onChange={e => set('program', e.target.value)}>
            {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>CTC (LPA)</label>
          <input type="number" placeholder="0.0" min="0" step="0.1" value={form.ctc} onChange={e => set('ctc', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Min CGPA Req.</label>
          <input type="number" placeholder="0.0" min="0" max="10" step="0.1" value={form.cgpaReq} onChange={e => set('cgpaReq', e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Drive Type</label>
          <select value={form.driveType} onChange={e => set('driveType', e.target.value)}>
            {DRIVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
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
