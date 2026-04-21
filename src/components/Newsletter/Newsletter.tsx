import { useState } from 'react'
import styles from './Newsletter.module.css'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setSubmitted(true)
  }

  return (
    <section className={styles.section} data-testid="newsletter-section">
      <div className="container">
        <h2 className={styles.heading}>
          Sign up to our newsletter for all the latest news &amp; discounts.
        </h2>

        {submitted ? (
          <p className={styles.success} data-testid="newsletter-success">
            Thank you! You are subscribed.
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={styles.input}
              aria-label="Email address"
              data-testid="newsletter-input"
            />
            <button
              type="submit"
              className={styles.submit}
              data-testid="newsletter-submit"
            >
              Subscribe
            </button>
          </form>
        )}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </section>
  )
}
