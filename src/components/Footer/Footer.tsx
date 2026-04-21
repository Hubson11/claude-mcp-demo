import styles from './Footer.module.css'

const LINK_GROUPS = [
  {
    title: 'About',
    links: ['Our Story', 'Sustainability', 'Careers', 'Press'],
  },
  {
    title: 'Shop',
    links: ['New Arrivals', 'Women', 'Men', 'Accessories'],
  },
  {
    title: 'Support',
    links: ['FAQ', 'Shipping', 'Returns', 'Size Guide'],
  },
  {
    title: 'Contact',
    links: ['hello@nexusstore.com', '+1 (800) 123-4567', 'Live Chat', 'Store Locator'],
  },
]

export function Footer() {
  return (
    <footer data-testid="footer">
      <div className={styles.top}>
        <div className="container">
          <div className={styles.grid}>
            {LINK_GROUPS.map((group) => (
              <div key={group.title} className={styles.group}>
                <h4 className={styles.groupTitle}>{group.title}</h4>
                <ul className={styles.linkList}>
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#" className={styles.link} data-testid="footer-link">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>
              &copy; {new Date().getFullYear()} Nexus Store. All rights reserved.
            </p>
            <div className={styles.socials}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                data-testid="social-icon"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                data-testid="social-icon"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                data-testid="social-icon"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
