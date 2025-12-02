'use client';

import { Facebook, Heart, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Dành cho Ứng viên',
      links: [
        { href: '/jobs', label: 'Tìm việc làm' },
        { href: '/companies', label: 'Khám phá công ty' },
        { href: '/career-advice', label: 'Tư vấn nghề nghiệp' },
        { href: '/salary-guide', label: 'Bảng lương' },
        { href: '/cv-builder', label: 'Tạo CV' },
      ],
    },
    {
      title: 'Dành cho Nhà tuyển dụng',
      links: [
        { href: '/post-job', label: 'Đăng tuyển dụng' },
        { href: '/search-candidates', label: 'Tìm ứng viên' },
        { href: '/pricing', label: 'Bảng giá dịch vụ' },
        { href: '/employer-guide', label: 'Hướng dẫn tuyển dụng' },
        { href: '/contact-sales', label: 'Liên hệ bán hàng' },
      ],
    },
    {
      title: 'Về Jobify',
      links: [
        { href: '/about', label: 'Về chúng tôi' },
        { href: '/press', label: 'Tin tức' },
        { href: '/careers', label: 'Tuyển dụng' },
        { href: '/contact', label: 'Liên hệ' },
        { href: '/blog', label: 'Blog' },
      ],
    },
    {
      title: 'Hỗ trợ',
      links: [
        { href: '/help', label: 'Trung tâm trợ giúp' },
        { href: '/privacy', label: 'Chính sách bảo mật' },
        { href: '/terms', label: 'Điều khoản sử dụng' },
        { href: '/cookies', label: 'Chính sách Cookie' },
        { href: '/sitemap', label: 'Sơ đồ trang web' },
      ],
    },
  ];

  const socialLinks = [
    { href: 'https://facebook.com/jobify.vn', icon: Facebook, label: 'Facebook' },
    { href: 'https://twitter.com/jobify_vn', icon: Twitter, label: 'Twitter' },
    { href: 'https://linkedin.com/company/jobify-vn', icon: Linkedin, label: 'LinkedIn' },
    { href: 'https://instagram.com/jobify.vn', icon: Instagram, label: 'Instagram' },
  ];

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Địa chỉ',
      content: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    },
    {
      icon: Phone,
      title: 'Điện thoại',
      content: '+84 28 1234 5678',
      href: 'tel:+842812345678',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'contact@jobify.vn',
      href: 'mailto:contact@jobify.vn',
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="text-2xl font-bold text-white">
                Jobify
              </span>
            </Link>

            <p className="text-gray-300 mb-6 leading-relaxed text-sm">
              Nền tảng tìm việc hàng đầu Việt Nam, kết nối ứng viên tài năng với các cơ hội việc làm tốt nhất từ những công ty uy tín.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <info.icon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-gray-400">{info.title}</div>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <div className="text-sm text-gray-300">{info.content}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex space-x-3 mt-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-slate-700/50 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-200 group"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors duration-200" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="lg:col-span-1">
              <h3 className="text-base font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-slate-800/50 border-t border-slate-700/50">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              Đăng ký nhận thông tin việc làm mới
            </h3>
            <p className="text-gray-400 mb-6 text-sm">
              Nhận thông báo về những cơ hội việc làm phù hợp với bạn
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-3 bg-slate-700/50 text-white placeholder-gray-400 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-slate-900/80 border-t border-slate-700/50">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-gray-400 mb-3 md:mb-0">
              © {currentYear} Jobify. Tất cả quyền được bảo lưu.
            </div>

            <div className="flex items-center text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 mx-1 fill-current" />
              <span>in Vietnam</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;