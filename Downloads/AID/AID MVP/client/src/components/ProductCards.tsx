import { useState } from 'react'

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  rating: number
  reviews: number
}

interface ProductCardsProps {
  compact?: boolean
}

const products: Product[] = [
  {
    id: 1,
    name: 'LED Headlight Bulbs',
    price: 49.99,
    image: '💡',
    category: 'Lighting',
    rating: 4.8,
    reviews: 324
  },
  {
    id: 2,
    name: 'LED Strip Lights',
    price: 29.99,
    image: '✨',
    category: 'Lighting',
    rating: 4.6,
    reviews: 189
  },
  {
    id: 3,
    name: 'LED Fog Lights',
    price: 79.99,
    image: '🔦',
    category: 'Lighting',
    rating: 4.7,
    reviews: 256
  },
  {
    id: 4,
    name: 'Car Phone Mount',
    price: 19.99,
    image: '📱',
    category: 'Accessories',
    rating: 4.9,
    reviews: 512
  },
  {
    id: 5,
    name: 'Dash Cam',
    price: 89.99,
    image: '📹',
    category: 'Accessories',
    rating: 4.5,
    reviews: 423
  },
  {
    id: 6,
    name: 'LED Tail Lights',
    price: 129.99,
    image: '🚨',
    category: 'Lighting',
    rating: 4.8,
    reviews: 198
  },
  {
    id: 7,
    name: 'Car Charger',
    price: 15.99,
    image: '🔌',
    category: 'Accessories',
    rating: 4.7,
    reviews: 678
  },
  {
    id: 8,
    name: 'LED Interior Kit',
    price: 39.99,
    image: '💫',
    category: 'Lighting',
    rating: 4.6,
    reviews: 234
  }
]

export default function ProductCards({ compact = false }: ProductCardsProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product)
    // In a real app, this would navigate to a product page or checkout
    alert(`Added ${product.name} to cart! Price: $${product.price.toFixed(2)}`)
  }

  return (
    <div className={compact ? "mt-2 -mx-3" : "mt-4 sm:mt-6 lg:mt-8"}>
      <div className={`bg-gradient-to-br from-black/90 to-purple-900/30 border border-purple-500/20 shadow-xl ${
        compact 
          ? "rounded-lg px-2 py-2" 
          : "rounded-lg sm:rounded-xl lg:rounded-2xl px-1.5 py-1.5 sm:px-4 sm:py-4 lg:p-6"
      }`}>
        <h2 className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-glow ${
          compact 
            ? "text-sm mb-2" 
            : "text-sm sm:text-xl lg:text-2xl mb-1.5 sm:mb-4 lg:mb-6"
        }`}>
          Shop LED Lights & Accessories
        </h2>
        
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 ${
          compact ? "gap-2" : "gap-1.5 sm:gap-3 lg:gap-4"
        }`}>
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-black/60 backdrop-blur-sm border border-purple-500/20 active:border-purple-400/40 active:shadow-xl transition-all flex flex-col ${
                compact 
                  ? "rounded-lg p-2" 
                  : "rounded-md sm:rounded-xl lg:rounded-2xl p-1.5 sm:p-4 lg:p-5"
              }`}
            >
              <div className="flex-1 flex flex-col">
                {/* Product Logo/Icon */}
                <div className={`bg-purple-900/30 border border-purple-500/20 rounded-lg flex items-center justify-center mb-2 ${
                  compact 
                    ? "h-12 text-2xl" 
                    : "h-16 sm:h-24 lg:h-32 text-3xl sm:text-4xl lg:text-5xl"
                }`}>
                  {product.image}
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col">
                  <h3 className={`font-bold text-purple-300 leading-tight mb-1 ${
                    compact 
                      ? "text-[10px]" 
                      : "text-[10px] sm:text-sm lg:text-base mb-0.5 sm:mb-2"
                  }`}>
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className={`flex items-center mb-1 sm:mb-2 ${
                    compact ? "gap-0.5" : "gap-1"
                  }`}>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`${
                            compact ? "text-[8px]" : "text-[8px] sm:text-xs"
                          } ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400'
                              : i < product.rating
                              ? 'text-yellow-300'
                              : 'text-gray-600'
                          }`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className={`text-purple-200 font-semibold ${
                      compact ? "text-[8px]" : "text-[8px] sm:text-xs"
                    }`}>
                      {product.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Category */}
                  <p className={`text-purple-500 leading-tight mb-1 sm:mb-2 ${
                    compact ? "text-[8px]" : "text-[8px] sm:text-xs"
                  }`}>
                    {product.category}
                  </p>

                  {/* Price */}
                  <div className={`mt-auto ${
                    compact ? "mb-1.5" : "mb-2 sm:mb-3"
                  }`}>
                    <p className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 ${
                      compact ? "text-xs" : "text-sm sm:text-lg"
                    }`}>
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => handleBuyClick(product)}
                    className={`w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-lg active:from-purple-500 active:via-pink-500 active:to-purple-500 transition-all font-semibold active:scale-[0.95] transform touch-manipulation ${
                      compact 
                        ? "py-1.5 text-[9px]" 
                        : "py-2 sm:py-2.5 text-[10px] sm:text-xs lg:text-sm"
                    }`}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

