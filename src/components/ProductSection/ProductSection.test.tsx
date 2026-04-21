import { render, screen, fireEvent } from '@testing-library/react'
import { ProductSection } from './ProductSection'

describe('ProductSection', () => {
  const onAddToCart = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the product section', () => {
    render(<ProductSection onAddToCart={onAddToCart} />)
    expect(screen.getByTestId('product-section')).toBeInTheDocument()
  })

  it('renders filter tabs', () => {
    render(<ProductSection onAddToCart={onAddToCart} />)
    const tabs = screen.getAllByTestId('filter-tab')
    expect(tabs).toHaveLength(4)
  })

  it('renders all products by default', () => {
    render(<ProductSection onAddToCart={onAddToCart} />)
    const cards = screen.getAllByTestId('product-card')
    expect(cards).toHaveLength(8)
  })

  it('filters products by category on tab click', () => {
    render(<ProductSection onAddToCart={onAddToCart} />)
    const tabs = screen.getAllByTestId('filter-tab')
    const lifestyleTab = tabs.find((t) => t.textContent === 'Lifestyle')
    fireEvent.click(lifestyleTab!)
    const cards = screen.getAllByTestId('product-card')
    expect(cards.length).toBeGreaterThan(0)
    expect(cards.length).toBeLessThan(8)
  })
})
