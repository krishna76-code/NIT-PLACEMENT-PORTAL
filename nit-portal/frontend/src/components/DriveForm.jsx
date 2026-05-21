import { useState } from 'react'
import './DriveForm.css'

const BRANCHES = ['CSE', 'ECE', 'EE', 'ME', 'CE', 'CH', 'MM', 'PH', 'MCA', 'MBA']
const PROGRAMS = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'PhD', 'Dual Degree']
const BATCHES = ['2024', '2025', '2026', '2027']
const DRIVE_TYPES = [
  { value: 'On Campus', label: 'On Campus' },
  { value: 'Off Campus', label: 'Off Campus' }
]
const OFFER_TYPES = [
  '6 Months Internship + PPO',
  'Full Time Employment (FTE)',
  '6 Months Internship + FTE',
  'Internship Only (6 Months)'
]

const defaultForm = {
  company: '', role: '', date: '', count: '', branches: ['CSE'],
  program: 'B.Tech', ctc: '', cgpaReq: '', backlogsAllowed: '0', driveType: 'On Campus', 
  offerType: 'Full Time Employment (FTE)', status: 'upcoming', batches: ['2026'],
  location: '', requiredSkills: '', companyOverview: '', hiringProcess: '', 
  eligibilityCriteria: '', previousQuestions: '',
  registrationStart: '', registrationEnd: '', testDate: '', interviewDate: '', resultDate: ''
}

export default function DriveForm({ onSubmit, onCancel, initial = {} }) {
  const [form, setForm] = useState({ ...defaultForm, ...initial })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))
  
  const toggleArray = (field, value) => {
    setForm(f => {
      const arr = f[field] || [];
      if (arr.includes(value)) {
        return { ...f, [field]: arr.filter(i => i !== value) };
      }
      return { ...f, [field]: [...arr, value] };
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.company || !form.role || !form.date || !form.count) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    try {
      const skillsArray = typeof form.requiredSkills === 'string' 
        ? form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
        : form.requiredSkills;

      await onSubmit({ 
        ...form, 
        count: parseInt(form.count) || 0, 
        ctc: parseFloat(form.ctc) || 0,
        backlogsAllowed: parseInt(form.backlogsAllowed) || 0,
        requiredSkills: skillsArray,
        branches: form.branches || ['CSE'],
        batches: form.batches || ['2026']
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
          <label>Students Placed *</label>
          <input type="number" placeholder="0" min="0" value={form.count} onChange={e => set('count', e.target.value)} required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field" style={{ gridColumn: '1 / -1' }}>
          <label>Eligible Branches *</label>
          <div className="checkbox-grid">
            {BRANCHES.map(b => (
              <label key={b} className="checkbox-label">
                <input type="checkbox" checked={(form.branches || []).includes(b)} onChange={() => toggleArray('branches', b)} />
                {b}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field" style={{ gridColumn: '1 / -1' }}>
          <label>Eligible Batches (Passing Year) *</label>
          <div className="checkbox-grid">
            {BATCHES.map(b => (
              <label key={b} className="checkbox-label">
                <input type="checkbox" checked={(form.batches || []).includes(b)} onChange={() => toggleArray('batches', b)} />
                {b}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Program</label>
          <select value={form.program} onChange={e => set('program', e.target.value)}>
            {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Backlogs Allowed</label>
          <input type="number" placeholder="0" min="0" value={form.backlogsAllowed} onChange={e => set('backlogsAllowed', e.target.value)} />
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
        <div className="form-field" style={{ gridColumn: '1 / -1' }}>
          <label>Required Skills (Comma separated for AI Matching) *</label>
          <input type="text" placeholder="e.g. React, Node.js, Python, System Design" value={form.requiredSkills} onChange={e => set('requiredSkills', e.target.value)} required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Drive Type</label>
          <select value={form.driveType} onChange={e => set('driveType', e.target.value)}>
            {DRIVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Offer Type</label>
          <select value={form.offerType} onChange={e => set('offerType', e.target.value)}>
            {OFFER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
