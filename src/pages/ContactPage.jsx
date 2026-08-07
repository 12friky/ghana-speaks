import PageShell from '../components/PageShell'
import './ContactPage.css'

function ContactPage({ onNavigate }) {
  return (
    <PageShell
      activePage="contact"
      onNavigate={onNavigate}
      title="Contact"
      subtitle="We would love to hear from you."
    >
      <section className="page-section">
        <div className="card">
          <h3>Get In Touch</h3>
          <p>Email: hello@ghanaspeaks.com</p>
          <p>Phone: +233 24 123 4567</p>
        </div>
      </section>
    </PageShell>
  )
}

export default ContactPage
