/*
# Food Delivery App — Schema & Seed Data

1. Overview
This is a single-tenant demo food-delivery app with NO sign-in screen. Three roles
(Customer, Restaurant, Delivery Partner) share one dashboard and switch via a top
nav bar. All data is intentionally shared/public, so policies use `TO anon, authenticated`
with `USING (true)` / `WITH CHECK (true)`.

2. New Tables
- `menu_items`
  - `id` uuid PK
  - `name` text NOT NULL
  - `description` text NOT NULL
  - `price` numeric(10,2) NOT NULL
  - `category` text NOT NULL
  - `image_url` text NOT NULL
  - `available` boolean DEFAULT true
  - `created_at` timestamptz DEFAULT now()
- `orders`
  - `id` uuid PK
  - `status` text NOT NULL DEFAULT 'pending'
  - `customer_name` text NOT NULL
  - `delivery_address` text NOT NULL
  - `pickup_location` text NOT NULL
  - `items` jsonb NOT NULL (array of {name, quantity, price})
  - `total` numeric(10,2) NOT NULL
  - `created_at` timestamptz DEFAULT now()
  - `updated_at` timestamptz DEFAULT now()

3. Status flow (orders.status)
pending -> accepted -> preparing -> ready -> picked_up -> delivered

4. Security
- RLS enabled on both tables.
- Full CRUD for anon + authenticated (intentionally shared demo data).

5. Seed data
- 12 menu items across categories: Burgers, Pizza, Sushi, Salads, Desserts, Drinks, Pasta, Tacos, Ramen, Healthy, Chicken.
*/

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_menu_items" ON menu_items;
CREATE POLICY "anon_select_menu_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_menu_items" ON menu_items;
CREATE POLICY "anon_insert_menu_items" ON menu_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_menu_items" ON menu_items;
CREATE POLICY "anon_update_menu_items" ON menu_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_menu_items" ON menu_items;
CREATE POLICY "anon_delete_menu_items" ON menu_items FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','preparing','ready','picked_up','delivered')),
  customer_name text NOT NULL,
  delivery_address text NOT NULL,
  pickup_location text NOT NULL,
  items jsonb NOT NULL,
  total numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Seed menu items (idempotent: only insert if table is empty)
INSERT INTO menu_items (name, description, price, category, image_url)
SELECT * FROM (VALUES
  ('Classic Cheeseburger', 'Juicy beef patty, melted cheddar, crisp lettuce, tomato & house sauce on a toasted brioche bun.', 9.50, 'Burgers', 'https://images.pexels.com/photos/8305726/pexels-photo-8305726.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Double Smash Burger', 'Two smashed beef patties, double cheese, pickles & caramelised onions in a takeout box.', 12.00, 'Burgers', 'https://images.pexels.com/photos/2469096/pexels-photo-2469096.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Margherita Pizza', 'Wood-fired Margherita with San Marzano tomatoes, fresh mozzarella & basil.', 11.50, 'Pizza', 'https://images.pexels.com/photos/31596394/pexels-photo-31596394.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Marinara Pizza', 'Classic Marinara with tomato, garlic, oregano & olive oil — no cheese.', 10.00, 'Pizza', 'https://images.pexels.com/photos/19260730/pexels-photo-19260730.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Sushi Deluxe Platter', 'Assorted nigiri & maki rolls on dark wood — salmon, tuna & prawn.', 18.00, 'Sushi', 'https://images.pexels.com/photos/2098143/pexels-photo-2098143.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Nigiri Selection', 'Chef-selected nigiri & maki rolls, fresh seafood daily.', 16.50, 'Sushi', 'https://images.pexels.com/photos/7719911/pexels-photo-7719911.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Chicken Caesar Salad', 'Crisp romaine, croutons, parmesan & grilled chicken with Caesar dressing.', 8.50, 'Salads', 'https://images.pexels.com/photos/6107789/pexels-photo-6107789.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Garden Caesar Bowl', 'Fresh lettuce, croutons & cheese in a white bowl — vegetarian.', 7.50, 'Salads', 'https://images.pexels.com/photos/33674388/pexels-photo-33674388.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Chocolate Strawberry Cake', 'Decadent chocolate cake topped with fresh strawberries & chocolate shards.', 6.50, 'Desserts', 'https://images.pexels.com/photos/12927134/pexels-photo-12927134.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Berry Chocolate Tart', 'Hand-finished chocolate tart crowned with fresh seasonal berries.', 7.00, 'Desserts', 'https://images.pexels.com/photos/18613262/pexels-photo-18613262.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Iced Latte', 'Chilled espresso with frothy milk over ice — smooth & refreshing.', 4.00, 'Drinks', 'https://images.pexels.com/photos/4869289/pexels-photo-4869289.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Strawberry Smoothie', 'Creamy strawberry smoothie with fresh fruit & a striped straw.', 5.00, 'Drinks', 'https://images.pexels.com/photos/11410545/pexels-photo-11410545.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Spaghetti Carbonara', 'Silky carbonara with pancetta, egg, pepper & grated parmesan.', 10.50, 'Pasta', 'https://images.pexels.com/photos/546945/pexels-photo-546945.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Creamy Herb Pasta', 'Pasta tossed in a creamy herb sauce — rich & comforting.', 9.50, 'Pasta', 'https://images.pexels.com/photos/1438672/pexels-photo-1438672.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Chicken Tacos (3)', 'Three chicken tacos with guacamole, herbs & onions.', 9.00, 'Tacos', 'https://images.pexels.com/photos/36498696/pexels-photo-36498696.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Street Tacos', 'Slow-cooked meat tacos with lime, onion & cilantro on a green plate.', 8.50, 'Tacos', 'https://images.pexels.com/photos/25391591/pexels-photo-25391591.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Tonkotsu Ramen', 'Steaming bowl of ramen in rich pork broth with noodles & toppings.', 12.50, 'Ramen', 'https://images.pexels.com/photos/7490494/pexels-photo-7490494.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Spicy Miso Ramen', 'Warm bowl of instant ramen with spicy miso broth on a dark surface.', 11.00, 'Ramen', 'https://images.pexels.com/photos/33312313/pexels-photo-33312313.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Vegan Buddha Bowl', 'Vibrant Buddha bowl with quinoa, fresh fruits & vegetables.', 10.00, 'Healthy', 'https://images.pexels.com/photos/6978186/pexels-photo-6978186.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Garden Buddha Bowl', 'Vegan bowl packed with fresh seasonal vegetables & healthy grains.', 9.50, 'Healthy', 'https://images.pexels.com/photos/19150338/pexels-photo-19150338.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Crispy Chicken Wings', 'Golden fried chicken wings with crispy fries & herbs on a wooden platter.', 8.50, 'Chicken', 'https://images.pexels.com/photos/14661492/pexels-photo-14661492.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Classic Fried Wings', 'Rustic fried chicken wings served on a wooden board.', 8.00, 'Chicken', 'https://images.pexels.com/photos/5652266/pexels-photo-5652266.jpeg?auto=compress&cs=tinysrgb&h=650&w=940')
) AS t(name, description, price, category, image_url)
WHERE NOT EXISTS (SELECT 1 FROM menu_items);

-- Add a sample order so the Restaurant & Delivery dashboards aren't empty on first load
INSERT INTO orders (status, customer_name, delivery_address, pickup_location, items, total)
SELECT 'pending', 'Jamie Lee', '14 Maple Avenue, Apt 3B, Northside', 'Bolt Kitchen — 88 Market Street, Downtown',
  '[{"name":"Classic Cheeseburger","quantity":2,"price":9.50},{"name":"Iced Latte","quantity":1,"price":4.00}]'::jsonb,
  23.00
WHERE NOT EXISTS (SELECT 1 FROM orders);
