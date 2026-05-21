import { useState, useEffect } from 'react'
import { getStudentProfile, updateStudentProfile, uploadResume } from '../services/api'
import { toast } from 'react-hot-toast'
import './StudentProfile.css'

export default function StudentProfilePage() {
  const [profile, setProfile] = useState({
    branch: '',
    program: 'B.Tech',
    cgpa: 0,
    phone: '',
    resumeLink: '',
    passingYear: new Date().getFullYear(),
    resumeScore: null,
    resumeFeedback: '',
    resumeKeywords: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    const loadingToast = toast.loading('Uploading and analyzing with AI...');
    try {
      const res = await uploadResume(formData);
      setProfile({
        ...profile,
        resumeScore: res.data.score,
        resumeFeedback: res.data.feedback,
        resumeKeywords: res.data.keywords
      });
      toast.success('Resume analyzed successfully!', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload and analyze resume.', { id: loadingToast });
    } finally {
      setUploading(false);
      // Reset input so they can upload again if needed
      e.target.value = null;
    }
  }

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

          <div className="form-group ai-resume-section">
            <label>Smart Resume Upload (PDF only)</label>
            <div className="resume-upload-wrapper">
              <input 
                type="file" 
                accept="application/pdf"
                onChange={handleResumeUpload}
                disabled={uploading}
                id="resume-upload"
                className="file-input"
              />
              {uploading && <span className="upload-status">Analyzing with AI...</span>}
            </div>
            
            {profile.resumeScore !== null && (
              <div className="ai-feedback-box">
                <div className="score-header">
                  <h4>ATS Match Score</h4>
                  <span className={`score-badge ${profile.resumeScore > 75 ? 'good' : 'warning'}`}>
                    {profile.resumeScore}/100
                  </span>
                </div>
                <p className="ai-feedback-text"><strong>AI Feedback:</strong> {profile.resumeFeedback}</p>
                {profile.resumeKeywords?.length > 0 && (
                  <div className="ai-keywords">
                    <strong>Extracted Skills:</strong>
                    <div className="keyword-tags">
                      {profile.resumeKeywords.map((kw, idx) => (
                        <span key={idx} className="kw-tag">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
