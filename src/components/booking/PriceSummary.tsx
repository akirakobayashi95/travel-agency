import type { BookingPricing, BookingTravelers } from "@/types";

function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

interface Props {
  pricing: BookingPricing;
  travelers: BookingTravelers;
}

export default function PriceSummary({ pricing, travelers }: Props) {
  const rows = [
    { label: `Người lớn (${travelers.adults})`, price: pricing.adultTotal },
    ...(travelers.children > 0 ? [{ label: `Trẻ em (${travelers.children})`, price: pricing.childTotal }] : []),
    ...(travelers.infants > 0 ? [{ label: `Em bé (${travelers.infants})`, price: pricing.infantTotal }] : []),
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
      <h3 className="font-montserrat font-bold text-gray-900 mb-2">Chi tiết giá</h3>

      {pricing.adultPrice > 0 && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>Giá người lớn</span>
          <span>{formatVND(pricing.adultPrice)}</span>
        </div>
      )}
      {pricing.childPrice > 0 && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>Giá trẻ em</span>
          <span>{formatVND(pricing.childPrice)}</span>
        </div>
      )}
      {pricing.infantPrice > 0 && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>Giá em bé</span>
          <span>{formatVND(pricing.infantPrice)}</span>
        </div>
      )}

      <div className="border-t border-gray-200 pt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between text-sm">
            <span className="text-gray-700">{row.label}</span>
            <span className="font-medium">{formatVND(row.price)}</span>
          </div>
        ))}
      </div>

      {pricing.surcharge > 0 && (
        <div className="flex justify-between text-sm text-orange-600">
          <span>Phụ thu</span>
          <span>{formatVND(pricing.surcharge)}</span>
        </div>
      )}
      {pricing.discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Giảm giá</span>
          <span>-{formatVND(pricing.discount)}</span>
        </div>
      )}

      <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
        <span className="font-montserrat font-bold text-gray-900">Tổng cộng</span>
        <span className="text-xl font-bold text-primary">{formatVND(pricing.total)}</span>
      </div>
    </div>
  );
}