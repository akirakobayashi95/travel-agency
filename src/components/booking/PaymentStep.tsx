import { Check } from "lucide-react";
import type { PaymentMethod } from "@/types";

function formatVND(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

interface Props {
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  total: number;
}

const METHODS = [
  { id: "full" as PaymentMethod, label: "Thanh toán toàn bộ", desc: "Thanh toán 100% tổng tiền tour" },
  { id: "deposit" as PaymentMethod, label: "Đặt cọc 30%", desc: "Chỉ thanh toán 30% khi đặt, còn lại tại văn phòng" },
  { id: "office" as PaymentMethod, label: "Tại văn phòng", desc: "Thanh toán khi đến văn phòng Nghinh Phong" },
];

export default function PaymentStep({
  method,
  onMethodChange,
  termsAccepted,
  onTermsChange,
  total,
}: Props) {
  const depositAmount = Math.round(total * 0.3);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-montserrat font-bold text-gray-900 mb-3">Phương thức thanh toán</h3>
        <div className="space-y-3">
          {METHODS.map((m) => (
            <label
              key={m.id}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                method === m.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={method === m.id}
                onChange={() => onMethodChange(m.id)}
                className="mt-1 accent-primary"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{m.label}</p>
                <p className="text-sm text-gray-500">{m.desc}</p>
                {m.id === "deposit" && (
                  <p className="text-sm text-primary font-semibold mt-1">
                    Số tiền cọc: {formatVND(depositAmount)}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
        <span className="text-gray-700 font-medium">Tổng thanh toán</span>
        <span className="text-xl font-bold text-primary">
          {formatVND(method === "deposit" ? depositAmount : total)}
        </span>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="mt-1 accent-primary"
        />
        <span className="text-sm text-gray-600">
          Tôi đã đọc và đồng ý với{" "}
          <a href="#" className="text-primary hover:underline">
            điều khoản và điều kiện
          </a>{" "}
          của Nghinh Phong Travel
        </span>
      </label>

      {!termsAccepted && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <Check className="w-3 h-3" />
          Vui lòng đồng ý điều khoản để tiếp tục
        </p>
      )}
    </div>
  );
}