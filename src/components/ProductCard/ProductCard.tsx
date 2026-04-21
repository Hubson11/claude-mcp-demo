// TODO: To be implemented by Claude during demo
// Claude will read the Figma design and Confluence spec to implement this component

export interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  imageUrl: string
  badge?: 'Sale' | 'New' | null
  rating: number
  reviewCount: number
  onAddToCart: (id: string) => void
}

export function ProductCard(_props: ProductCardProps) {
  return <div data-testid="product-card">ProductCard — not yet implemented</div>
}
