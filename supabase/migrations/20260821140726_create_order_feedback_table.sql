/*
# Create order_feedback table

1. Overview
Stores post-delivery ratings and comments from customers. One feedback row per
order, covering both restaurant/food quality and delivery partner experience.
Single-tenant demo app (no sign-in), so policies allow anon + authenticated CRUD.

2. New Tables
- `order_feedback`
  - `id` uuid PK
  - `order_id` uuid NOT NULL (references orders.id, cascade on delete)
  - `restaurant_rating` int NOT NULL CHECK (1..5)
  - `restaurant_comment` text
  - `delivery_rating` int NOT NULL CHECK (1..5)
  - `delivery_comment` text
  - `created_at` timestamptz DEFAULT now()

3. Security
- RLS enabled.
- Full CRUD for anon + authenticated (intentionally shared demo data).
*/

CREATE TABLE IF NOT EXISTS order_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_rating int NOT NULL CHECK (restaurant_rating >= 1 AND restaurant_rating <= 5),
  restaurant_comment text,
  delivery_rating int NOT NULL CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  delivery_comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE order_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_order_feedback" ON order_feedback;
CREATE POLICY "anon_select_order_feedback" ON order_feedback FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_order_feedback" ON order_feedback;
CREATE POLICY "anon_insert_order_feedback" ON order_feedback FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_order_feedback" ON order_feedback;
CREATE POLICY "anon_update_order_feedback" ON order_feedback FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_order_feedback" ON order_feedback;
CREATE POLICY "anon_delete_order_feedback" ON order_feedback FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_order_feedback_order_id ON order_feedback(order_id);
