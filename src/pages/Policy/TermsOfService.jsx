import { useNavigate } from "react-router-dom";
import "../../assets/CSS/policy.css";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="policy-container">
      <nav className="policy-navbar">
        <div className="policy-nav-content">
          <div className="policy-nav-logo">
            <img src="/icons/knight_icon.png" alt="Knight Icon" />
            <span>
              Dev <span className="nav-highlight">Vanguard</span>
            </span>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="policy-nav-back"
          >
            Back
          </button>
        </div>
      </nav>

      <div className="policy-wrapper">
        <div className="policy-header">
          <h1>Terms of Service</h1>
          <p>Last updated: November 2025</p>
        </div>

        <div className="policy-body">
          <section className="policy-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Dev Vanguard, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Dev Vanguard for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on Dev Vanguard</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>Disrupting the normal flow of dialogue within our website</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Disclaimer</h2>
            <p>
              The materials on Dev Vanguard are provided on an "as is" basis. Dev Vanguard makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="policy-section">
            <h2>4. Limitations</h2>
            <p>
              In no event shall Dev Vanguard or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Dev Vanguard, even if Dev Vanguard or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="policy-section">
            <h2>5. Accuracy of Materials</h2>
            <p>
              The materials appearing on Dev Vanguard could include technical, typographical, or photographic errors. Dev Vanguard does not warrant that any of the materials on its website are accurate, complete, or current. Dev Vanguard may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section className="policy-section">
            <h2>6. Materials on Other Websites</h2>
            <p>
              Dev Vanguard has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Dev Vanguard of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="policy-section">
            <h2>7. Modifications</h2>
            <p>
              Dev Vanguard may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section className="policy-section">
            <h2>8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Dev Vanguard operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section className="policy-section">
            <h2>9. User Conduct</h2>
            <p>
              You agree not to post content that is abusive, threatening, obscene, defamatory, libelous, or otherwise objectionable. You agree not to harass or cause distress or inconvenience to any person. You agree not to transmit or facilitate transmission of content that is obscene, defamatory, inflammatory, or otherwise objectionable.
            </p>
          </section>

          <section className="policy-section">
            <h2>10. Account Responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You must notify Dev Vanguard immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="policy-section">
            <h2>11. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through our website contact form or email support.
            </p>
          </section>
        </div>
      </div>

      <footer className="policy-footer">
        <p>&copy; 2025 Dev Vanguard. All rights reserved.</p>
      </footer>
    </div>
  );
}
