-- Opret orders-tabel til reservationer
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id),
    first_name text NOT NULL,
    last_name text NOT NULL,
    mobile text NOT NULL,
    street text NOT NULL,
    street_number text NOT NULL,
    postal_code text NOT NULL,
    city text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    price numeric(10,2) NOT NULL, -- Pris fra produktet på reservationstidspunktet
    pickup_code text,
    status text DEFAULT 'reserved',
    created_at timestamp with time zone DEFAULT timezone('utc', now())
);
