import { useEffect, useState } from 'react'
import PageShell from '../components/PageShell'
import './AdminPage.css'

function AdminPage({ onNavigate, poll, onSavePoll, onLogout, saveError }) {
  const safePoll = poll || {
    question: '',
    status: 'active',
    options: [],
  }

  const [question, setQuestion] = useState(safePoll.question)
  const [status, setStatus] = useState(safePoll.status)
  const [options, setOptions] = useState(safePoll.options)
  const [draftOption, setDraftOption] = useState({ label: '', sub: '', icon: '👍' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    setQuestion(safePoll.question)
    setStatus(safePoll.status)
    setOptions(safePoll.options)
  }, [safePoll])

  const handleAddOption = () => {
    if (!draftOption.label.trim()) {
      setMessage('Please add an option label before saving it.')
      return
    }

    const option = {
      id: `opt-${Date.now()}`,
      icon: draftOption.icon || '👍',
      label: draftOption.label.trim(),
      sub: draftOption.sub.trim() || 'New response',
      votes: 0,
    }

    setOptions((current) => [...current, option])
    setDraftOption({ label: '', sub: '', icon: '👍' })
    setMessage('Option added to the draft poll.')
  }

  const handleRemoveOption = (id) => {
    setOptions((current) => current.filter((option) => option.id !== id))
  }

  const handleSave = (event) => {
    event.preventDefault()

    if (!question.trim()) {
      setMessage('The poll question cannot be empty.')
      return
    }

    if (options.length < 2) {
      setMessage('Add at least two answer options to publish the poll.')
      return

    }

    const normalizedOptions = options.map((option) => ({
      ...option,
      label: option.label.trim(),
      sub: option.sub.trim() || 'New response',
    }))

    onSavePoll({
      ...safePoll,
      question: question.trim(),
      status,
      options: normalizedOptions,
    })

    setMessage('Poll saved successfully.')
  }

  return (
    <PageShell
      activePage="admin"
      onNavigate={onNavigate}
      title="Admin Dashboard"
      subtitle="Create new questions, manage options, and control the active poll."
    >
      <section className="admin-layout">
        <div className="card admin-card">
          <div className="admin-card-header">
            <div>
              <h3>Manage Poll</h3>
              <p>Use this board to publish a question and decide whether the poll is active.</p>
            </div>
            <div className="admin-header-actions">
              {onLogout ? (
                <button type="button" className="secondary-btn" onClick={onLogout}>
                  Logout
                </button>
              ) : null}
              <span className={`status-pill ${status === 'active' ? 'active' : 'closed'}`}>
                {status === 'active' ? 'Live' : 'Closed'}
              </span>
            </div>
          </div>

          <form className="admin-form" onSubmit={handleSave}>
            <label className="field">
              <span>Poll question</span>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows="3"
                placeholder="Enter your poll question"
              />
            </label>

            <label className="field">
              <span>Poll status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </label>

            <div className="admin-option-builder">
              <h4>Add a new option</h4>
              <div className="admin-option-grid">
                <label className="field compact">
                  <span>Icon</span>
                  <input
                    value={draftOption.icon}
                    onChange={(event) => setDraftOption((current) => ({ ...current, icon: event.target.value }))}
                    placeholder="👍"
                  />
                </label>
                <label className="field compact">
                  <span>Label</span>
                  <input
                    value={draftOption.label}
                    onChange={(event) => setDraftOption((current) => ({ ...current, label: event.target.value }))}
                    placeholder="Very effective"
                  />
                </label>
                <label className="field compact">
                  <span>Subtitle</span>
                  <input
                    value={draftOption.sub}
                    onChange={(event) => setDraftOption((current) => ({ ...current, sub: event.target.value }))}
                    placeholder="Short description"
                  />
                </label>
              </div>
              <button type="button" className="secondary-btn" onClick={handleAddOption}>
                Add option
              </button>
            </div>

            <div className="admin-option-list">
              {options.map((option) => (
                <div className="admin-option-item" key={option.id}>
                  <div>
                    <strong>{option.icon} {option.label}</strong>
                    <p>{option.sub}</p>
                  </div>
                  <button type="button" className="ghost-btn" onClick={() => handleRemoveOption(option.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="admin-actions">
              <button type="submit" className="submit-btn">Save poll</button>
              <button type="button" className="secondary-btn" onClick={() => onNavigate('home')}>
                Back to public page
              </button>
            </div>
            {saveError ? <p className="admin-error">{saveError}</p> : null}
            {message ? <p className="admin-message">{message}</p> : null}
          </form>
        </div>
      </section>
    </PageShell>
  )
}

export default AdminPage
