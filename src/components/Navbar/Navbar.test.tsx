import { render, screen } from '@testing-library/react'
import { Navbar } from './Navbar'

describe('Navbar', () => {
  it('renders the navbar', () => {
    render(<Navbar />)
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
  })

  it('renders all nav links', () => {
    render(<Navbar />)
    const links = screen.getAllByTestId('nav-link')
    expect(links).toHaveLength(5)
  })

  it('renders cart icon', () => {
    render(<Navbar />)
    expect(screen.getByTestId('cart-icon')).toBeInTheDocument()
  })

  it('renders wishlist icon', () => {
    render(<Navbar />)
    expect(screen.getByTestId('wishlist-icon')).toBeInTheDocument()
  })

  it('shows cart count badge when cartCount > 0', () => {
    render(<Navbar cartCount={3} />)
    expect(screen.getByTestId('cart-count')).toHaveTextContent('3')
  })
})
