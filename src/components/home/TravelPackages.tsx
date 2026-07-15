import { motion } from "framer-motion";
import { Clock, Users, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { packages } from "@/data/destinations";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function TravelPackages() {
  return (
    <section id="packages" className="section-padding">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="section-subtitle">Tour du lịch</p>
          <h2 className="section-title">Gói Tour Phổ Biến</h2>
          <p className="section-description">
            Những tour du lịch được yêu thích nhất với lịch trình hấp dẫn và giá cả hợp lý
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="bg-secondary text-white text-sm font-bold px-3 py-1 rounded-full">
                    {pkg.duration}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-montserrat font-bold text-lg text-gray-900 mb-3 line-clamp-2">
                  {pkg.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                  {pkg.description}
                </p>

                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-primary" />
                    {pkg.duration}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-primary" />
                    {pkg.maxPax} người
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-primary" />
                    {pkg.location}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: pkg.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">({pkg.reviews} đánh giá)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{formatPrice(pkg.price)}</p>
                    <p className="text-xs text-gray-400">/ người</p>
                  </div>
                </div>

                <Button variant="secondary" className="w-full mt-4">
                  Đặt ngay
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg">
            Xem tất cả tour
          </Button>
        </motion.div>
      </div>
    </section>
  );
}