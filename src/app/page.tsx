"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, SearchIcon, ShoppingCartIcon, TagIcon, TruckIcon, UserIcon } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
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
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-100 via-pink-50 to-yellow-100 py-16 md:py-24">
      {/* SVG bølge i toppen */}
      <svg className="absolute top-0 left-0 w-full h-24 md:h-32 text-blue-200 opacity-60 z-0" viewBox="0 0 1440 320"><path fill="currentColor" fillOpacity="1" d="M0,64L48,80C96,96,192,128,288,154.7C384,181,480,203,576,213.3C672,224,768,224,864,197.3C960,171,1056,117,1152,90.7C1248,64,1344,64,1392,64L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path></svg>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="flex flex-col items-start">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl animate-fade-in-down">
              {title}
            </h1>
            <p className="mb-8 text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              {description}
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              <Button asChild size="lg" className="transition-transform hover:scale-105">
                <Link href={actions.primary.href}>{actions.primary.text}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="transition-transform hover:scale-105">
                <Link href={actions.secondary.href}>{actions.secondary.text}</Link>
              </Button>
            </div>
          </div>
          <div className="relative flex justify-center items-center animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
            <Mockup className="shadow-2xl">
              <Image
                src={image.src}
                alt={image.alt}
                width={600}
                height={400}
                className="w-full rounded-2xl shadow-lg hover:scale-105 transition-transform duration-500"
              />
            </Mockup>
            <Glow
              variant="center"
              className="animate-appear-zoom opacity-0 [animation-delay:1000ms]"
            />
          </div>
        </div>
      </div>
      {/* SVG bølge i bunden */}
      <svg className="absolute bottom-0 left-0 w-full h-24 md:h-32 text-yellow-100 opacity-80 z-0" viewBox="0 0 1440 320"><path fill="currentColor" fillOpacity="1" d="M0,256L48,229.3C96,203,192,149,288,149.3C384,149,480,203,576,197.3C672,192,768,128,864,106.7C960,85,1056,107,1152,128C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
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
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight md:text-4xl animate-fade-in-down">
          {title}
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, idx) => (
            <Link key={category.id} href={category.href}>
              <Card
                className={`flex flex-col justify-between items-center min-h-64 h-64 p-4 card-hover-animate animate-fade-in-up`}
                style={{ animationDelay: `${100 + idx * 80}ms`, animationFillMode: 'both' }}
              >
                <div className="w-full flex-1 flex items-center justify-center">
                  <div className="w-full h-32 flex items-center justify-center">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={120}
                      height={120}
                      className="object-cover rounded-lg w-full h-full"
                    />
                  </div>
                </div>
                <span className="mt-4 text-lg font-medium text-center w-full">
                  {category.name}
                </span>
              </Card>
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
    <section className="py-12 md:py-20 bg-muted/40">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight md:text-4xl animate-fade-in-down">
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {products.map((product, idx) => (
            <div key={product.id} className="animate-fade-in-up card-hover-animate" style={{ animationDelay: `${100 + idx * 80}ms`, animationFillMode: 'both' }}>
              <ProductCard product={product} />
            </div>
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
// Tilføj animation CSS (kan evt. flyttes til global.css eller tilsvarende)
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fade-in {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes fade-in-down {
      0% { opacity: 0; transform: translateY(-30px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-in-up {
      0% { opacity: 0; transform: translateY(30px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 1s cubic-bezier(0.4,0,0.2,1) both; }
    .animate-fade-in-down { animation: fade-in-down 1.1s cubic-bezier(0.4,0,0.2,1) both; }
    .animate-fade-in-up { animation: fade-in-up 1.1s cubic-bezier(0.4,0,0.2,1) both; }
    .card-hover-animate { transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s; }
    .card-hover-animate:hover { transform: translateY(-8px) scale(1.03); box-shadow: 0 8px 32px 0 rgba(0,0,0,0.12); }
  `;
  document.head.appendChild(style);
}

// Ikon-mapping
type FeatureIcon = "truck" | "tag" | "user";
const iconMap: Record<FeatureIcon, JSX.Element> = {
  truck: <TruckIcon className="h-6 w-6" />,
  tag: <TagIcon className="h-6 w-6" />,
  user: <UserIcon className="h-6 w-6" />,
};

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

  // Features fra Supabase
  const [features, setFeatures] = useState<any[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      setLoadingFeatures(true);
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("site_features")
        .select("*")
        .order("position", { ascending: true });
      if (!error && data) setFeatures(data);
      setLoadingFeatures(false);
    };
    fetchFeatures();
  }, []);

  // Fallback hvis ingen features i db
  const fallbackFeatures = [
    {
      icon: "truck",
      title: "Hurtig levering",
      description: "Få dine varer leveret direkte til døren inden for 1-3 hverdage.",
    },
    {
      icon: "tag",
      title: "Konkurrencedygtige priser",
      description: "Vi matcher priserne fra andre forhandlere og tilbyder regelmæssige rabatter.",
    },
    {
      icon: "user",
      title: "Kundeservice i topklasse",
      description: "Vores dedikerede supportteam er klar til at hjælpe dig 24/7.",
    },
  ];

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

      <FeaturesSection
        title="Hvorfor vælge os"
        features={
          (features.length ? features : fallbackFeatures).map((f: any) => ({
            icon: iconMap[(f.icon as FeatureIcon) ?? "truck"] || <TruckIcon className="h-6 w-6" />,
            title: f.title,
            description: f.description,
          }))
        }
      />
    </main>
  )
} 