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
    id: "11111111-1111-1111-1111-111111111111",
    type: "TOUR",
    title: "Tour Vịnh Hạ Long 2N1Đ - Du thuyền 5 sao",
    priceAdult: 2490000,
    priceChild: 1490000,
    priceInfant: 490000,
    image: "https://picsum.photos/seed/ha-long-bay/800/600",
    blurb: "Ngủ đêm trên du thuyền, kayak hang Sửng Sốt, ăn hải sản tươi.",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    type: "HOTEL",
    title: "Khách sạn Ana Mandara Đà Lạt - Deluxe Garden",
    priceAdult: 1200000,
    priceChild: 0,
    priceInfant: 0,
    image: "https://picsum.photos/seed/dalat-resort/800/600",
    blurb: "Phòng view vườn thông, buffet sáng, gần Hồ Xuân Hương.",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    type: "TICKET",
    title: "Vé VinWonders Nha Trang - Cả ngày",
    priceAdult: 650000,
    priceChild: 480000,
    priceInfant: 0,
    image: "https://picsum.photos/seed/vinwonders-nha-trang/800/600",
    blurb: "Trọn gói trò chơi, thủy cung, show nhạc nước cuối tuần.",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    type: "TOUR",
    title: "Tour Phú Quốc - Cáp treo Hòn Thơm & Lặn biển",
    priceAdult: 1890000,
    priceChild: 990000,
    priceInfant: 390000,
    image: "https://picsum.photos/seed/phu-quoc-island/800/600",
    blurb: "Cáp treo dài nhất thế giới, lặn ngắm san hô quần đảo An Thới.",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    type: "TICKET",
    title: "Vé Cầu Vàng Ba Na Hills - Combo cáp treo",
    priceAdult: 850000,
    priceChild: 650000,
    priceInfant: 0,
    image: "https://picsum.photos/seed/ba-na-hills/800/600",
    blurb: "Cầu Vàng nổi tiếng, Fantasy Park, vườn hoa Le Jardin D'amour.",
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
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