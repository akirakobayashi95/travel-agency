import { Input } from "@/components/ui/input";
import type { BookingContact } from "@/types";

interface Props {
  contact: BookingContact;
  onChange: (field: keyof BookingContact, value: string) => void;
  errors: string[];
}

export default function ContactInfoStep({ contact, onChange, errors }: Props) {
  const fieldError = (field: keyof BookingContact) =>
    errors.find((e) => e.toLowerCase().includes(field === "fullName" ? "họ tên" : field === "phone" ? "điện thoại" : field === "email" ? "email" : ""));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <Input
          value={contact.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          placeholder="Nguyễn Văn A"
          className={fieldError("fullName") ? "border-red-500" : ""}
        />
        {fieldError("fullName") && (
          <p className="text-xs text-red-500 mt-1">{fieldError("fullName")}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <Input
          value={contact.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="0901234567"
          className={fieldError("phone") ? "border-red-500" : ""}
        />
        {fieldError("phone") && (
          <p className="text-xs text-red-500 mt-1">{fieldError("phone")}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <Input
          type="email"
          value={contact.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="email@example.com"
          className={fieldError("email") ? "border-red-500" : ""}
        />
        {fieldError("email") && (
          <p className="text-xs text-red-500 mt-1">{fieldError("email")}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
        <Input
          value={contact.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
        <textarea
          value={contact.note}
          onChange={(e) => onChange("note", e.target.value)}
          placeholder="Yêu cầu đặc biệt (nếu có)"
          rows={3}
          className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
    </div>
  );
}