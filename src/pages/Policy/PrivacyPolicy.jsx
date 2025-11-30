import { useNavigate } from "react-router-dom";
import "../../assets/CSS/policy.css";

export default function PrivacyPolicy() {
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
          <h1>Privacy Policy</h1>
          <p>Last updated: November 2025</p>
        </div>

        <div className="policy-body">
          <section className="policy-section">
            <h2>1. Introduction</h2>
            <p>
              Dev Vanguard ("we" or "us" or "our") operates the website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Information Collection and Use</h2>
            <p>
              We collect several different types of information for various purposes to provide and improve our service:
            </p>
            <ul>
              <li><strong>Account Information:</strong> Email address, password, and account profile data</li>
              <li><strong>Learning Data:</strong> Your progress, solved problems, and course participation</li>
              <li><strong>Usage Information:</strong> Pages visited, time spent, and features used</li>
              <li><strong>Device Information:</strong> Browser type, IP address, and access times</li>
              <li><strong>Communication Data:</strong> Messages sent through our platform features</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Use of Data</h2>
            <p>
              Dev Vanguard uses the collected data for various purposes:
            </p>
            <ul>
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features of our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues and fraudulent activity</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. Security of Data</h2>
            <p>
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="policy-section">
            <h2>5. Service Providers</h2>
            <p>
              We may employ third party companies and individuals to facilitate our service ("Service Providers"), to provide the service on our behalf, to perform service-related services or to assist us in analyzing how our service is used. These third parties have access to your personal data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section className="policy-section">
            <h2>6. Links to Other Sites</h2>
            <p>
              Our service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
            </p>
          </section>

          <section className="policy-section">
            <h2>7. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
            </p>
          </section>

          <section className="policy-section">
            <h2>8. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Withdraw consent at any time</li>
              <li>Restrict processing of your data</li>
              <li>Request portability of your data</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>9. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
          </section>

          <section className="policy-section">
            <h2>10. Children's Privacy</h2>
            <p>
              Our service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us immediately.
            </p>
          </section>

          <section className="policy-section">
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our website contact form or email support. We will respond to your inquiry within a reasonable timeframe.
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
