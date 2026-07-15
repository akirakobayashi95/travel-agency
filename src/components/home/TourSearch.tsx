import { motion } from "framer-motion";
import { Search, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TourSearch() {
  return (
    <section className="relative -mt-20 z-30 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="glass rounded-2xl shadow-xl p-6 md:p-8 lg:p-10"
        >
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
            <div className="space-y-2 lg:col-span-1">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Điểm đến
              </label>
              <Input placeholder="Nhập điểm đến..." className="w-full" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Số người
              </label>
              <Input type="number" placeholder="Số người" min={1} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Ngày đi
              </label>
              <Input type="date" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Ngày về
              </label>
              <Input type="date" />
            </div>

            <div className="flex items-end">
              <Button variant="secondary" size="lg" className="w-full text-base">
                Tìm kiếm
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}