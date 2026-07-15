import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Search, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Trang chủ", href: "#home" },
  { label: "Điểm đến", href: "#destinations" },
  { label: "Tour du lịch", href: "#packages" },
  { label: "Thư viện", href: "#gallery" },
  { label: "Tin tức", href: "#news" },
  { label: "Liên hệ", href: "#contact" },
];

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "glass shadow-md" : "bg-transparent"
      )}
    >
      {/* Header Top */}
      <div className="hidden lg:block border-b border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="tel:+84123456789" className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors">
            <Phone className="w-4 h-4" />
            <span>Hotline: +84 123 456 789</span>
          </a>

          <Link to="/" className="flex items-center gap-2">
            <Compass className="w-8 h-8 text-primary" />
            <span className="font-montserrat font-bold text-xl text-gray-900">
              Nghinh Phong
            </span>
          </Link>

          <button className="text-gray-600 hover:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Header Bottom */}
      <div className="container">
        <div className="flex items-center justify-between lg:justify-center gap-8 py-3">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <Compass className="w-7 h-7 text-primary" />
            <span className="font-montserrat font-bold text-lg text-gray-900">
              Nghinh Phong
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="secondary" size="sm">
              Đặt Tour
            </Button>
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-3 lg:hidden">
            <a href="tel:+84123456789" className="text-primary">
              <Phone className="w-5 h-5" />
            </a>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="text-gray-700"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass border-t lg:hidden overflow-hidden"
          >
            <nav className="container py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="py-3 px-4 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Button variant="secondary" className="mt-2" onClick={() => setIsMobileOpen(false)}>
                Đặt Tour
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}