import { useState, useCallback, useMemo } from "react";
import type {
  BookingContact,
  BookingTravelers,
  BookingPricing,
  PaymentMethod,
  CreateBookingPayload,
} from "@/types";
import { bookingApi } from "@/services/bookingApi";
import type { TourPackage } from "@/types";

const EMPTY_CONTACT: BookingContact = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  note: "",
};

const EMPTY_TRAVELERS: BookingTravelers = { adults: 2, children: 0, infants: 0 };

export function useBooking(tour?: TourPackage) {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState<BookingContact>(EMPTY_CONTACT);
  const [departureDate, setDepartureDate] = useState("");
  const [pickupPoint, setPickupPoint] = useState("Văn phòng Nghinh Phong - Tuy Hòa");
  const [travelers, setTravelers] = useState<BookingTravelers>(EMPTY_TRAVELERS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("full");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<unknown>(null);

  const pricing: BookingPricing = useMemo(() => {
    if (!tour) {
      return {
        adultPrice: 0,
        childPrice: 0,
        infantPrice: 0,
        adultTotal: 0,
        childTotal: 0,
        infantTotal: 0,
        surcharge: 0,
        discount: 0,
        total: 0,
      };
    }
    const adultPrice = tour.price;
    const childPrice = tour.childPrice ?? Math.round(tour.price * 0.6);
    const infantPrice = tour.infantPrice ?? 0;
    const adultTotal = adultPrice * travelers.adults;
    const childTotal = childPrice * travelers.children;
    const infantTotal = infantPrice * travelers.infants;
    const subtotal = adultTotal + childTotal + infantTotal;
    const discount = 0;
    const surcharge = 0;
    const total = subtotal + surcharge - discount;
    return {
      adultPrice,
      childPrice,
      infantPrice,
      adultTotal,
      childTotal,
      infantTotal,
      surcharge,
      discount,
      total,
    };
  }, [tour, travelers]);

  const updateTraveler = useCallback(
    (type: keyof BookingTravelers, delta: number) => {
      setTravelers((prev) => {
        const next = { ...prev, [type]: Math.max(0, prev[type] + delta) };
        if (next.adults < 1) next.adults = 1;
        return next;
      });
    },
    []
  );

  const validateStep1 = useCallback((): string[] => {
    const errors: string[] = [];
    if (!contact.fullName.trim()) errors.push("Họ tên không được để trống");
    if (!contact.phone.trim()) errors.push("Số điện thoại không được để trống");
    else if (!/^[0-9+\-\s]{10,11}$/.test(contact.phone))
      errors.push("Số điện thoại không đúng định dạng");
    if (!contact.email.trim()) errors.push("Email không được để trống");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))
      errors.push("Email không hợp lệ");
    return errors;
  }, [contact]);

  const submit = useCallback(async () => {
    if (!tour) return;
    setLoading(true);
    setError(null);
    const payload: CreateBookingPayload = {
      contact,
      packageId: tour.id,
      packageTitle: tour.title,
      departureDate,
      pickupPoint,
      travelers,
      pricing,
      payment: {
        method: paymentMethod,
        amount:
          paymentMethod === "deposit" ? Math.round(pricing.total * 0.3) : pricing.total,
        paidAt: null,
      },
    };
    const res = await bookingApi.create(payload);
    setLoading(false);
    if (res.success && res.data) {
      setCreatedBooking(res.data);
      setStep(5);
    } else {
      setError(Array.isArray(res.error) ? res.error.join(", ") : res.error || "Đặt tour thất bại");
    }
  }, [tour, contact, departureDate, pickupPoint, travelers, pricing, paymentMethod]);

  const reset = useCallback(() => {
    setStep(1);
    setContact(EMPTY_CONTACT);
    setTravelers(EMPTY_TRAVELERS);
    setTermsAccepted(false);
    setError(null);
    setCreatedBooking(null);
  }, []);

  return {
    step,
    setStep,
    contact,
    setContact,
    departureDate,
    setDepartureDate,
    pickupPoint,
    setPickupPoint,
    travelers,
    updateTraveler,
    paymentMethod,
    setPaymentMethod,
    termsAccepted,
    setTermsAccepted,
    pricing,
    loading,
    error,
    createdBooking,
    validateStep1,
    submit,
    reset,
  };
}