"use client";

import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import { useForm } from "@/contexts/FormContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isFormOpen } = useForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.3),transparent)] opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.2),transparent)] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(236,165,69,0.1),transparent)] opacity-40" />
      </div>

      {/* Header */}
      <AnimatePresence>
        {!isFormOpen && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3 }}
          >
            <Header />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`container mx-auto px-4 sm:px-6 ${isFormOpen ? 'py-2 sm:py-4' : 'py-4 sm:py-8'}`}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <AnimatePresence>
        {!isFormOpen && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
          >
            <footer className="relative z-10 mt-auto border-t border-secondary-200 bg-white/80 backdrop-blur-sm">
              <div className="container mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-secondary-600">
                    © 2025 Arrighi Advogados. Todos os direitos reservados.
                  </div>
                  <div className="text-sm text-secondary-500">CRM v1.0</div>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
