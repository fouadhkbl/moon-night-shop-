
import { Product, FAQItem } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Cyberpunk 2077: Phantom Liberty',
    category: 'Games',
    price: 320.00,
    originalPrice: 550.00,
    image: 'https://images.unsplash.com/photo-1605898835373-02f740d080c9?auto=format&fit=crop&q=80&w=600',
    description: 'Explore a dangerous new district in this high-stakes spy thriller expansion. Includes exclusive pre-order rewards.',
    features: ['Instant Key Delivery', 'Global Steam Activation', 'Bonus Digital Items'],
    stock: 50,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Valorant Account: Diamond III',
    category: 'Accounts',
    price: 950.00,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
    description: 'A premium competitive account featuring a Diamond III rank and a curated selection of rare weapon skins.',
    features: ['Full Email Access', 'Exclusive Agent Skins', 'Ranked Ready'],
    stock: 1,
    rating: 4.9
  },
  {
    id: '3',
    name: 'PlayStation Store $50 Gift Card',
    category: 'Gift Cards',
    price: 490.00,
    originalPrice: 520.00,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=600',
    description: 'Add $50 USD to your PlayStation Wallet instantly. Valid for games, add-ons, and subscriptions.',
    features: ['USA Region Support', 'Immediate Code Access', '24/7 Activation Support'],
    stock: 100,
    rating: 4.7
  },
  {
    id: '4',
    name: 'Genshin Impact: 6480 Genesis Crystals',
    category: 'Currency',
    price: 850.00,
    originalPrice: 1050.00,
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=600',
    description: 'Boost your adventure with a direct Genesis Crystal top-up. 100% safe UID-based delivery protocol.',
    features: ['Fast UID Top-Up', 'Verified Safe Method', 'Bonus In-game Items'],
    stock: 500,
    rating: 4.9
  },
  {
    id: '5',
    name: 'Elden Ring: Shadow of the Erdtree',
    category: 'Games',
    price: 380.00,
    image: 'https://images.unsplash.com/photo-1627850604058-52e40de1b847?auto=format&fit=crop&q=80&w=600',
    description: 'Master the Land of Shadow in the definitive expansion to Elden Ring. Massive new areas and boss challenges.',
    features: ['Steam Global Key', 'Pre-order Exclusive Content', 'Digital Soundtrack Access'],
    stock: 30,
    rating: 5.0
  },
  {
    id: '6',
    name: 'Microsoft Windows 11 Pro',
    category: 'Software',
    price: 220.00,
    originalPrice: 2100.00,
    image: 'https://images.unsplash.com/photo-1624555130581-1d9cca783bc0?auto=format&fit=crop&q=80&w=600',
    description: 'Professional retail license for high-performance security and productivity features. Lifetime activation.',
    features: ['Full Retail License', 'Global Language Support', 'Lifetime Updates'],
    stock: 200,
    rating: 4.6
  },
  {
    id: '7',
    name: 'Netflix Premium: 30-Day Pass',
    category: 'Subscriptions',
    price: 50.00,
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=600',
    description: 'Private Netflix Premium access for 30 days. Enjoy 4K Ultra HD streaming on up to 4 devices.',
    features: ['4K UHD Streaming', 'Private Profile', 'Full Warranty Coverage'],
    stock: 15,
    rating: 4.4
  },
  {
    id: '8',
    name: 'Steam Wallet $100 Code',
    category: 'Gift Cards',
    price: 980.00,
    originalPrice: 1080.00,
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600',
    description: 'Recharge your Steam balance with $100 USD. Access thousands of titles and community market items.',
    features: ['Instant Code Delivery', 'No Expiration Date', 'Universal Account Balance'],
    stock: 50,
    rating: 4.8
  }
];

export const FAQS: FAQItem[] = [
  {
    question: "How long does delivery take?",
    answer: "Our digital assets are delivered instantly to your email and account dashboard upon payment confirmation."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept PayPal, Credit/Debit cards, and our native MoonNight balance system for seamless transactions."
  },
  {
    question: "What is your refund policy?",
    answer: "Refunds are available for defective digital keys within 24 hours of purchase, provided the product has not been activated."
  }
];
