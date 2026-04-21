export interface Product {
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
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Linen Blend Jacket',
    description: 'Lightweight summer jacket in natural linen blend fabric.',
    price: 129,
    originalPrice: 189,
    imageUrl: 'https://picsum.photos/seed/prod1/410/554',
    badge: 'Sale',
    rating: 4,
    reviewCount: 42,
    category: 'Lifestyle',
  },
  {
    id: '2',
    name: 'Classic White Shirt',
    description: 'Timeless white button-up shirt for any occasion.',
    price: 79,
    imageUrl: 'https://picsum.photos/seed/prod2/410/554',
    badge: null,
    rating: 5,
    reviewCount: 88,
    category: 'Brand',
  },
  {
    id: '3',
    name: 'Wool Overcoat',
    description: 'Premium wool overcoat with clean minimalist silhouette.',
    price: 249,
    originalPrice: 349,
    imageUrl: 'https://picsum.photos/seed/prod3/410/554',
    badge: 'Sale',
    rating: 4,
    reviewCount: 31,
    category: 'Outwear',
  },
  {
    id: '4',
    name: 'Structured Blazer',
    description: 'Tailored blazer with structured shoulders and clean lines.',
    price: 159,
    imageUrl: 'https://picsum.photos/seed/prod4/410/554',
    badge: null,
    rating: 3,
    reviewCount: 19,
    category: 'Brand',
  },
  {
    id: '5',
    name: 'Casual Tote Bag',
    description: 'Everyday canvas tote in natural earth tones.',
    price: 59,
    imageUrl: 'https://picsum.photos/seed/prod5/410/554',
    badge: 'New',
    rating: 5,
    reviewCount: 64,
    category: 'Lifestyle',
  },
  {
    id: '6',
    name: 'Merino Sweater',
    description: 'Soft merino wool sweater, perfect for layering.',
    price: 109,
    imageUrl: 'https://picsum.photos/seed/prod6/410/554',
    badge: null,
    rating: 4,
    reviewCount: 27,
    category: 'Outwear',
  },
  {
    id: '7',
    name: 'Silk Scarf',
    description: 'Hand-rolled silk scarf with artisan print.',
    price: 89,
    originalPrice: 120,
    imageUrl: 'https://picsum.photos/seed/prod7/410/554',
    badge: 'Sale',
    rating: 5,
    reviewCount: 53,
    category: 'Lifestyle',
  },
  {
    id: '8',
    name: 'Leather Belt',
    description: 'Full-grain leather belt with brushed brass buckle.',
    price: 69,
    imageUrl: 'https://picsum.photos/seed/prod8/410/554',
    badge: 'New',
    rating: 4,
    reviewCount: 36,
    category: 'Brand',
  },
]
