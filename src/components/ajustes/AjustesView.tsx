import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  KeyRound,
  DollarSign,
  Download,
  Upload,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Check,
  AlertCircle,
  HelpCircle,
  Lock,
  Unlock,
  Mail,
  User,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

export const AjustesView: React.FC = () => {
  const {
    config,
    updateConfig,
    resetToDefaults,
    exportDatabaseJson,
    importDatabaseJson,
    isAdminUnlocked,
    unlockAdmin,
    lockAdmin,
    sendRecoveryEmail,
  } = useApp();

  // Estado para el gate de acceso por PIN si no está desbloqueado
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  // Estados de los campos de Ajustes
  const [nombreNegocio, setNombreNegocio] = useState(config.nombreNegocio);
  const [nombreUsuario, setNombreUsuario] = useState(config.nombreUsuario);
  const [emailAdmin, setEmailAdmin] = useState(config.emailAdmin || 'thewest201013@gmail.com');
  const [avatarUrl, setAvatarUrl] = useState(
    config.avatarUrl || '/src/assets/images/avatar_yulihanny_1792170727263.jpg'
  );
  const [monedaPrincipal, setMonedaPrincipal] = useState<'Bs' | '$'>(config.monedaPrincipal);
  const [tasaCambio, setTasaCambio] = useState<number>(config.tasaCambioBsUSD);
  const [nuevaClaveAdmin, setNuevaClaveAdmin] = useState(config.claveAdmin);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backupNotice, setBackupNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Avatares predefinidos
  const avatarPresets = [
    {
      label: 'Yulihanny / Chef Repostera',
      url: '/src/assets/images/avatar_yulihanny_1792170727263.jpg',
    },
    {
      label: 'Chef Pastelero Clásico',
      url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
    },
    {
      label: 'Maestra Panadera',
      url: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&auto=format&fit=crop&q=80',
    },
  ];

  // Si no está desbloqueado, mostrar pantalla de bloqueo solicitando PIN o envío al correo
  if (!isAdminUnlocked) {
    const handleUnlockSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!pinInput.trim()) return;

      const ok = unlockAdmin(pinInput);
      if (!ok) {
        setPinError(true);
      } else {
        setPinError(false);
      }
    };

    const handleSendRecoveryPin = () => {
      sendRecoveryEmail(config.emailAdmin);
      setEmailSentNotice(true);
      setPinError(false);
    };

    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-[#FBF9F6] dark:bg-[#150F0D]">
        <div className="max-w-md w-full bg-white dark:bg-[#1E1714] rounded-3xl shadow-2xl border border-[#3E2010]/20 dark:border-[#4A2F20] overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Top Lock Badge */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-[#F6EFE9] dark:bg-[#2C1F19] text-[#3E2010] dark:text-[#E8C39E] flex items-center justify-center mx-auto shadow-inner border border-[#3E2010]/15">
              <Lock className="w-8 h-8 text-[#592D16]" />
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#2C1810] dark:text-[#F1EAE4]">
              Ajustes Protegidos
            </h2>
            <p className="text-xs text-[#8C6D58] dark:text-[#A0816E] max-w-xs mx-auto leading-relaxed">
              Introduce el PIN de Administrador para cambiar el nombre, claves de seguridad, moneda o
              restaurar copias de seguridad.
            </p>
          </div>

          {/* Formulario de PIN */}
          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898] block text-center">
                PIN de Administrador:
              </label>
              <input
                type="password"
                maxLength={8}
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="••••"
                className={`w-full py-3 px-4 text-center tracking-[0.4em] font-mono text-2xl bg-[#FBF9F6] dark:bg-[#261C18] border rounded-2xl outline-none transition-all ${
                  pinError
                    ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-950/20'
                    : 'border-[#3E2010]/20 dark:border-[#52301A] text-[#2C1810] dark:text-[#F1EAE4] focus:border-[#3E2010]'
                }`}
              />
            </div>

            {pinError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-600 font-medium flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>PIN incorrecto. Inténtalo de nuevo o solicita un PIN a tu correo.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#3E2010] hover:bg-[#28150A] text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Desbloquear Ajustes</span>
            </button>
          </form>

          {/* Opción: Enviar PIN asignado al correo si no se lo sabe */}
          <div className="pt-4 border-t border-[#3E2010]/10 dark:border-[#332219] space-y-3">
            <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl border border-amber-200/70 dark:border-amber-900/40 text-center space-y-2">
              <span className="text-xs font-bold text-amber-950 dark:text-amber-200 block">
                ¿No te sabes el PIN de administrador?
              </span>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
                Podemos enviar un <strong>PIN asignado de recuperación</strong> directamente al correo
                registrado:
              </p>
              <div className="font-mono text-xs font-semibold text-amber-900 dark:text-amber-200 bg-white dark:bg-black/20 py-1.5 px-3 rounded-xl border border-amber-300/60 inline-block">
                {config.emailAdmin || 'thewest201013@gmail.com'}
              </div>
              <button
                type="button"
                onClick={handleSendRecoveryPin}
                className="w-full mt-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar PIN Asignado a mi Correo</span>
              </button>
            </div>

            {emailSentNotice && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 text-center font-medium flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" />
                ¡Correo enviado! Revisa la notificación arriba con tu PIN asignado.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VISTA DESBLOQUEADA DE AJUSTES
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      nombreNegocio,
      nombreUsuario,
      emailAdmin,
      avatarUrl,
      monedaPrincipal,
      tasaCambioBsUSD: tasaCambio,
      claveAdmin: nuevaClaveAdmin,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dulcegestion-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const success = importDatabaseJson(content);
        if (success) {
          alert('¡Copia de seguridad restaurada con éxito!');
        } else {
          alert('El archivo no tiene el formato JSON válido de DulceGestión.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#FBF9F6] dark:bg-[#150F0D]">
      {/* Header con botón para bloquear de inmediato */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3E2010]/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#2C1810] dark:text-[#F1EAE4]">
              Ajustes del Sistema
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
              <Unlock className="w-3.5 h-3.5" /> Sesión Desbloqueada
            </span>
          </div>
          <p className="text-xs text-[#8C6D58] dark:text-[#A0816E] mt-1">
            Configuración de administrador, nombre, correo de recuperación, monedas y base de datos.
          </p>
        </div>
        <button
          onClick={lockAdmin}
          className="px-3.5 py-2 rounded-xl bg-[#F1ECE4] dark:bg-[#2A1F1B] hover:bg-[#E5DDD2] text-[#5C3D2E] dark:text-[#C5A898] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          title="Bloquear Ajustes nuevamente"
        >
          <Lock className="w-3.5 h-3.5 text-amber-700" />
          <span>Bloquear Ajustes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Perfil del Administrador & Identidad (Prompt requirement) */}
        <form
          onSubmit={handleSaveGeneral}
          className="bg-white dark:bg-[#1E1613] p-6 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs space-y-4"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#3E2010]/10">
            <User className="w-4 h-4 text-[#3E2010] dark:text-[#E8C39E]" />
            <h3 className="font-display font-bold text-sm text-[#2C1810] dark:text-[#F1EAE4]">
              Perfil del Administrador & Seguridad
            </h3>
          </div>

          {/* Nombre del Administrador */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898] flex items-center justify-between">
              <span>Nombre del Administrador:</span>
              <span className="text-[10px] text-[#8C6D58] font-normal">Aparece en el menú y reportes</span>
            </label>
            <input
              type="text"
              required
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              placeholder="Ej: Yulihanny, Carlos, Maria..."
              className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-semibold text-[#2C1810] dark:text-[#F1EAE4] focus:outline-none focus:border-[#3E2010]"
            />
          </div>

          {/* Correo de Recuperación del Administrador */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-amber-700" />
                <span>Correo para Envío de PIN Asignado:</span>
              </span>
              <span className="text-[10px] text-[#8C6D58] font-normal">Para recuperar clave</span>
            </label>
            <input
              type="email"
              required
              value={emailAdmin}
              onChange={(e) => setEmailAdmin(e.target.value)}
              placeholder="thewest201013@gmail.com"
              className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-mono font-medium text-[#2C1810] dark:text-[#F1EAE4] focus:outline-none focus:border-[#3E2010]"
            />
          </div>

          {/* Clave / PIN de Administrador */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                <span>Clave / PIN de Administrador:</span>
              </span>
              <span className="text-[10px] text-[#8C6D58] font-normal">4 a 8 dígitos</span>
            </label>
            <input
              type="text"
              required
              value={nuevaClaveAdmin}
              onChange={(e) => setNuevaClaveAdmin(e.target.value)}
              placeholder="Ej: 1234"
              className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-mono font-bold text-[#2C1810] dark:text-[#F1EAE4] focus:outline-none focus:border-[#3E2010]"
            />
          </div>

          {/* Nombre de la Repostería */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
              Nombre del Negocio / Repostería:
            </label>
            <input
              type="text"
              value={nombreNegocio}
              onChange={(e) => setNombreNegocio(e.target.value)}
              className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-medium text-[#2C1810] dark:text-[#F1EAE4]"
            />
          </div>

          {/* Selector de Avatar */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898] flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Foto de Perfil del Administrador:</span>
            </label>
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl}
                alt={nombreUsuario}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#3E2010]/20 shrink-0"
              />
              <div className="flex-1 space-y-1">
                <select
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full py-1.5 px-2 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-lg text-xs"
                >
                  {avatarPresets.map((preset, idx) => (
                    <option key={idx} value={preset.url}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="O pega URL de imagen personalizada..."
                  className="w-full py-1 px-2 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-lg text-[10px] font-mono text-[#8C6D58]"
                />
              </div>
            </div>
          </div>

          {/* Moneda y Tasa */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                Moneda Principal:
              </label>
              <select
                value={monedaPrincipal}
                onChange={(e) => setMonedaPrincipal(e.target.value as 'Bs' | '$')}
                className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-medium"
              >
                <option value="Bs">Bolívares (Bs)</option>
                <option value="$">Dólares ($)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                Tasa de Cambio (Bs por 1 $):
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={tasaCambio}
                onChange={(e) => setTasaCambio(parseFloat(e.target.value) || 40)}
                className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-mono font-medium"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-4 h-4" /> ¡Ajustes guardados correctamente!
              </span>
            ) : (
              <span className="text-[11px] text-[#8C6D58]">
                Los cambios se aplican de inmediato en toda la app
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#3E2010] text-white rounded-xl text-xs font-semibold hover:bg-[#28150A] transition-all shadow-xs"
            >
              Guardar Ajustes
            </button>
          </div>
        </form>

        {/* Respaldo de Datos & APK */}
        <div className="space-y-6">
          {/* Backup Box */}
          <div className="bg-white dark:bg-[#1E1613] p-6 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#3E2010]/10">
              <Download className="w-4 h-4 text-[#3E2010] dark:text-[#E8C39E]" />
              <h3 className="font-display font-bold text-sm text-[#2C1810] dark:text-[#F1EAE4]">
                Copia de Seguridad & Base de Datos
              </h3>
            </div>
            <p className="text-xs text-[#8C6D58]">
              Exporta todos tus insumos, recetas, lotes horneados y ventas en un archivo JSON para
              respaldar o transferir a otro dispositivo o teléfono.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center gap-1.5 py-2 px-3.5 bg-[#F1ECE4] dark:bg-[#2A1F1B] text-[#3E2010] dark:text-[#E8C39E] rounded-xl text-xs font-semibold hover:bg-[#E7DFD4]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Copia JSON</span>
              </button>

              <label className="flex items-center gap-1.5 py-2 px-3.5 bg-[#F1ECE4] dark:bg-[#2A1F1B] text-[#3E2010] dark:text-[#E8C39E] rounded-xl text-xs font-semibold hover:bg-[#E7DFD4] cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Restaurar Archivo</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Restablecer los datos a los valores de fábrica? Se perderán los cambios locales.')) {
                    resetToDefaults();
                    alert('Datos restablecidos.');
                  }
                }}
                className="flex items-center gap-1.5 py-2 px-3.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reiniciar Demo</span>
              </button>
            </div>
          </div>

          {/* Mobile & Desktop APK Info */}
          <div className="bg-white dark:bg-[#1E1613] p-6 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#3E2010]/10">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <h3 className="font-display font-bold text-sm text-[#2C1810] dark:text-[#F1EAE4]">
                Compatibilidad APK & Teléfono
              </h3>
            </div>
            <p className="text-xs text-[#8C6D58] leading-relaxed">
              DulceGestión cuenta con arquitectura responsive y PWA (Progressive Web App). Puedes instalarla
              directamente desde el navegador de tu teléfono móvil seleccionando <strong>"Agregar a la pantalla principal"</strong> para usarla como una aplicación nativa (APK) o abrirla desde cualquier computadora.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
