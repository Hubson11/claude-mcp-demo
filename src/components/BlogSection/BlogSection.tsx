import styles from './BlogSection.module.css'

interface Article {
  id: number
  image: string
  date: string
  title: string
  excerpt: string
}

const ARTICLES: Article[] = [
  {
    id: 1,
    image: 'https://picsum.photos/seed/blog1/527/561',
    date: 'Jan 15',
    title: 'The Art of Slow Fashion',
    excerpt:
      'Lorem ipsum dolor sit amet, consectetur adipiscing ectetur elit, sed do eiusmod tempor incididunt.',
  },
  {
    id: 2,
    image: 'https://picsum.photos/seed/blog2/527/674',
    date: 'Feb 3',
    title: 'Sustainable Sourcing Practices',
    excerpt:
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.',
  },
  {
    id: 3,
    image: 'https://picsum.photos/seed/blog3/527/561',
    date: 'Mar 21',
    title: 'Spring Palette Inspirations',
    excerpt:
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.',
  },
]

export function BlogSection() {
  return (
    <section className={styles.section} data-testid="blog-section">
      <div className="container">
        <h2 className={styles.heading}>Read Our Blog Posts</h2>
        <p className={styles.subheading}>
          Lorem ipsum dolor sit amet, consectetur adipiscing ectetur elit, sed do eiusmod.
        </p>

        <div className={styles.grid}>
          {ARTICLES.map((article) => (
            <article key={article.id} className={styles.card} data-testid="blog-card">
              <div className={styles.imageWrapper}>
                <img
                  src={article.image}
                  alt={article.title}
                  className={styles.image}
                  loading="lazy"
                />
                <div className={styles.dateBadge}>{article.date}</div>
              </div>
              <div className={styles.body}>
                <h3 className={styles.title} data-testid="blog-card-title">
                  {article.title}
                </h3>
                <p className={styles.excerpt}>{article.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
