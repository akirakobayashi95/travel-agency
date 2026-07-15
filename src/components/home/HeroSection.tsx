import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/70 to-primary/30 z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85)`,
        }}
      />

      {/* Content */}
      <div className="container relative z-20 text-center px-4">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-primary font-montserrat tracking-[0.2em] uppercase text-sm font-semibold mb-6"
        >
          Công ty TNHH Dịch vụ Du lịch Nghinh Phong
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-montserrat text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Khám Phá{" "}
          <span className="text-primary">Việt Nam</span>
          <br />
          Cùng Nghinh Phong
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Đồng hành cùng bạn trên mọi hành trình khám phá những vùng đất mới,
          từ Phú Yên đến khắp mọi miền Việt Nam.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="secondary" size="lg" className="text-base">
            Khám phá ngay
          </Button>
          <Button variant="outline" size="lg" className="text-base border-white text-white hover:bg-white hover:text-gray-900">
            Liên hệ tư vấn
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-3 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}