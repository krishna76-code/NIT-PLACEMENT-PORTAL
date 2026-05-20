import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound-inner">
        <span className="nf-code">404</span>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="nf-btn">← Back to Dashboard</Link>
      </div>
    </div>
  )
}
