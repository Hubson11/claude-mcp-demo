import { render, screen, fireEvent } from '@testing-library/react'
import { Newsletter } from './Newsletter'

describe('Newsletter', () => {
  it('renders the section', () => {
    render(<Newsletter />)
    expect(screen.getByTestId('newsletter-section')).toBeInTheDocument()
  })

  it('renders the email input and submit button', () => {
    render(<Newsletter />)
    expect(screen.getByTestId('newsletter-input')).toBeInTheDocument()
    expect(screen.getByTestId('newsletter-submit')).toBeInTheDocument()
  })

  it('shows success message after valid email submitted', () => {
    render(<Newsletter />)
    fireEvent.change(screen.getByTestId('newsletter-input'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByTestId('newsletter-submit'))
    expect(screen.getByTestId('newsletter-success')).toBeInTheDocument()
  })

  it('shows error for invalid email', () => {
    render(<Newsletter />)
    fireEvent.change(screen.getByTestId('newsletter-input'), {
      target: { value: 'not-an-email' },
    })
    fireEvent.click(screen.getByTestId('newsletter-submit'))
    expect(screen.queryByTestId('newsletter-success')).not.toBeInTheDocument()
  })
})
