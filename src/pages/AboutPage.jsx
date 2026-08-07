import PageShell from '../components/PageShell'
import './AboutPage.css'

function AboutPage({ onNavigate }) {
  return (
    <PageShell
      activePage="about"
      onNavigate={onNavigate}
      title="About Us"
      subtitle="Learn more about our mission and community values."
    >
      <section className="page-section">
        <div className="card">
          <h3>Who We Are</h3>
          <p>
            GhanaSpeaks is a civic engagement platform that helps citizens share opinions on important national topics.
          </p>
        </div>
      </section>
    </PageShell>
  )
}

export default AboutPage
