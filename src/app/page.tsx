"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, SearchIcon, ShoppingCartIcon, TagIcon, TruckIcon, UserIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/Cart/CartProvider"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mockup Component
const mockupVariants = cva(
  "flex relative z-10 overflow-hidden shadow-2xl border border-border/5 border-t-border/15",
  {
    variants: {
      type: {
        mobile: "rounded-[48px] max-w-[350px]",
        responsive: "rounded-md",
      },
    },
    defaultVariants: {
      type: "responsive",
    },
  },
)

export interface MockupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mockupVariants> {}

const Mockup = React.forwardRef<HTMLDivElement, MockupProps>(
  ({ className, type, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(mockupVariants({ type, className }))}
      {...props}
    />
  ),
)
Mockup.displayName = "Mockup"

// Glow Component
const glowVariants = cva("absolute w-full", {
  variants: {
    variant: {
      top: "top-0",
      above: "-top-[128px]",
      bottom: "bottom-0",
      below: "-bottom-[128px]",
      center: "top-[50%]",
    },
  },
  defaultVariants: {
    variant: "top",
  },
})

interface GlowProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof glowVariants> {}

const Glow = React.forwardRef<HTMLDivElement, GlowProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(glowVariants({ variant }), className)}
      {...props}
    >
      <div
        className={cn(
          "absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_hsla(var(--brand-foreground)/.5)_10%,_hsla(var(--brand-foreground)/0)_60%)] sm:h-[512px]",
          variant === "center" && "-translate-y-1/2",
        )}
      />
      <div
        className={cn(
          "absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_hsla(var(--brand)/.3)_10%,_hsla(var(--brand-foreground)/0)_60%)] sm:h-[256px]",
          variant === "center" && "-translate-y-1/2",
        )}
      />
    </div>
  ),
)
Glow.displayName = "Glow"

// Product Card Component
interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image: string
    category: string
  }
}

function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart();
  const isInCart = items.some(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.image
    });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <Badge variant="outline" className="mb-2">
          {product.category}
        </Badge>
        <h3 className="text-lg font-medium">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-semibold">{product.price} kr.</p>
          {isInCart ? (
            <Button size="sm" variant="ghost" disabled className="text-gray-400 cursor-not-allowed">
              <ShoppingCartIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={handleAddToCart}>
              <ShoppingCartIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border bg-background p-6 text-center shadow-sm">
      <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

// Hero Section Component
interface HeroSectionProps {
  title: string
  description: string
  image: {
    src: string
    alt: string
  }
  actions: {
    primary: {
      text: string
      href: string
    }
    secondary: {
      text: string
      href: string
    }
  }
}

function HeroSection({ title, description, image, actions }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="flex flex-col items-start">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              {description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href={actions.primary.href}>{actions.primary.text}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={actions.secondary.href}>{actions.secondary.text}</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <Mockup className="animate-appear opacity-0 [animation-delay:700ms]">
              <Image
                src={image.src}
                alt={image.alt}
                width={600}
                height={400}
                className="w-full"
              />
            </Mockup>
            <Glow
              variant="center"
              className="animate-appear-zoom opacity-0 [animation-delay:1000ms]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// Category Section Component
interface CategorySectionProps {
  title: string
  categories: {
    id: string
    name: string
    image: string
    href: string
  }[]
}

function CategorySection({ title, categories }: CategorySectionProps) {
  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold">{title}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group flex flex-col items-center"
            >
              <div className="mb-3 overflow-hidden rounded-full">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={120}
                  height={120}
                  className="aspect-square object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <span className="text-center font-medium">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// Featured Products Section Component
interface FeaturedProductsProps {
  title: string
  products: {
    id: string
    name: string
    price: number
    image: string
    category: string
  }[]
}

function FeaturedProducts({ title, products }: FeaturedProductsProps) {
  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">{title}</h2>
          <Button variant="outline" asChild>
            <Link href="/product">
              Se alle produkter <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Features Section Component
interface FeaturesSectionProps {
  title: string
  features: {
    icon: React.ReactNode
    title: string
    description: string
  }[]
}

function FeaturesSection({ title, features }: FeaturesSectionProps) {
  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold">{title}</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Main Page Component
export default function HomePage() {
  // Sample data
  const heroData = {
    title: "Din online markedsplads for alt",
    description: "Find alt hvad du har brug for på vores online markedsplads med tusindvis af produkter og sælgere. Nemt, sikkert og hurtigt.",
    image: {
      src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop",
      alt: "Markedsplads illustration",
    },
    actions: {
      primary: {
        text: "Start shopping",
        href: "/product",
      },
      secondary: {
        text: "Bliv sælger",
        href: "/auth/signup",
      },
    },
  }

  const categories = [
    {
      id: "1",
      name: "Elektronik",
      image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1974&auto=format&fit=crop",
      href: "/product?category=Elektronik",
    },
    {
      id: "2",
      name: "Tøj",
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1170&auto=format&fit=crop",
      href: "/product?category=Tøj",
    },
    {
      id: "3",
      name: "Hjem",
      image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1780&auto=format&fit=crop",
      href: "/product?category=Hjem",
    },
    {
      id: "4",
      name: "Sport",
      image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=1170&auto=format&fit=crop",
      href: "/product?category=Sport & Fritid",
    },
    {
      id: "5",
      name: "Skønhed",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1187&auto=format&fit=crop",
      href: "/product?category=Skønhed",
    },
    {
      id: "6",
      name: "Legetøj",
      image: "https://images.unsplash.com/photo-1555448248-2571daf6344b?q=80&w=1170&auto=format&fit=crop",
      href: "/product?category=Legetøj",
    },
  ]

  const featuredProducts = [
    {
      id: "1",
      name: "Trådløse hovedtelefoner",
      price: 899,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1170&auto=format&fit=crop",
      category: "Elektronik",
    },
    {
      id: "2",
      name: "Bomuldst-shirt",
      price: 249,
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1964&auto=format&fit=crop",
      category: "Tøj",
    },
    {
      id: "3",
      name: "Keramisk vase",
      price: 349,
      image: "https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?q=80&w=1287&auto=format&fit=crop",
      category: "Hjem",
    },
    {
      id: "4",
      name: "Yogamåtte",
      price: 299,
      image: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=1170&auto=format&fit=crop",
      category: "Sport",
    },
  ]

  const features = [
    {
      icon: <TruckIcon className="h-6 w-6" />,
      title: "Hurtig levering",
      description: "Få dine varer leveret direkte til døren inden for 1-3 hverdage.",
    },
    {
      icon: <TagIcon className="h-6 w-6" />,
      title: "Konkurrencedygtige priser",
      description: "Vi matcher priserne fra andre forhandlere og tilbyder regelmæssige rabatter.",
    },
    {
      icon: <UserIcon className="h-6 w-6" />,
      title: "Kundeservice i topklasse",
      description: "Vores dedikerede supportteam er klar til at hjælpe dig 24/7.",
    },
  ]

  return (
    <main className="flex-1">
      <HeroSection
        title={heroData.title}
        description={heroData.description}
        image={heroData.image}
        actions={heroData.actions}
      />

      <CategorySection title="Udforsk kategorier" categories={categories} />

      <FeaturedProducts title="Populære produkter" products={featuredProducts} />

      <FeaturesSection title="Hvorfor vælge os" features={features} />
    </main>
  )
} 