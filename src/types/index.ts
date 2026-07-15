export interface Destination {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  description: string;
}

export interface TourPackage {
  id: string;
  title: string;
  image: string;
  description: string;
  duration: string;
  maxPax: number;
  location: string;
  price: number;
  reviews: number;
  rating: number;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  role: string;
  content: string;
  rating: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface NavLink {
  label: string;
  href: string;
}