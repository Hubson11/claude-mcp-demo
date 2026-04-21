import styles from './ArtistsSection.module.css'

export function ArtistsSection() {
  return (
    <section className={styles.section} data-testid="artists-section">
      <div className={styles.images}>
        <div className={styles.imgWrapper}>
          <img
            src="https://picsum.photos/seed/artist1/493/697"
            alt="Maria"
            className={styles.img}
            loading="lazy"
          />
        </div>
        <div className={styles.imgWrapper}>
          <img
            src="https://picsum.photos/seed/artist2/493/697"
            alt="Sophia"
            className={styles.img}
            loading="lazy"
          />
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>
          Meet The Artists Behind The Corsen Maria &amp; Sophia
        </h2>
        <p className={styles.body}>
          Lorem ipsum dolor sit amet, consectetur elit, sed do eiusmod tempor
          incididunt ut labore et dolore magna.
        </p>
        <a
          href="/shop"
          className={styles.cta}
          data-testid="artists-cta"
        >
          Shop Collection
        </a>
      </div>
    </section>
  )
}
