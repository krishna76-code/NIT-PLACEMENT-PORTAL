import { useState, useEffect } from 'react'
import { getMyApplications, withdrawApplication } from '../services/api'
import { toast } from 'react-hot-toast'
import './MyApplications.css'

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApps()
  }, [])

  const fetchApps = async () => {
    try {
      const { data } = await getMyApplications()
      setApplications(data)
    } catch (err) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return
    
    try {
      await withdrawApplication(appId)
      toast.success('Application withdrawn')
      setApplications(prev => prev.filter(a => a._id !== appId))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw application')
    }
  }

  const STAGES = ['applied', 'shortlisted', 'aptitude', 'interview', 'selected'];

  const renderStepper = (currentStatus) => {
    if (currentStatus === 'rejected') {
      return (
        <div className="stepper rejected">
          <div className="step-item rejected">
            <div className="step-circle">✕</div>
            <span>Application Rejected</span>
          </div>
        </div>
      );
    }

    const currentIndex = STAGES.indexOf(currentStatus);
    
    return (
      <div className="stepper">
        {STAGES.map((stage, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;
          return (
            <div key={stage} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
              <div className="step-circle">{isCompleted ? '✓' : index + 1}</div>
              <span className="step-label">{stage.charAt(0).toUpperCase() + stage.slice(1)}</span>
              {index < STAGES.length - 1 && <div className="step-line"></div>}
            </div>
          );
        })}
      </div>
    );
  }

  if (loading) return <div className="page-loader">Loading applications...</div>

  return (
    <div className="my-apps-page">
      <div className="my-apps-header">
        <h2>My Applications</h2>
        <p>Track your applied placement drives and their status.</p>
      </div>

      {applications.length === 0 ? (
        <div className="empty-apps">
          <p>You haven't applied to any drives yet.</p>
        </div>
      ) : (
        <div className="apps-grid">
          {applications.map(app => (
            <div key={app._id} className="app-card">
              <div className="app-card-header">
                <h3>{app.drive?.company || 'Company Name'}</h3>
                <span className="type-tag">{app.drive?.driveType || 'On-Campus'}</span>
              </div>
              <div className="app-card-body">
                <div className="app-info-row">
                  <p><strong>Role:</strong> {app.drive?.role}</p>
                  <p><strong>Date:</strong> {app.drive?.date && new Date(app.drive.date).toLocaleDateString()}</p>
                  <p><strong>Applied On:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="status-timeline-container">
                  {renderStepper(app.status)}
                </div>
                
                {app.status === 'applied' && (
                  <button 
                    className="btn-withdraw" 
                    onClick={() => handleWithdraw(app._id)}
                  >
                    Withdraw Application
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
