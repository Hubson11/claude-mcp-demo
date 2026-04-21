import { useState } from 'react'
import styles from './Navbar.module.css'

const NAV_LINKS = ['Home', 'Shop', 'About', 'Journal', 'Contact']

interface NavbarProps {
  cartCount?: number
  wishlistCount?: number
}

export function Navbar({ cartCount = 0, wishlistCount = 0 }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className={styles.header} data-testid="navbar">
      <div className={`container ${styles.inner}`}>
        <a href="/" className={styles.logo} aria-label="Nexus Store home">
          <span className={styles.logoText}>NEXUS</span>
        </a>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <ul className={styles.navList}>
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <a
                  href={`/${link.toLowerCase()}`}
                  className={styles.navLink}
                  data-testid="nav-link"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <button
            className={styles.iconBtn}
            aria-label={`Wishlist (${wishlistCount} items)`}
            data-testid="wishlist-icon"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span className={styles.badge}>{wishlistCount}</span>
            )}
          </button>

          <button
            className={styles.iconBtn}
            aria-label={`Cart (${cartCount} items)`}
            data-testid="cart-icon"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className={styles.badge} data-testid="cart-count">
                {cartCount}
              </span>
            )}
          </button>

          <button
            className={styles.iconBtn}
            aria-label="Search"
            data-testid="search-icon"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <button
            className={styles.menuToggle}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
