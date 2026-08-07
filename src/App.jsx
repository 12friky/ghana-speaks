import { useEffect, useState } from 'react'
import api from './api'
import HomePage from './pages/HomePage'
import PastPollsPage from './pages/PastPollsPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import AdminPage from './pages/AdminPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminId, setAdminId] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [poll, setPoll] = useState(null)
  const [loadingPoll, setLoadingPoll] = useState(true)
  const [loginError, setLoginError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [fetchError, setFetchError] = useState('')

  const fetchCurrentPoll = async () => {
    setLoadingPoll(true)
    try {
      const response = await api.get('/api/polls/current')
      setPoll(response.data.poll)
      setFetchError('')
    } catch (error) {
      setFetchError(
        error?.response?.data?.message || 'Unable to load the current poll.'
      )
    } finally {
      setLoadingPoll(false)
    }
  }

  useEffect(() => {
    fetchCurrentPoll()
  }, [])

  const handleAdminLogin = async (event) => {
    event.preventDefault()

    try {
      await api.post('/api/admin/login', {
        id: adminId,
        password: adminPassword,
      })

      setShowAdminLogin(false)
      setAdminId('')
      setAdminPassword('')
      setLoginError('')
      setCurrentPage('admin')
      await fetchCurrentPoll()
    } catch (error) {
      setLoginError(
        error?.response?.data?.message || 'Login failed. Please try again.'
      )
    }
  }

  const handleNavigate = (page) => {
    if (page === 'admin') {
      setLoginError('')
      setShowAdminLogin(true)
      return
    }

    setCurrentPage(page)
  }

  const handleSavePoll = async (updatedPoll) => {
    try {
      const response = await api.put('/api/admin/poll', updatedPoll)
      setPoll(response.data.poll)
      setSaveError('')
      setCurrentPage('home')
    } catch (error) {
      setSaveError(
        error?.response?.data?.message || 'Unable to save poll. Please try again.'
      )
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/api/admin/logout')
    } catch (error) {
      console.warn('Logout failed.', error)
    }

    setCurrentPage('home')
    setShowAdminLogin(false)
  }

  return (
    <>
      {showAdminLogin ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Admin Login</h3>
            <p>Use the demo credentials 12345 / 12345.</p>
            <form onSubmit={handleAdminLogin} className="modal-form">
              <label className="field">
                <span>ID</span>
                <input value={adminId} onChange={(event) => setAdminId(event.target.value)} />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                />
              </label>
              {loginError ? <p className="auth-error">{loginError}</p> : null}
              <div className="modal-actions">
                <button type="submit" className="submit-btn">Login</button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowAdminLogin(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {currentPage === 'past' ? (
        <PastPollsPage onNavigate={handleNavigate} />
      ) : currentPage === 'about' ? (
        <AboutPage onNavigate={handleNavigate} />
      ) : currentPage === 'contact' ? (
        <ContactPage onNavigate={handleNavigate} />
      ) : currentPage === 'admin' ? (
        <AdminPage
          onNavigate={handleNavigate}
          poll={poll}
          onSavePoll={handleSavePoll}
          onLogout={handleLogout}
          saveError={saveError}
        />
      ) : (
        <HomePage
          onNavigate={handleNavigate}
          poll={poll}
          refreshPoll={fetchCurrentPoll}
          loading={loadingPoll}
          fetchError={fetchError}
        />
      )}
    </>
  )
}

export default App
