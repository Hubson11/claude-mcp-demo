import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { HeroSlider } from './components/HeroSlider'
import { ProductSection } from './components/ProductSection'
import { ArtistsSection } from './components/ArtistsSection'
import { BlogSection } from './components/BlogSection'
import { Newsletter } from './components/Newsletter'
import { InstagramFeed } from './components/InstagramFeed'
import { Footer } from './components/Footer'

function App() {
  const [cartCount, setCartCount] = useState(0)

  const handleAddToCart = (_id: string) => {
    setCartCount((c) => c + 1)
  }

  return (
    <>
      <Navbar cartCount={cartCount} />
      <main style={{ paddingTop: 'var(--nav-height)' }}>
        <HeroSlider />
        <ProductSection onAddToCart={handleAddToCart} />
        <ArtistsSection />
        <BlogSection />
        <Newsletter />
        <InstagramFeed />
      </main>
      <Footer />
    </>
  )
}

export default App
