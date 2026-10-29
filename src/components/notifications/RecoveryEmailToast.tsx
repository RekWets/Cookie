import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Check, X, KeyRound, Copy, ShieldAlert, Sparkles } from 'lucide-react';

export const RecoveryEmailToast: React.FC = () => {
  const { recoveryEmailNotification, dismissRecoveryNotification, unlockAdmin } = useApp();
  const [copied, setCopied] = useState(false);

  if (!recoveryEmailNotification) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(recoveryEmailNotification.pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleQuickUnlock = () => {
    unlockAdmin(recoveryEmailNotification.pin);
    dismissRecoveryNotification();
  };

  return (
    <div className="fixed top-4 right-4 z-60 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-[#2C1810] text-[#FBF9F6] rounded-2xl shadow-2xl border-2 border-amber-500/40 p-4 space-y-3 ring-4 ring-amber-500/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Bandeja de Entrada • Mensaje Simulado
              </span>
              <h4 className="font-display font-bold text-sm text-white">
                PIN Asignado de Administrador
              </h4>
            </div>
          </div>
          <button
            onClick={dismissRecoveryNotification}
            className="p-1 rounded-lg text-amber-200/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-black/30 rounded-xl space-y-1.5 border border-white/10 text-xs">
          <div className="flex items-center justify-between text-[11px] text-amber-200/80">
            <span>Para: <strong className="text-white font-mono">{recoveryEmailNotification.to}</strong></span>
            <span>{recoveryEmailNotification.timestamp}</span>
          </div>
          <p className="text-[#D8C7BC] text-[11px] leading-relaxed">
            Se ha solicitado el PIN para el acceso administrativo. Tu PIN asignado de recuperación es:
          </p>
          <div className="flex items-center justify-between p-2.5 bg-amber-500/15 rounded-lg border border-amber-500/30">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xl font-bold tracking-widest text-amber-300">
                {recoveryEmailNotification.pin}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="py-1 px-2.5 rounded-lg bg-amber-500 text-[#2C1810] font-semibold text-xs hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[10px] text-amber-200/70">
            Introduce este PIN en la casilla de verificación.
          </span>
          <button
            onClick={handleQuickUnlock}
            className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ingresar Ahora</span>
          </button>
        </div>
      </div>
    </div>
  );
};
