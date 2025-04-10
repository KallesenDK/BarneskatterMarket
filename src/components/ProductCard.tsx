import Image from 'next/image'
import Link from 'next/link'

interface ProductCardProps {
  id: string
  title: string
  description: string
  price: number
  discountPrice?: number
  discountActive?: boolean
  images: string[]
}

export default function ProductCard({
  id,
  title,
  description,
  price,
  discountPrice,
  discountActive = false,
  images,
}: ProductCardProps) {
  const truncatedDescription = description.length > 100
    ? `${description.substring(0, 100)}...`
    : description

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-200">
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <span className="text-gray-400">Intet billede</span>
          </div>
        )}
        {discountActive && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
            Tilbud
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 truncate">{title}</h3>
        <p className="text-gray-600 text-sm mb-3">{truncatedDescription}</p>
        
        <div className="flex justify-between items-center">
          <div>
            {discountActive && discountPrice ? (
              <div className="flex items-center">
                <span className="text-lg font-bold text-red-500 mr-2">{discountPrice} kr</span>
                <span className="text-gray-500 line-through text-sm">{price} kr</span>
              </div>
            ) : (
              <span className="text-lg font-bold">{price} kr</span>
            )}
          </div>
          
          <Link 
            href={`/product/${id}`}
            className="bg-primary hover:bg-primary/90 text-white px-3 py-1 rounded text-sm"
          >
            Se mere
          </Link>
        </div>
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <button className="w-full text-gray-600 hover:text-primary text-sm text-center">
          Kontakt sælger
        </button>
      </div>
    </div>
  )
} 