"use client";

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { redirectToCheckout } from '@/lib/premium';
import { motion } from 'framer-motion';
import { Sparkles, Crown, Loader2 } from 'lucide-react';
import LoadingModal from '@/components/ui/LoadingModal';

interface PremiumGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PremiumGuard({ children, fallback }: PremiumGuardProps) {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);

  useEffect(() => {
    async function checkPremium() {
      const user = auth.currentUser;
      if (!user) {
        setIsPremium(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/check-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid }),
        });

        const data = await response.json();
        setIsPremium(data.isPremium === true);
      } catch (error) {
        console.error('Error checking premium:', error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    }

    checkPremium();

    // Revalidar quando o usuário mudar
    const unsubscribe = auth.onAuthStateChanged(() => {
      checkPremium();
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-[#888888]">Carregando...</div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      fallback || (
        <motion.div
          className="p-8 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'rgba(212, 255, 77, 0.1)' }}
            >
              <Crown size={32} style={{ color: '#D4FF4D' }} />
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ fontWeight: 700 }}>
              Recursos Premium
            </h2>
          </div>
          <p className="text-[#888888] mb-6" style={{ lineHeight: 1.6 }}>
            Esta funcionalidade está disponível apenas para assinantes Premium.
            Desbloqueie acesso completo a todas as ferramentas e recursos avançados.
          </p>
          <button
            onClick={async () => {
              setIsPreparingCheckout(true);
              await redirectToCheckout();
            }}
            disabled={isPreparingCheckout}
            className="px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2 w-full justify-center transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(90deg, #4DD4F7, #8B6FFF)",
              borderRadius: "8px"
            }}
          >
            {isPreparingCheckout ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Preparando...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Assinar Premium
              </>
            )}
          </button>
          
          <LoadingModal
            isOpen={isPreparingCheckout}
            message="Estamos preparando o link seguro para você"
          />
        </motion.div>
      )
    );
  }

  return <>{children}</>;
}

