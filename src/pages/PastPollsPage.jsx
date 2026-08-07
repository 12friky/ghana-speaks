import PageShell from '../components/PageShell'
import './PastPollsPage.css'

function PastPollsPage({ onNavigate }) {
  const polls = [
    { title: 'Education Budget', date: 'March 2025', result: '82% support' },
    { title: 'Transport Reform', date: 'February 2025', result: '67% support' },
    { title: 'Digital Tax', date: 'January 2025', result: '54% support' },
  ]

  return (
    <PageShell
      activePage="past"
      onNavigate={onNavigate}
      title="Past Polls"
      subtitle="Browse previous public opinion snapshots."
    >
      <section className="page-section">
        <div className="card-list">
          {polls.map((poll) => (
            <article key={poll.title} className="card">
              <h3>{poll.title}</h3>
              <p>{poll.date}</p>
              <strong>{poll.result}</strong>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  )
}

export default PastPollsPage
