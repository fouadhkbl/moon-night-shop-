
export type Category = 
  | 'Games' 
  | 'Accounts' 
  | 'Gift Cards' 
  | 'Items' 
  | 'Subscriptions' 
  | 'Currency' 
  | 'Software' 
  | 'Keys';

export type Language = 'EN' | 'FR';

export type OrderStatus = 'Pending' | 'Payment Verifying' | 'Processing' | 'Completed' | 'Cancelled';
export type TicketStatus = 'New' | 'Read' | 'Replied';

export interface User {
  id: string;
  name: string;
  email: string;
  state: string;
  joinedAt: string;
  balance: number; // User's Solde in DH
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number; // percentage
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  features: string[];
  stock: number;
  rating: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  productBought: string;
  totalAmount: number;
  date: string;
  status: OrderStatus;
  appliedPromo?: string;
  paymentMethod?: string;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  status: TicketStatus;
}

export interface ChatMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface Testimonial {
  id: string;
  user: string;
  avatar: string;
  comment: string;
  rating: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}
