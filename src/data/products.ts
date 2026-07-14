// Dữ liệu mẫu sản phẩm (mock). Thực tế lấy từ Netlify Database qua Prisma.
// Dùng trong UI demo trước khi kết nối DB.

export interface ProductSeed {
  id: string;
  type: "TOUR" | "HOTEL" | "TICKET";
  title: string;
  priceAdult: number;
  priceChild: number;
  priceInfant: number;
  image: string;
  blurb: string;
}

export const PRODUCTS: ProductSeed[] = [
  {
    id: "tour-ha-long",
    type: "TOUR",
    title: "Tour Vịnh Hạ Long 2N1Đ - Du thuyền 5 sao",
    priceAdult: 2490000,
    priceChild: 1490000,
    priceInfant: 490000,
    image: "https://picsum.photos/seed/ha-long-bay/800/600",
    blurb: "Ngủ đêm trên du thuyền, kayak hang Sửng Sốt, ăn hải sản tươi.",
  },
  {
    id: "hotel-da-lat",
    type: "HOTEL",
    title: "Khách sạn Ana Mandara Đà Lạt - Deluxe Garden",
    priceAdult: 1200000,
    priceChild: 0,
    priceInfant: 0,
    image: "https://picsum.photos/seed/dalat-resort/800/600",
    blurb: "Phòng view vườn thông, buffet sáng, gần Hồ Xuân Hương.",
  },
  {
    id: "ticket-vinpearl",
    type: "TICKET",
    title: "Vé VinWonders Nha Trang - Cả ngày",
    priceAdult: 650000,
    priceChild: 480000,
    priceInfant: 0,
    image: "https://picsum.photos/seed/vinwonders-nha-trang/800/600",
    blurb: "Trọn gói trò chơi, thủy cung, show nhạc nước cuối tuần.",
  },
  {
    id: "tour-phu-quoc",
    type: "TOUR",
    title: "Tour Phú Quốc - Cáp treo Hòn Thơm & Lặn biển",
    priceAdult: 1890000,
    priceChild: 990000,
    priceInfant: 390000,
    image: "https://picsum.photos/seed/phu-quoc-island/800/600",
    blurb: "Cáp treo dài nhất thế giới, lặn ngắm san hô quần đảo An Thới.",
  },
  {
    id: "ticket-bana",
    type: "TICKET",
    title: "Vé Cầu Vàng Ba Na Hills - Combo cáp treo",
    priceAdult: 850000,
    priceChild: 650000,
    priceInfant: 0,
    image: "https://picsum.photos/seed/ba-na-hills/800/600",
    blurb: "Cầu Vàng nổi tiếng, Fantasy Park, vườn hoa Le Jardin D'amour.",
  },
  {
    id: "hotel-hoi-an",
    type: "HOTEL",
    title: "Resort Anantara Hội An - Pool Villa",
    priceAdult: 3200000,
    priceChild: 0,
    priceInfant: 0,
    image: "https://picsum.photos/seed/anantara-hoi-an/800/600",
    blurb: "Biệt thự hồ bơi riêng, bờ biển Cửa Đại, dịch vụ spa sang trọng.",
  },
];

export function getProduct(id: string): ProductSeed | undefined {
  return PRODUCTS.find((p) => p.id === id);
}