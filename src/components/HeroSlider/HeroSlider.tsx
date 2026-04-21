import { useState, useEffect, useRef } from 'react'
import styles from './HeroSlider.module.css'

interface Slide {
  id: number
  image: string
  title: string
  subtitle: string
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: 'https://picsum.photos/seed/hero1/1920/1080',
    title: 'Mixed Textiles',
    subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.',
  },
  {
    id: 2,
    image: 'https://picsum.photos/seed/hero2/1920/1080',
    title: 'New Collection',
    subtitle: 'Discover the latest arrivals crafted with premium materials.',
  },
  {
    id: 3,
    image: 'https://picsum.photos/seed/hero3/1920/1080',
    title: 'Artisan Made',
    subtitle: 'Each piece tells a story of craftsmanship and design.',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const advance = () =>
    setCurrent((c) => (c + 1) % SLIDES.length)

  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(advance, 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused])

  const slide = SLIDES[current]

  return (
    <section
      className={styles.hero}
      data-testid="hero-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={styles.bg}
        style={{ backgroundImage: `url(${slide.image})` }}
        aria-hidden="true"
      />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={`container ${styles.content}`}>
        <h1 className={styles.title} data-testid="hero-title">
          {slide.title}
        </h1>
        <p className={styles.subtitle}>{slide.subtitle}</p>
        <a href="/shop" className={styles.cta} data-testid="hero-cta">
          Shop Now
        </a>
      </div>

      <div className={styles.arrows}>
        <button
          className={styles.arrow}
          onClick={() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)}
          aria-label="Previous slide"
        >
          <svg width="15" height="29" viewBox="0 0 15 30" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M13 28L2 15L13 2" />
          </svg>
        </button>
        <button
          className={styles.arrow}
          onClick={advance}
          aria-label="Next slide"
        >
          <svg width="15" height="29" viewBox="0 0 15 30" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M2 2L13 15L2 28" />
          </svg>
        </button>
      </div>

      <div className={styles.progress} aria-hidden="true">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`${styles.progressBar} ${i === current ? styles.progressActive : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
