import { render, screen } from '@testing-library/react'
import { Statistics } from './Statistics'

const defaultProps = {
  totalCustomers: 5423,
  totalCustomersChange: 16,
  members: 1893,
  membersChange: -1,
  activeNow: 189,
}

describe('Statistics', () => {
  it('renders all three stat sections', () => {
    render(<Statistics {...defaultProps} />)
    expect(screen.getByTestId('stat-total-customers')).toBeInTheDocument()
    expect(screen.getByTestId('stat-members')).toBeInTheDocument()
    expect(screen.getByTestId('stat-active-now')).toBeInTheDocument()
  })

  it('formats numbers with commas', () => {
    render(<Statistics {...defaultProps} />)
    expect(screen.getByText('5,423')).toBeInTheDocument()
    expect(screen.getByText('1,893')).toBeInTheDocument()
    expect(screen.getByText('189')).toBeInTheDocument()
  })

  it('shows green percentage and up arrow for positive change', () => {
    render(<Statistics {...defaultProps} />)
    const upArrow = screen.getAllByAltText('increase')
    expect(upArrow).toHaveLength(1)
    expect(screen.getByText('16%')).toBeInTheDocument()
  })

  it('shows red percentage and down arrow for negative change', () => {
    render(<Statistics {...defaultProps} />)
    expect(screen.getByAltText('decrease')).toBeInTheDocument()
    expect(screen.getByText('1%')).toBeInTheDocument()
  })

  it('shows no trend indicator for Active Now', () => {
    render(<Statistics {...defaultProps} />)
    const activeNow = screen.getByTestId('stat-active-now')
    expect(activeNow.querySelector('[class*="trend"]')).toBeNull()
  })

  it('shows "this month" text for trending stats', () => {
    render(<Statistics {...defaultProps} />)
    const thisMonthTexts = screen.getAllByText(/this month/)
    expect(thisMonthTexts).toHaveLength(2)
  })
})
