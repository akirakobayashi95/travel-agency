import { Link } from "react-router-dom";
import { Compass, Phone, Mail, MapPin, Facebook, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <Compass className="w-8 h-8 text-primary" />
              <span className="font-montserrat font-bold text-xl text-white">
                Nghinh Phong
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Công ty TNHH Dịch vụ Du lịch Nghinh Phong - Đồng hành cùng bạn trên mọi hành trình khám phá Việt Nam.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="font-montserrat font-bold text-lg text-white">Liên hệ</h4>
            <p className="text-gray-400">Hãy liên hệ với chúng tôi để được tư vấn!</p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+84123456789" className="hover:text-primary transition-colors">
                  +84 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:info@nghinhphongtravel.com" className="hover:text-primary transition-colors">
                  info@nghinhphongtravel.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <address className="not-italic">
                  123 Nguyễn Huệ, TP. Tuy Hòa, Phú Yên
                </address>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="font-montserrat font-bold text-lg text-white">Đăng ký nhận tin</h4>
            <p className="text-gray-400">
              Đăng ký để nhận thông tin khuyến mãi và tin tức du lịch mới nhất!
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Email của bạn"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button type="submit" variant="secondary">
                Đăng ký
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Nghinh Phong Travel. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-primary transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-primary transition-colors">FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}