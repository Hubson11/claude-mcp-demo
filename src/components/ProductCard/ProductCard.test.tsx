import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from './ProductCard'

const mockProps = {
  id: '1',
  name: 'Nexus Pro Headphones',
  description: 'Premium wireless headphones with noise cancellation',
  price: 199,
  originalPrice: 249,
  imageUrl: '/products/headphones.jpg',
  badge: 'Sale' as const,
  rating: 4,
  reviewCount: 128,
  category: 'Brand',
  onAddToCart: vi.fn(),
}

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the product card container', () => {
    render(<ProductCard {...mockProps} />)
    expect(screen.getByTestId('product-card')).toBeInTheDocument()
  })

  it('renders the product name', () => {
    render(<ProductCard {...mockProps} />)
    expect(screen.getByText('Nexus Pro Headphones')).toBeInTheDocument()
  })

  it('displays the sale badge', () => {
    render(<ProductCard {...mockProps} />)
    expect(screen.getByTestId('badge')).toHaveTextContent('Sale')
  })

  it('does not render badge when badge is null', () => {
    render(<ProductCard {...mockProps} badge={null} />)
    expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
  })

  it('displays discounted price with strikethrough', () => {
    render(<ProductCard {...mockProps} />)
    expect(screen.getByText('$199')).toBeInTheDocument()
    expect(screen.getByText('$249')).toBeInTheDocument()
  })

  it('calls onAddToCart with product id when button clicked', () => {
    render(<ProductCard {...mockProps} />)
    fireEvent.click(screen.getByTestId('add-to-cart-btn'))
    expect(mockProps.onAddToCart).toHaveBeenCalledWith('1')
  })

  it('displays star rating', () => {
    render(<ProductCard {...mockProps} />)
    expect(screen.getByTestId('rating')).toBeInTheDocument()
    expect(screen.getByText('(128 reviews)')).toBeInTheDocument()
  })

  it('shows Added text temporarily after clicking add to cart', () => {
    render(<ProductCard {...mockProps} />)
    const btn = screen.getByTestId('add-to-cart-btn')
    fireEvent.click(btn)
    expect(btn).toHaveTextContent('Added')
  })
})
