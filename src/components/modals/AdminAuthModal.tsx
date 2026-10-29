import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, KeyRound, AlertCircle, X, ShieldCheck, Mail } from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const {
    adminAuthModalOpen,
    adminAuthDescription,
    closeAdminAuthModal,
    unlockAdmin,
    sendRecoveryEmail,
    config,
  } = useApp();

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adminAuthModalOpen) {
      setPin('');
      setError(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [adminAuthModalOpen]);

  if (!adminAuthModalOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) return;

    const success = unlockAdmin(pin);
    if (!success) {
      setError(true);
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 8) {
      const next = pin + num;
      setPin(next);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-[#1E1714] rounded-2xl shadow-2xl border border-[#3E2010]/15 dark:border-[#52301A] overflow-hidden">
        {/* Header */}
        <div className="bg-[#3E2010] text-[#FBF9F6] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#552D17] rounded-lg">
              <Lock className="w-4 h-4 text-[#E8C39E]" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm">Clave de Administrador</h3>
              <p className="text-[11px] text-[#D8B490]">Verificación requerida</p>
            </div>
          </div>
          <button
            onClick={closeAdminAuthModal}
            className="p-1 rounded-lg text-[#D8B490] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-xs text-[#5C3D2E] dark:text-[#C5A898] mb-4 text-center">
            Introduce la clave de administrador para {adminAuthDescription}.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input display */}
            <div className="relative">
              <input
                ref={inputRef}
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Ingresa PIN..."
                className={`w-full text-center tracking-[0.4em] font-mono text-xl py-3 px-4 bg-[#FBF9F6] dark:bg-[#2A1F1B] border rounded-xl outline-none transition-all ${
                  error
                    ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-950/20'
                    : 'border-[#3E2010]/20 dark:border-[#52301A] text-[#3E2010] dark:text-[#E8C39E] focus:border-[#3E2010] dark:focus:border-[#E8C39E] focus:ring-2 focus:ring-[#3E2010]/10'
                }`}
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Clave incorrecta. Inténtalo de nuevo.</span>
              </div>
            )}

            {/* Quick Numeric Keypad for Mobile / Fast Touch */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  type="button"
                  key={digit}
                  onClick={() => handleKeyPress(digit)}
                  className="py-2.5 text-sm font-semibold rounded-xl bg-[#F8F6F2] dark:bg-[#261C18] text-[#3E2010] dark:text-[#E8C39E] hover:bg-[#EFE9DF] dark:hover:bg-[#352520] active:scale-95 transition-transform border border-[#3E2010]/10 dark:border-[#422619]"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="py-2.5 text-xs font-medium rounded-xl bg-[#F8F6F2] dark:bg-[#261C18] text-[#8C6D58] hover:bg-[#EFE9DF] active:scale-95 transition-transform border border-[#3E2010]/10 dark:border-[#422619]"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="py-2.5 text-sm font-semibold rounded-xl bg-[#F8F6F2] dark:bg-[#261C18] text-[#3E2010] dark:text-[#E8C39E] hover:bg-[#EFE9DF] dark:hover:bg-[#352520] active:scale-95 transition-transform border border-[#3E2010]/10 dark:border-[#422619]"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-2.5 text-xs font-medium rounded-xl bg-[#F8F6F2] dark:bg-[#261C18] text-[#8C6D58] hover:bg-[#EFE9DF] active:scale-95 transition-transform border border-[#3E2010]/10 dark:border-[#422619]"
              >
                Borrar
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={closeAdminAuthModal}
                className="flex-1 py-2.5 px-4 text-xs font-medium text-[#6B4B38] dark:text-[#B59685] bg-[#F1ECE4] dark:bg-[#261C18] rounded-xl hover:bg-[#E7DFD4] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-[#3E2010] hover:bg-[#2C160B] active:scale-98 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Confirmar</span>
              </button>
            </div>

            {/* Email Recovery Button */}
            <div className="pt-2 border-t border-[#3E2010]/10 dark:border-[#3D251A] text-center space-y-1">
              <button
                type="button"
                onClick={() => sendRecoveryEmail()}
                className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:underline flex items-center justify-center gap-1.5 mx-auto"
              >
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>¿No te sabes el PIN? Enviar PIN asignado a mi correo</span>
              </button>
              <span className="text-[10px] text-[#8C6D58] block">
                Se enviará a: {config.emailAdmin || 'thewest201013@gmail.com'}
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
