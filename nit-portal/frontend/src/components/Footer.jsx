import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <span className="brand-badge">NIT</span>
          <div>
            <p className="footer-title">Training & Placement Cell</p>
            <p className="footer-sub">NIT Jamshedpur — Placement Portal v2.0</p>
          </div>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} NIT Jamshedpur. All rights reserved.</p>
      </div>
    </footer>
  )
}
