import { useState, useEffect } from 'react'
import { getStudentProfile, updateStudentProfile } from '../services/api'
import { toast } from 'react-hot-toast'
import './StudentProfile.css'

export default function StudentProfilePage() {
  const [profile, setProfile] = useState({
    branch: '',
    program: 'B.Tech',
    cgpa: 0,
    phone: '',
    resumeLink: '',
    passingYear: new Date().getFullYear()
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await getStudentProfile()
      setProfile(data)
    } catch (err) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateStudentProfile(profile)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page-loader">Loading profile...</div>

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2>My Profile</h2>
        <p>Keep your profile updated to apply for placement drives.</p>
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Program</label>
            <select 
              value={profile.program} 
              onChange={e => setProfile({...profile, program: e.target.value})}
            >
              <option value="B.Tech">B.Tech</option>
              <option value="MCA">MCA</option>
              <option value="M.Tech">M.Tech</option>
            </select>
          </div>

          <div className="form-group">
            <label>Branch</label>
            <input 
              type="text" 
              placeholder="e.g. Computer Science and Engineering"
              value={profile.branch} 
              onChange={e => setProfile({...profile, branch: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Current CGPA</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              max="10"
              placeholder="e.g. 8.5"
              value={profile.cgpa} 
              onChange={e => setProfile({...profile, cgpa: Number(e.target.value)})}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              placeholder="e.g. +91 9876543210"
              value={profile.phone} 
              onChange={e => setProfile({...profile, phone: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Resume Link (Google Drive / S3 URL)</label>
            <input 
              type="url" 
              placeholder="https://..."
              value={profile.resumeLink} 
              onChange={e => setProfile({...profile, resumeLink: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Passing Year</label>
            <input 
              type="number" 
              value={profile.passingYear} 
              onChange={e => setProfile({...profile, passingYear: Number(e.target.value)})}
              required
            />
          </div>

          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
