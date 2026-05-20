import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDriveApplicants, updateApplicationStatus } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import './DriveApplicants.css'

export default function DriveApplicantsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isCoordinator } = useAuth()
  
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isCoordinator) {
      navigate('/')
      return
    }
    fetchApplicants()
  }, [id, isCoordinator])

  const fetchApplicants = async () => {
    try {
      const { data } = await getDriveApplicants(id)
      setApplicants(data)
    } catch (err) {
      toast.error('Failed to load applicants')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus)
      toast.success('Status updated')
      setApplicants(apps => apps.map(app => 
        app._id === appId ? { ...app, status: newStatus } : app
      ))
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const exportCSV = () => {
    if (applicants.length === 0) return toast.error('No applicants to export')

    const headers = ['Name', 'Email', 'Branch', 'Program', 'CGPA', 'Phone', 'Passing Year', 'Status', 'Applied On']
    
    const rows = applicants.map(app => [
      app.student.name,
      app.student.username,
      app.profile?.branch || 'N/A',
      app.profile?.program || 'N/A',
      app.profile?.cgpa || 'N/A',
      app.profile?.phone || 'N/A',
      app.profile?.passingYear || 'N/A',
      app.status,
      new Date(app.createdAt).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `drive_applicants_${id}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) return <div className="page-loader">Loading applicants...</div>

  return (
    <div className="applicants-page">
      <div className="applicants-header">
        <div>
          <h2>Drive Applicants</h2>
          <p>Total applications: {applicants.length}</p>
        </div>
        <button onClick={exportCSV} className="btn-export">
          Export to CSV
        </button>
      </div>

      <div className="table-responsive">
        <table className="applicants-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Branch / Program</th>
              <th>CGPA</th>
              <th>Resume</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map(app => (
              <tr key={app._id}>
                <td>
                  <div className="student-info">
                    <strong>{app.student.name}</strong>
                    <span>{app.student.username}</span>
                  </div>
                </td>
                <td>
                  {app.profile ? `${app.profile.branch} (${app.profile.program})` : 'Profile missing'}
                </td>
                <td>{app.profile?.cgpa || 'N/A'}</td>
                <td>
                  {app.profile?.resumeLink ? (
                    <a href={app.profile.resumeLink} target="_blank" rel="noreferrer" className="resume-link">View Resume</a>
                  ) : 'N/A'}
                </td>
                <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${app.status}`}>
                    {app.status}
                  </span>
                </td>
                <td>
                  <select 
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="aptitude">Aptitude Round</option>
                    <option value="interview">Interview Scheduled</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
            {applicants.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row">No students have applied yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
