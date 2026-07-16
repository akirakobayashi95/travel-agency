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
  childPrice?: number;
  infantPrice?: number;
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

export type BookingStatus = "pending" | "confirmed" | "paid" | "completed" | "cancelled";

export type PaymentMethod = "full" | "deposit" | "office";

export interface BookingContact {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  note: string;
}

export interface BookingTravelers {
  adults: number;
  children: number;
  infants: number;
}

export interface BookingPricing {
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  adultTotal: number;
  childTotal: number;
  infantTotal: number;
  surcharge: number;
  discount: number;
  total: number;
}

export interface BookingPayment {
  method: PaymentMethod;
  amount: number;
  paidAt: string | null;
}

export interface Booking {
  id: string;
  code: string;
  status: BookingStatus;
  contact: BookingContact;
  packageId: string;
  packageTitle: string;
  departureDate: string;
  pickupPoint: string;
  travelers: BookingTravelers;
  pricing: BookingPricing;
  payment: BookingPayment;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  contact: BookingContact;
  packageId: string;
  packageTitle: string;
  departureDate: string;
  pickupPoint: string;
  travelers: BookingTravelers;
  pricing: BookingPricing;
  payment: BookingPayment;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}