# Marketplace Platform - Specifikation

## Teknologistack
- **Frontend**: Next.js (21st.dev template) + Tailwind CSS
- **Backend**: API Routes (Next.js) eller separat backend
- **Betalingsprocessor**: Stripe
- **Database**: PostgreSQL (eller Firebase hvis hurtig prototype)
- **Auth**: NextAuth.js eller Clerk

## Brugerflow

### 1. Brugerregistrering
```mermaid
graph TD
    A[Opret bruger] --> B[Indtast alle oplysninger]
    B --> C{Verificer email}
    C -->|Ja| D[Aktiv konto]
    C -->|Nej| E[Purge efter 24h]

# User Flows

## Seller Journey
graph TD
    A[Sign Up] --> B[Purchase Slots]
    B --> C[Create Listing]
    C --> D[Manage Discounts]


## Buyers Journey
graph TD
    A[Browse] --> B{Interested?}
    B -->|Yes| C[Ask Questions]
    B -->|No| D[Continue Browsing]
    C --> E[Purchase]
    D --> F[Continue Browsing]
    E --> G[Confirmation]
    F --> G
    G --> H[Thank You]
    H --> I[Feedback]

##Produktopslag
- Obligatoriske felter:
- [ ] Titel (max 60 tegn)
- [ ] Beskrivelse (min. 50 ord)
- [ ] 1-5 billeder (WebP format)
- [ ] Basispris (DKK)
- [ ] Kategori (dropdown)
- [ ] Søgeord (tags, max 5)

## Prislogik
// Eksempel på tilbudslogik
function enableDiscount(product) {
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - product.createdAt > oneWeek;
}

##Database

model User {
  id          String   @id @default(uuid())
  firstName   String
  lastName    String
  address     String
  postalCode  String
  phone       String
  email       String   @unique
  password    String
  bannedUntil DateTime?
  credits     Int      @default(0)
  products    Product[]
}

model Product {
  id          String   @id @default(uuid())
  title       String
  description String
  price       Float
  discountPrice Float?
  discountActive Boolean @default(false)
  tags        String[]
  images      String[]
  createdAt   DateTime @default(now())
  expiresAt   DateTime
  owner       User     @relation(fields: [userId], references: [id])
  userId      String
}

**ADMIN PANEL** 

Brugeradministration:

CRUD operasjoner med audit log

Ban hammer ⚒️ (1d/1w/perm)

Transaktionsoversigt:

| Sælger | Køber | Beløb | Dato       | Status  |
|--------|-------|-------|------------|---------|
| User1  | User2 | 599   | 2023-05-01 | Udbetalt|

I alle pakker skal der være provisionssats til butikken, dette skal fratrækkes beløberne ved overførsel. 

UI komponenter: 

// Produktkort eksempel
<ProductCard>
  <Badge discount={product.discountActive} />
  <ImageGallery images={product.images} />
  <PriceTag 
    price={product.price} 
    discount={product.discountPrice} 
  />
  <InterestModal triggers={[
    "Hvornår kan jeg hente?",
    "Levering muligt?",
    "Andre spørgsmål"
  ]} />
</ProductCard>

STRIPE til integration


Søgefunktionalitet
Fuldtekstsøgning på:

Produkttitel

Beskrivelse

Tags

Kategorinavn

Sikkerhedsforanstaltninger
PII masking for ikke-logged-in brugere

Automatisk screening for kontaktinfo i beskrivelser

Rate limiting på API endpoints




Bemærk: Denne markdown indeholder både tekniske specifikationer og UX-overvejelser. For at implementere dette ville jeg anbefale:

1. Start med Next.js + Tailwind setup
2. Byg brugerregistreringsflow først
3. Implementer Stripe integration tidligt
4. Lav en "dumb" version af produktopslagstavlen
5. Tilføj avancerede features gradvist

