
import { Product, FAQItem } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Cyberpunk 2077: Phantom Liberty',
    category: 'Games',
    price: 29.99,
    originalPrice: 49.99,
    image: 'https://images.unsplash.com/photo-1605898835373-02f740d080c9?auto=format&fit=crop&q=80&w=600',
    description: 'An expansion for the action-adventure RPG Cyberpunk 2077.',
    features: ['Instant Delivery', 'Global Region', 'Official Steam Key'],
    stock: 50,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Valorant Stacked Account (Diamond)',
    category: 'Accounts',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
    description: 'High-tier Valorant account with multiple premium skins.',
    features: ['Full Email Access', 'Diamond Rank', '25+ Premium Skins'],
    stock: 1,
    rating: 4.9
  },
  {
    id: '3',
    name: 'PSN Gift Card $50 USD',
    category: 'Gift Cards',
    price: 45.00,
    originalPrice: 50.00,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=600',
    description: 'Wallet top-up for US PlayStation Network accounts.',
    features: ['Region: USA', 'Instant Email Delivery', 'Secure Code'],
    stock: 100,
    rating: 4.7
  },
  {
    id: '4',
    name: 'Genshin Impact 6480 Primogems',
    category: 'Currency',
    price: 79.99,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=600',
    description: 'Massive Primogem pack for pulls and resin.',
    features: ['In-game ID Top-up', 'Worldwide', 'Fast Processing'],
    stock: 500,
    rating: 4.9
  },
  {
    id: '5',
    name: 'Elden Ring: Shadow of the Erdtree',
    category: 'Games',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1627850604058-52e40de1b847?auto=format&fit=crop&q=80&w=600',
    description: 'The massive expansion for Elden Ring.',
    features: ['Steam Key', 'Pre-order Edition', 'Global'],
    stock: 30,
    rating: 5.0
  },
  {
    id: '6',
    name: 'Windows 11 Pro - Retail Key',
    category: 'Software',
    price: 19.99,
    originalPrice: 199.99,
    image: 'https://images.unsplash.com/photo-1624555130581-1d9cca783bc0?auto=format&fit=crop&q=80&w=600',
    description: 'Lifetime activation for Windows 11 Professional.',
    features: ['Retail License', 'Update Support', 'Multi-language'],
    stock: 200,
    rating: 4.6
  },
  {
    id: '7',
    name: 'Netflix Premium - 1 Month',
    category: 'Subscriptions',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=600',
    description: '4K Ultra HD Netflix access for 30 days.',
    features: ['Private Profile', 'Renewable', 'Warranty'],
    stock: 15,
    rating: 4.4
  },
  {
    id: '8',
    name: 'Steam $100 Wallet Code',
    category: 'Gift Cards',
    price: 92.00,
    originalPrice: 100.00,
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=600',
    description: 'Add $100 to your Steam Wallet instantly.',
    features: ['Instant Code', 'Region: Global', 'Secure'],
    stock: 50,
    rating: 4.8
  },
  {
    id: '9',
    name: 'Office 2021 Professional Plus',
    category: 'Software',
    price: 24.99,
    originalPrice: 439.99,
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=600',
    description: 'Full Office suite including Word, Excel, and PPT.',
    features: ['Lifetime Access', 'Official Download', 'One-time Bind'],
    stock: 80,
    rating: 4.7
  },
  {
    id: '10',
    name: 'Discord Nitro - 1 Year (Gift)',
    category: 'Subscriptions',
    price: 45.00,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?auto=format&fit=crop&q=80&w=600',
    description: 'Enjoy premium Discord features for a full year.',
    features: ['Nitro Boost', 'Gift Link', 'No Login Required'],
    stock: 25,
    rating: 4.9
  },
  {
    id: '11',
    name: 'CS2 Skin: Butterfly Knife Doppler',
    category: 'Items',
    price: 1250.00,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600',
    description: 'Extremely rare CS2 skin. Phase 4 pattern.',
    features: ['Factory New', 'Instant Trade', 'High Demand'],
    stock: 1,
    rating: 5.0
  },
  {
    id: '12',
    name: 'Fortnite 13500 V-Bucks',
    category: 'Currency',
    price: 65.00,
    originalPrice: 89.99,
    image: 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?auto=format&fit=crop&q=80&w=600',
    description: 'Massive V-Bucks pack for skins and emotes.',
    features: ['Epic Games Bind', 'Console Compatible', 'Fast Delivery'],
    stock: 100,
    rating: 4.8
  }
];

export const FAQS: FAQItem[] = [
  {
    question: "How long does delivery take?",
    answer: "Most digital products are delivered instantly via email and your user dashboard after payment confirmation."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Credit/Debit Cards, PayPal, and various Cryptocurrencies (BTC, ETH, LTC, USDT)."
  },
  {
    question: "Can I refund my purchase?",
    answer: "Due to the nature of digital goods, refunds are only issued if the key/account provided is invalid and reported within 24 hours."
  }
];
