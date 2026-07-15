import { motion } from "framer-motion";
import { faqItems } from "@/data/faq";

export default function FAQSection() {
  return (
    <section className="section-padding">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="section-subtitle">Hỗ trợ</p>
          <h2 className="section-title">Câu Hỏi Thường Gặp</h2>
          <p className="section-description">
            Những thắc mắc phổ biến về dịch vụ du lịch của chúng tôi
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <motion.details
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer p-5 lg:p-6 font-semibold text-gray-900 hover:text-primary transition-colors list-none">
                {item.question}
                <motion.span
                  className="shrink-0 ml-4 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <svg
                    className="w-3 h-3 text-primary group-open:rotate-180 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.span>
              </summary>
              <div className="px-5 lg:px-6 pb-5 lg:pb-6">
                <p className="text-gray-600 leading-relaxed text-sm">
                  {item.answer}
                </p>
              </div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}