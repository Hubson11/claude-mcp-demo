import { useState } from 'react'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  imageUrl: string
  badge?: 'Sale' | 'New' | null
  rating: number
  reviewCount: number
  category: string
  onAddToCart: (id: string) => void
}

export function ProductCard({
  id,
  name,
  description,
  price,
  originalPrice,
  imageUrl,
  badge,
  rating,
  reviewCount,
  onAddToCart,
}: ProductCardProps) {
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    onAddToCart(id)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <article className={styles.card} data-testid="product-card">
      <div className={styles.imageWrapper}>
        <img
          src={imageUrl}
          alt={name}
          className={styles.image}
          loading="lazy"
        />
        {badge && (
          <span
            className={`${styles.badge} ${badge === 'Sale' ? styles.badgeSale : styles.badgeNew}`}
            data-testid="badge"
          >
            {badge}
          </span>
        )}
      </div>

      <div className={styles.content} data-testid="product-content">
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.description}>{description}</p>

        <div className={styles.rating} data-testid="rating">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={i < rating ? styles.starFilled : styles.starEmpty}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
          <span className={styles.reviewCount}>({reviewCount} reviews)</span>
        </div>

        <div className={styles.priceRow} data-testid="price">
          <span className={styles.price}>${price}</span>
          {originalPrice && (
            <span className={styles.originalPrice}>${originalPrice}</span>
          )}
        </div>

        <button
          className={`${styles.addToCart} ${added ? styles.added : ''}`}
          onClick={handleAddToCart}
          aria-label={`Add ${name} to cart`}
          data-testid="add-to-cart-btn"
        >
          {added ? 'Added' : 'Add to Cart'}
        </button>
      </div>
    </article>
  )
}
