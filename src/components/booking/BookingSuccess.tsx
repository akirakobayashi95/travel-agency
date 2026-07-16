import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { Booking } from "@/types";

function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

interface Props {
  booking: Booking;
}

export default function BookingSuccess({ booking }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </motion.div>

      <h2 className="font-montserrat text-2xl font-bold text-gray-900 mb-2">
        Đặt tour thành công!
      </h2>
      <p className="text-gray-500 mb-6">
        Cảm ơn bạn đã đặt tour cùng Nghinh Phong Travel
      </p>

      <div className="bg-gray-50 rounded-xl p-6 text-left max-w-sm mx-auto space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Mã booking</span>
          <span className="font-bold text-primary">{booking.code}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Tour</span>
          <span className="font-medium text-right max-w-[200px]">{booking.packageTitle}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Ngày đi</span>
          <span className="font-medium">{booking.departureDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Khách hàng</span>
          <span className="font-medium">{booking.contact.fullName}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-3">
          <span className="text-gray-700 font-medium">Tổng thanh toán</span>
          <span className="font-bold text-primary">{formatVND(booking.pricing.total)}</span>
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-6">
        Chúng tôi sẽ liên hệ bạn trong thời gian sớm nhất để xác nhận.
      </p>
    </motion.div>
  );
}