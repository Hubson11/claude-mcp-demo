import { useState } from 'react'
import { ProductCard } from '../ProductCard/ProductCard'
import { PRODUCTS } from '../../data/products'
import styles from './ProductSection.module.css'

const TABS = ['All Products', 'Lifestyle', 'Brand', 'Outwear']

interface ProductSectionProps {
  onAddToCart: (id: string) => void
}

export function ProductSection({ onAddToCart }: ProductSectionProps) {
  const [activeTab, setActiveTab] = useState('All Products')

  const filtered =
    activeTab === 'All Products'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeTab)

  return (
    <section className={styles.section} data-testid="product-section">
      <div className="container">
        <div className={styles.filterRow} data-testid="filter-row">
          <ul className={styles.tabs}>
            {TABS.map((tab) => (
              <li key={tab}>
                <button
                  className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                  data-testid="filter-tab"
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.grid} data-testid="product-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
