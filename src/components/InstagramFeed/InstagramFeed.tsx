import styles from './InstagramFeed.module.css'

const IMAGES = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  src: `https://picsum.photos/seed/insta${i + 1}/309/309`,
  alt: `Instagram post ${i + 1}`,
}))

export function InstagramFeed() {
  return (
    <section className={styles.section} data-testid="instagram-section">
      <div className="container">
        <h2 className={styles.heading}>Instagram</h2>
        <p className={styles.subheading}>Follow us on @qodeinteractive</p>

        <div className={styles.grid}>
          {IMAGES.map((img) => (
            <a
              key={img.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.item}
              aria-label={img.alt}
              data-testid="instagram-image"
            >
              <img
                src={img.src}
                alt={img.alt}
                className={styles.image}
                loading="lazy"
              />
              <div className={styles.overlay} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
