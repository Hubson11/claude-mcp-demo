// TODO: Tests to be implemented by Claude during demo
import { render, screen } from '@testing-library/react'
import { ProductCard } from './ProductCard'

const mockProps = {
  id: '1',
  name: 'Nexus Pro Headphones',
  description: 'Premium wireless headphones with noise cancellation',
  price: 199.99,
  originalPrice: 249.99,
  imageUrl: '/products/headphones.jpg',
  badge: 'Sale' as const,
  rating: 4.5,
  reviewCount: 128,
  onAddToCart: vi.fn(),
}

describe('ProductCard', () => {
  it('renders the product card container', () => {
    render(<ProductCard {...mockProps} />)
    expect(screen.getByTestId('product-card')).toBeInTheDocument()
  })

  // These tests will pass once Claude implements the component during the demo
  it.todo('renders the product name')
  it.todo('displays the sale badge')
  it.todo('displays discounted price with strikethrough')
  it.todo('calls onAddToCart with product id when button clicked')
  it.todo('displays star rating')
})
