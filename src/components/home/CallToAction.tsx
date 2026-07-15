import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1920&q=85)`,
        }}
      />

      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />

      <div className="container relative z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-white/80 font-montserrat tracking-[0.2em] uppercase text-sm font-semibold mb-4">
            Liên hệ
          </p>
          <h2 className="font-montserrat text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Sẵn Sàng Cho Chuyến Đi
            <br />
            Đáng Nhớ? Hãy Liên Hệ Ngay!
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Đội ngũ Nghinh Phong Travel luôn sẵn sàng tư vấn và hỗ trợ bạn lên kế hoạch cho chuyến du lịch hoàn hảo nhất.
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="text-base shadow-xl hover:shadow-2xl"
          >
            Liên hệ ngay
          </Button>
        </motion.div>
      </div>
    </section>
  );
}