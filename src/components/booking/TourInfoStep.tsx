import { Minus, Plus, MapPin, Calendar } from "lucide-react";
import type { TourPackage, BookingTravelers } from "@/types";

interface Props {
  tour: TourPackage;
  departureDate: string;
  pickupPoint: string;
  travelers: BookingTravelers;
  onDateChange: (date: string) => void;
  onPickupChange: (point: string) => void;
  onUpdateTraveler: (type: keyof BookingTravelers, delta: number) => void;
}

const PICKUP_POINTS = [
  "Văn phòng Nghinh Phong - Tuy Hòa",
  "Sân bay Tuy Hòa",
  "Ga Tuy Hòa",
  "Khách sạn tại trung tâm TP. Tuy Hòa",
];

function Counter({
  label,
  value,
  onMinus,
  onPlus,
  min = 0,
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-gray-700 font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMinus}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-semibold">{value}</span>
        <button
          type="button"
          onClick={onPlus}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function TourInfoStep({
  tour,
  departureDate,
  pickupPoint,
  travelers,
  onDateChange,
  onPickupChange,
  onUpdateTraveler,
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Tour info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-montserrat font-bold text-gray-900 mb-1">{tour.title}</h3>
        <p className="text-sm text-gray-500">
          {tour.duration} · {tour.location}
        </p>
      </div>

      {/* Date */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 text-primary" />
          Ngày khởi hành
        </label>
        <input
          type="date"
          min={today}
          value={departureDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Pickup */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          Điểm đón
        </label>
        <select
          value={pickupPoint}
          onChange={(e) => onPickupChange(e.target.value)}
          className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {PICKUP_POINTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Travelers */}
      <div className="border-t border-gray-100 pt-2">
        <p className="text-sm font-medium text-gray-700 mb-2">Số lượng khách</p>
        <Counter
          label="Người lớn"
          value={travelers.adults}
          onMinus={() => onUpdateTraveler("adults", -1)}
          onPlus={() => onUpdateTraveler("adults", 1)}
          min={1}
        />
        <Counter
          label="Trẻ em"
          value={travelers.children}
          onMinus={() => onUpdateTraveler("children", -1)}
          onPlus={() => onUpdateTraveler("children", 1)}
        />
        <Counter
          label="Em bé"
          value={travelers.infants}
          onMinus={() => onUpdateTraveler("infants", -1)}
          onPlus={() => onUpdateTraveler("infants", 1)}
        />
      </div>
    </div>
  );
}