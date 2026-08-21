export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  available: boolean;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivered';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  customer_name: string;
  delivery_address: string;
  pickup_location: string;
  items: OrderItem[];
  total: number;
  created_at: string;
  updated_at: string;
}

export type Role = 'customer' | 'restaurant' | 'delivery';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'picked_up',
  'delivered',
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order Placed',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
};

export const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  pending: 'Waiting for the restaurant to accept your order.',
  accepted: 'The restaurant has accepted your order.',
  preparing: 'Your food is being prepared fresh in the kitchen.',
  ready: 'Your order is ready and waiting for a delivery partner.',
  picked_up: 'A delivery partner has picked up your order — on the way!',
  delivered: 'Your order has been delivered. Enjoy your meal!',
};
