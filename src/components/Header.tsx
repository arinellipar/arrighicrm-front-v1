"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Users,
  Building2,
  UserCog,
  Scale,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuItems: MenuGroup[] = [
  {
    label: "Cadastros Gerais",
    items: [
      {
        label: "Pessoa Física",
        href: "/cadastros/pessoa-fisica",
        icon: <Users className="w-4 h-4" />,
      },
      {
        label: "Pessoa Jurídica",
        href: "/cadastros/pessoa-juridica",
        icon: <Building2 className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Gestão de Usuários",
    items: [
      {
        label: "Usuários",
        href: "/usuarios",
        icon: <UserCheck className="w-4 h-4" />,
      },
    ],
  },
];

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return (
    <header className="relative z-50">
      {/* Barra principal */}
      <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 shadow-lg border-b border-primary-600/20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="flex items-center space-x-2">
                <Scale className="w-8 h-8 text-accent-400" />
                <div>
                  <h1 className="text-xl font-bold text-white">Arrighi</h1>
                  <p className="text-xs text-primary-200 -mt-1">Advogados</p>
                </div>
              </div>
            </motion.div>

            {/* Navegação principal */}
            <nav className="flex items-center space-x-1">
              {/* Link Início */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Link
                  href="/"
                  className={cn(
                    "flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    "text-white hover:bg-white/10 hover:text-accent-300",
                    "focus:outline-none focus:ring-2 focus:ring-accent-400/50"
                  )}
                >
                  <span>Início</span>
                </Link>
              </motion.div>

              {/* Menus com Dropdown */}
              {menuItems.map((group, index) => (
                <div key={group.label} className="relative">
                  <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 1) * 0.1 }}
                    onClick={() => handleDropdownToggle(group.label)}
                    className={cn(
                      "flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      "text-white hover:bg-white/10 hover:text-accent-300",
                      "focus:outline-none focus:ring-2 focus:ring-accent-400/50",
                      activeDropdown === group.label &&
                        "bg-white/10 text-accent-300"
                    )}
                  >
                    <span>{group.label}</span>
                    <motion.div
                      animate={{
                        rotate: activeDropdown === group.label ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </motion.button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {activeDropdown === group.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-secondary-200/20 overflow-hidden"
                      >
                        <div className="p-2">
                          {group.items.map((item, itemIndex) => (
                            <motion.div
                              key={item.href}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: itemIndex * 0.05 }}
                            >
                              <Link
                                href={item.href}
                                className={cn(
                                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium",
                                  "text-secondary-700 hover:bg-primary-50 hover:text-primary-700",
                                  "transition-all duration-200 group"
                                )}
                                onClick={() => setActiveDropdown(null)}
                              >
                                <div className="flex-shrink-0 text-secondary-500 group-hover:text-primary-600">
                                  {item.icon}
                                </div>
                                <span className="flex-grow">{item.label}</span>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Área do usuário */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-white">Usuário Admin</p>
                <p className="text-xs text-primary-200">Sistema CRM</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">A</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Overlay para fechar dropdown */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setActiveDropdown(null)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
