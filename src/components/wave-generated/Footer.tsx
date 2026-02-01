// Simple Footer component with copyright and social media links for Footprint
import React from 'react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Twitter',
      url: 'https://twitter.com/footprint',
      icon: '𝕏'
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/company/footprint',
      icon: '💼'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/footprint',
      icon: '🐙'
    }
  ];

  return (
    <footer className={`bg-gray-800 text-white py-6 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <div className="text-sm text-gray-300 mb-4 md:mb-0">
            © {currentYear} Footprint. All rights reserved.
          </div>
          
          {/* Social Media Links */}
          <div className="flex space-x-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-200"
                aria-label={`Follow us on ${link.name}`}
              >
                <span className="text-lg">{link.icon}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;