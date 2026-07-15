import { motion } from "framer-motion";
import { Image } from "lucide-react";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    alt: "Bãi biển Phú Yên",
  },
  {
    src: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&q=80",
    alt: "Ghềnh Đá Đĩa",
  },
  {
    src: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&q=80",
    alt: "Đà Lạt",
  },
  {
    src: "https://images.unsplash.com/photo-1564419320468-6872c2b93b6a?w=600&q=80",
    alt: "Vịnh Vũng Rô",
  },
  {
    src: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600&q=80",
    alt: "Bãi Xép",
  },
  {
    src: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=600&q=80",
    alt: "Đầm Ô Loan",
  },
];

export default function PhotoGallery() {
  return (
    <section id="gallery" className="section-padding bg-gray-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="section-subtitle">Thư viện ảnh</p>
          <h2 className="section-title">Khoảnh Khắc Du Lịch</h2>
          <p className="section-description">
            Những hình ảnh đẹp nhất từ các chuyến đi của du khách cùng Nghinh Phong Travel
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
                index === 0 ? "col-span-2 row-span-2" : ""
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover aspect-square group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <Image className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}