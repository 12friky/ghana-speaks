import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import PageShell from '../components/PageShell'
import './HomePage.css'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://ghanaspeaks.com'

function HomePage({ onNavigate, poll, refreshPoll, fetchError }) {
  const [selected, setSelected] = useState(null)
  const [voted, setVoted] = useState(false)
  const [message, setMessage] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmittingVote, setIsSubmittingVote] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [voterId] = useState(() => {
    let stored = localStorage.getItem('voter-id')

    if (!stored) {
      stored = `voter-${Date.now()}-${Math.floor(Math.random() * 100000)}`
      localStorage.setItem('voter-id', stored)
    }

    return stored
  })
  const [now, setNow] = useState(Date.now())

  const pollId = poll?.pollId || poll?._id || poll?.id || 'current-poll'
  const pollClosed = poll?.status !== 'active'

  useEffect(() => {
    let ignore = false

    const checkVoteStatus = async () => {
      if (!pollId || pollId === 'current-poll' || !voterId) {
        return
      }

      try {
        const response = await api.get(`/api/polls/${pollId}/vote-status`, {
          params: { voterId },
        })

        if (!ignore) {
          const hasVoted = Boolean(response.data?.hasVoted)
          setVoted(hasVoted)

          if (hasVoted) {
            localStorage.setItem(`vote-${pollId}`, 'true')
          } else {
            localStorage.removeItem(`vote-${pollId}`)
          }
        }
      } catch (error) {
        if (!ignore) {
          const alreadyVoted = Boolean(localStorage.getItem(`vote-${pollId}`))
          setVoted(alreadyVoted)
        }
      }
    }

    checkVoteStatus()

    return () => {
      ignore = true
    }
  }, [pollId, voterId])

  const pollCreatedAt = poll?.createdAt || null

  const pollEndTime = useMemo(() => {
    if (!pollCreatedAt) return null

    const created = new Date(pollCreatedAt)
    const durationMs = 7 * 24 * 60 * 60 * 1000
    return new Date(created.getTime() + durationMs)
  }, [pollCreatedAt])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const timeRemaining = useMemo(() => {
    if (!poll || pollClosed || !pollEndTime) {
      return 'Closed'
    }

    const diff = pollEndTime.getTime() - now

    if (diff <= 0) {
      return 'Closed'
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const seconds = Math.floor((diff / 1000) % 60)

    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }, [now, poll, pollClosed, pollEndTime])

  const { options, totalVotes, maxVotes } = useMemo(() => {
    if (!poll?.options) {
      return { options: [], totalVotes: 0, maxVotes: 0 }
    }

    const totalVotes = poll.options.reduce((sum, option) => sum + (option.votes || 0), 0)
    const maxVotes = Math.max(...poll.options.map((option) => option.votes || 0), 0)

    return {
      totalVotes,
      maxVotes,
      options: poll.options.map((option, index) => ({
        ...option,
        color: ['#EA2A2A', '#eab308', '#ef4444', '#9ca3af'][index % 4],
        bg: ['#eafaf0', '#fdf6e3', '#fdecec', '#f3f4f6'][index % 4],
        pct:
          totalVotes === 0
            ? 0
            : Math.round(((option.votes || 0) / totalVotes) * 100),
      })),
    }
  }, [poll])

  useEffect(() => {
    if (!showSuccessModal) return
    const timeout = setTimeout(() => setShowSuccessModal(false), 4200)
    return () => clearTimeout(timeout)
  }, [showSuccessModal])

  useEffect(() => {
    if (!poll) return

    const title = `${poll.question || 'Ghana Speaks Poll'} | Ghana Speaks`
    const description = `View the latest poll results and vote on Ghana Speaks.`
    const pollIdentifier = poll.pollId || poll._id || poll.id
    const imageUrl = `${SITE_URL}/api/polls/${pollIdentifier}/share-image`

    document.title = title

    const metaTags = [
      ['og:title', title],
      ['og:description', description],
      ['og:image', imageUrl],
      ['og:url', `${SITE_URL}/poll/${pollIdentifier}`],
      ['og:type', 'article'],
      ['twitter:card', 'summary_large_image'],
      ['twitter:title', title],
      ['twitter:description', description],
      ['twitter:image', imageUrl],
    ]

    metaTags.forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`)

      if (!tag) {
        tag = document.createElement('meta')
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          tag.setAttribute('property', property)
        } else {
          tag.setAttribute('name', property)
        }
        document.head.appendChild(tag)
      }

      tag.setAttribute('content', content)
    })
  }, [poll])

  const handleVote = async () => {
    if (!selected) {
      setMessage('Select an option before voting.')
      return
    }

    setIsSubmittingVote(true)

    try {
      const response = await api.post(`/api/polls/${pollId}/vote`, {
        optionId: selected,
        voterId,
      })

      localStorage.setItem(`vote-${pollId}`, 'true')
      setVoted(true)
      setShowSuccessModal(true)
      setMessage(response?.data?.message || 'Vote submitted successfully.')
      refreshPoll?.()
    } catch (error) {
      if (error?.response?.status === 409) {
        localStorage.setItem(`vote-${pollId}`, 'true')
        setVoted(true)
        setMessage('You have already voted in this poll.')
      } else {
        setMessage(
          error?.response?.data?.message || 'Unable to submit vote. Please try again.'
        )
      }
    } finally {
      setIsSubmittingVote(false)
    }
  }

  const handleShare = async () => {
    try {
      setIsSharing(true)
      setShareMessage('')

      const shareUrl = window.location.href

      if (navigator.share) {
        await navigator.share({
          title: 'GhanaSpeaks Poll',
          text: poll?.question || 'Check out this poll on GhanaSpeaks',
          url: shareUrl,
        })
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setShareMessage('Poll link copied to clipboard.')
      } else {
        window.prompt('Copy this poll link:', shareUrl)
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setShareMessage('Unable to share the poll right now.')
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <PageShell
      activePage="home"
      onNavigate={onNavigate}
      title="This Week's National Poll 🇬🇭"
      subtitle="Your voice matters. Together, we shape our future."
      onShare={handleShare}
    >
      <section className="content-grid">
        <div className="main-col">
          <div className="card poll-card">
            <div className="poll-timer">
              <span className="calendar-icon">📅</span>
              <span>Poll closes in:</span>
              <span className="timer-pill">{timeRemaining}</span>
            </div>

            <h2 className="poll-question">
              {poll?.question || 'How effective has the government been in fighting illegal mining (galamsey)?'}
            </h2>
            <hr className="poll-divider" />

            <div className="options-list">
              {options.map((opt) => (
                <label
                  key={opt.id}
                  className={`option-row ${selected === opt.id ? 'option-row-selected' : ''}`}
                >
                  <div
                    className="option-progress"
                    style={{ width: `${opt.pct}%`, background: opt.color }}
                  />
                  <input
                    type="radio"
                    name="poll"
                    checked={selected === opt.id}
                    onChange={() => setSelected(opt.id)}
                  />
                  <span className="option-icon">{opt.icon}</span>
                  <span className="option-text">
                    <span className="option-label">{opt.label}</span>
                    <span className="option-sub">{opt.sub}</span>
                  </span>
                </label>
              ))}
            </div>

            <button
              className="submit-btn"
              disabled={!selected || voted || pollClosed || isSubmittingVote}
              onClick={handleVote}
            >
              <span className="submit-icon">📊</span>
              {isSubmittingVote
                ? 'Submitting...'
                : pollClosed
                  ? 'Poll Closed'
                  : voted
                    ? 'Vote Submitted'
                    : 'Submit My Vote'}
            </button>
            {message ? <p className="info-text">{message}</p> : null}

            {showSuccessModal ? (
              <div className="modal-overlay success-modal" role="dialog" aria-modal="true">
                <div className="modal-card success-card">
                  <div className="success-icon">✔</div>
                  <h3>Well done!</h3>
                  <p>Your voice is your power. Thanks for voting.</p>
                  <button
                    type="button"
                    className="close-success-btn"
                    onClick={() => setShowSuccessModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}

            <p className="vote-once">🔒 {pollClosed ? 'Voting is closed for this poll.' : 'You can only vote once.'}</p>
          </div>

          {fetchError ? (
            <div className="info-card">
              <p>{fetchError}</p>
            </div>
          ) : null}

          <div className="card results-card">
            <div className="results-header">
              <div className="results-title">
                <span className="live-dot" />
                Live Results (So far)
              </div>
              <span className="total-votes">Total Votes: {totalVotes.toLocaleString()}</span>
            </div>

            <div className="results-list">
              {options.map((opt) => (
                <div className="result-row" key={opt.id}>
                  <div className="result-top">
                    <span>{opt.label}</span>
                    <span className="result-pct">
                      {opt.pct}% ({opt.votes.toLocaleString()})
                    </span>
                  </div>
                  <div className="result-bar-track">
                    <div
                      className="result-bar-fill"
                      style={{ width: `${opt.pct}%`, background: opt.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mini-chart" aria-label="Poll results bar chart">
              {options.map((opt) => {
                const heightPct = maxVotes === 0 ? 0 : Math.round(((opt.votes || 0) / maxVotes) * 100)
                return (
                  <div className="mini-chart-column" key={opt.id}>
                    <div className="mini-chart-bar-wrap">
                      <div
                        className="mini-chart-bar"
                        style={{ height: `${heightPct}%`, background: opt.color }}
                      />
                    </div>
                    <span className="mini-chart-label">{opt.label}</span>
                  </div>
                )
              })}
            </div>

            <p className="results-note">Results update in real-time</p>
          </div>
        </div>

        <div className="side-col">
          <div className="card info-card">
            <div className="info-title">
              <span>ℹ️</span> About This Poll
            </div>
            <p>
              This poll reflects the opinion of visitors to GhanaSpeaks.com. It is not an
              official survey.
            </p>
          </div>

          <div className="card info-card">
            <div className="info-title">
              <span>📣</span> Make Your Voice Heard
            </div>
            <p>Share this poll with your friends and family and let's build a better Ghana together.</p>
            <button className="share-outline-btn" type="button" onClick={handleShare} disabled={isSharing}>
              <span>↗</span> {isSharing ? 'Sharing...' : 'Share Poll'}
            </button>
            {shareMessage ? <p className="share-feedback">{shareMessage}</p> : null}
          </div>
        </div>
      </section>

      <section className="ad-banner">
        <span className="ad-tag">Ad</span>
        <div>
          <div className="ad-title">Advertisement Space (Google AdSense)</div>
          <div className="ad-sub">728 x 90</div>
        </div>
      </section>

      <section className="past-polls-banner">
        <div className="past-polls-left">
          <span className="past-polls-icon">📋</span>
          <div>
            <div className="past-polls-title">See Past Poll Results</div>
            <div className="past-polls-sub">Check how Ghanaians voted on our previous national issues.</div>
          </div>
        </div>
        <button className="view-past-btn" type="button">View Past Polls →</button>
      </section>
    </PageShell>
  )
}

export default HomePage
