// Seed dữ liệu demo: sản phẩm + tồn kho theo ngày.
// Chạy: npx prisma db seed (cấu hình trong package.json "prisma": { "seed": ... })
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Xóa sạch để seed lại (chỉ demo).
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();

  const products = [
    {
      id: "tour-ha-long",
      type: "TOUR" as const,
      title: "Tour Vịnh Hạ Long 2N1Đ - Du thuyền 5 sao",
      priceAdult: 2490000,
      priceChild: 1490000,
      priceInfant: 490000,
    },
    {
      id: "hotel-da-lat",
      type: "HOTEL" as const,
      title: "Khách sạn Ana Mandara Đà Lạt - Deluxe Garden",
      priceAdult: 1200000,
      priceChild: 0,
      priceInfant: 0,
    },
    {
      id: "ticket-vinpearl",
      type: "TICKET" as const,
      title: "Vé VinWonders Nha Trang - Cả ngày",
      priceAdult: 650000,
      priceChild: 480000,
      priceInfant: 0,
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
    // Tạo tồn kho 30 ngày tới, mỗi ngày 20 slot.
    const inventories = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      d.setUTCDate(d.getUTCDate() + i);
      inventories.push({
        productId: p.id,
        date: d,
        totalSlots: 20,
        bookedSlots: 0,
      });
    }
    await prisma.inventory.createMany({ data: inventories });
  }

  console.log("Seed hoàn tất: 3 sản phẩm, 30 ngày tồn kho mỗi loại.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });