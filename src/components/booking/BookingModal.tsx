import { AnimatePresence, motion } from "framer-motion";
import { X, User, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TourPackage } from "@/types";
import { useBooking } from "@/hooks/useBooking";
import ContactInfoStep from "./ContactInfoStep";
import TourInfoStep from "./TourInfoStep";
import PriceSummary from "./PriceSummary";
import PaymentStep from "./PaymentStep";
import BookingSuccess from "./BookingSuccess";

interface Props {
  tour: TourPackage | null;
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { id: 1, label: "Thông tin liên hệ", icon: User },
  { id: 2, label: "Thông tin tour", icon: MapPin },
  { id: 3, label: "Thanh toán", icon: CreditCard },
];

export default function BookingModal({ tour, isOpen, onClose }: Props) {
  const booking = useBooking(tour ?? undefined);
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  if (!tour) return null;

  const handleNext = () => {
    if (booking.step === 1) {
      const errors = booking.validateStep1();
      if (errors.length > 0) {
        setStepErrors(errors);
        return;
      }
      setStepErrors([]);
    }
    if (booking.step === 2 && !booking.departureDate) {
      setStepErrors(["Vui lòng chọn ngày khởi hành"]);
      return;
    }
    setStepErrors([]);
    booking.setStep(booking.step + 1);
  };

  const handleBack = () => booking.setStep(Math.max(1, booking.step - 1));

  const canSubmit =
    booking.step === 3 && booking.termsAccepted && booking.pricing.total > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 1 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full md:max-w-4xl md:rounded-2xl rounded-t-2xl max-h-[95vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-montserrat font-bold text-xl text-gray-900">
                Đặt tour: {tour.title}
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Step indicator */}
            {booking.step < 5 && (
              <div className="flex items-center justify-center gap-2 px-5 py-4 bg-gray-50">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="flex items-center">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                        booking.step >= s.id
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      <s.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{s.label}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-6 h-0.5 bg-gray-300 mx-1" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6">
              {booking.step === 5 && booking.createdBooking ? (
                <BookingSuccess booking={booking.createdBooking as any} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    {booking.step === 1 && (
                      <ContactInfoStep
                        contact={booking.contact}
                        onChange={(f, v) => booking.setContact((c) => ({ ...c, [f]: v }))}
                        errors={stepErrors}
                      />
                    )}
                    {booking.step === 2 && (
                      <TourInfoStep
                        tour={tour}
                        departureDate={booking.departureDate}
                        pickupPoint={booking.pickupPoint}
                        travelers={booking.travelers}
                        onDateChange={booking.setDepartureDate}
                        onPickupChange={booking.setPickupPoint}
                        onUpdateTraveler={booking.updateTraveler}
                      />
                    )}
                    {booking.step === 3 && (
                      <PaymentStep
                        method={booking.paymentMethod}
                        onMethodChange={booking.setPaymentMethod}
                        termsAccepted={booking.termsAccepted}
                        onTermsChange={booking.setTermsAccepted}
                        total={booking.pricing.total}
                      />
                    )}

                    {booking.error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                        {booking.error}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      {booking.step > 1 && (
                        <Button variant="outline" onClick={handleBack}>
                          Quay lại
                        </Button>
                      )}
                      {booking.step < 3 && (
                        <Button variant="secondary" className="flex-1" onClick={handleNext}>
                          Tiếp tục
                        </Button>
                      )}
                      {booking.step === 3 && (
                        <Button
                          variant="secondary"
                          className="flex-1"
                          disabled={!canSubmit || booking.loading}
                          onClick={booking.submit}
                        >
                          {booking.loading ? "Đang xử lý..." : "Xác nhận đặt tour"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Summary sidebar */}
                  <div className="md:col-span-1">
                    <PriceSummary pricing={booking.pricing} travelers={booking.travelers} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState } from "react";