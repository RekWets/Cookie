import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { usePWAInstall } from '../../utils/usePWAInstall';
import confetti from 'canvas-confetti';
import {
  Download,
  Upload,
  Monitor,
  Copy,
  Check,
  Laptop,
  HardDriveDownload,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Sparkles,
  HelpCircle,
  FileCode,
  ShieldCheck,
  X,
  Share2,
} from 'lucide-react';

interface ExportCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportCloneModal: React.FC<ExportCloneModalProps> = ({ isOpen, onClose }) => {
  const {
    config,
    insumos,
    recetas,
    lotes,
    ventas,
    clientes,
    exportDatabaseJson,
    importDatabaseJson,
  } = useApp();

  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<'exportar' | 'restaurar' | 'escritorio'>('exportar');
  const [copiedJson, setCopiedJson] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Import state
  const [importJsonText, setImportJsonText] = useState('');
  const [importPreview, setImportPreview] = useState<any | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Build full payload with versioning & metadata
  const generateFullBackupPayload = () => {
    return {
      appName: 'DulceGestión - Repostería & Inventario',
      softwareVersion: '2.4.0',
      systemType: 'Desktop & PWA Multi-Device',
      exportDate: new Date().toISOString(),
      exportFormattedDate: new Date().toLocaleString('es-ES', {
        dateStyle: 'full',
        timeStyle: 'medium',
      }),
      summary: {
        totalInsumos: insumos.length,
        totalRecetas: recetas.length,
        totalLotes: lotes.length,
        totalVentas: ventas.length,
        totalClientes: clientes.length,
        negocio: config.nombreNegocio,
        usuario: config.nombreUsuario,
        tasaCambioBsUSD: config.tasaCambioBsUSD,
      },
      database: {
        config,
        insumos,
        recetas,
        lotes,
        ventas,
        clientes,
      },
    };
  };

  // Download complete .json backup file
  const handleDownloadBackup = () => {
    const payload = generateFullBackupPayload();
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toTimeString().slice(0, 5).replace(':', '-');
    const safeNegocio = (config.nombreNegocio || 'DulceGestion')
      .replace(/[^a-zA-Z0-9_-]/g, '_');

    const link = document.createElement('a');
    link.href = url;
    link.download = `DulceGestion_BD_CopiaSeguridad_${safeNegocio}_${dateStr}_${timeStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  // Copy JSON text
  const handleCopyJson = () => {
    const payload = generateFullBackupPayload();
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  // Process and inspect backup file or text
  const inspectAndValidateJson = (content: string) => {
    try {
      setImportError(null);
      const parsed = JSON.parse(content);

      // Support both new v2 payload and legacy direct format
      const targetDb = parsed.database ? parsed.database : parsed;

      if (!targetDb.insumos || !targetDb.recetas || !targetDb.lotes) {
        throw new Error('El archivo no parece ser una copia válida de DulceGestión (faltan tablas clave).');
      }

      setImportPreview({
        raw: targetDb,
        date: parsed.exportFormattedDate || parsed.exportDate || 'Fecha no especificada',
        negocio: targetDb.config?.nombreNegocio || 'Repostería',
        usuario: targetDb.config?.nombreUsuario || 'Usuario',
        insumosCount: targetDb.insumos?.length || 0,
        recetasCount: targetDb.recetas?.length || 0,
        lotesCount: targetDb.lotes?.length || 0,
        ventasCount: targetDb.ventas?.length || 0,
        clientesCount: targetDb.clientes?.length || 0,
        tasa: targetDb.config?.tasaCambioBsUSD || 40,
      });
    } catch (err: any) {
      setImportPreview(null);
      setImportError(err.message || 'Formato de archivo inválido. Debe ser un JSON válido.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportJsonText(text);
      inspectAndValidateJson(text);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;

    const success = importDatabaseJson(JSON.stringify(importPreview.raw));
    if (success) {
      setImportSuccess(true);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      });
      setTimeout(() => {
        setImportSuccess(false);
        onClose();
      }, 2000);
    } else {
      setImportError('Error al guardar los datos en el sistema.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1A120E] rounded-3xl shadow-2xl border border-[#3E2010]/20 dark:border-[#42291C] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#F8F6F2] dark:bg-[#231813] border-b border-[#3E2010]/10 dark:border-[#38261E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3E2010] text-[#F59E0B] flex items-center justify-center shadow-md">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-[#2C1810] dark:text-[#F1EAE4] flex items-center gap-2">
                <span>Copia y Clonación de Programa</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-full">
                  Multiequipo
                </span>
              </h2>
              <p className="text-xs text-[#8C6D58] dark:text-[#A88B77]">
                Exporta tu sistema completo o instálalo como programa de escritorio en varias computadoras.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8C6D58] hover:text-[#2C1810] dark:hover:text-[#F1EAE4] hover:bg-[#EAE4DC] dark:hover:bg-[#2D1F19] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#3E2010]/10 dark:border-[#38261E] bg-[#FAF8F5] dark:bg-[#1F1511] px-4 sm:px-6 pt-2">
          <button
            onClick={() => setActiveTab('exportar')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'exportar'
                ? 'border-[#3E2010] dark:border-[#F59E0B] text-[#3E2010] dark:text-[#F59E0B]'
                : 'border-transparent text-[#8C6D58] hover:text-[#3E2010] dark:hover:text-[#F1EAE4]'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>1. Exportar Copia Exacta</span>
          </button>

          <button
            onClick={() => setActiveTab('restaurar')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'restaurar'
                ? 'border-[#3E2010] dark:border-[#F59E0B] text-[#3E2010] dark:text-[#F59E0B]'
                : 'border-transparent text-[#8C6D58] hover:text-[#3E2010] dark:hover:text-[#F1EAE4]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>2. Colocar en Otra PC (Importar)</span>
          </button>

          <button
            onClick={() => setActiveTab('escritorio')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'escritorio'
                ? 'border-[#3E2010] dark:border-[#F59E0B] text-[#3E2010] dark:text-[#F59E0B]'
                : 'border-transparent text-[#8C6D58] hover:text-[#3E2010] dark:hover:text-[#F1EAE4]'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>¿Por qué tipo web? (Modo Escritorio)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: EXPORTAR */}
          {activeTab === 'exportar' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF5EE] to-[#F1ECE4] dark:from-[#261C18] dark:to-[#1E1613] border border-[#3E2010]/15 dark:border-[#38261E] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C3D2E] dark:text-[#C5A898] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Respaldo Total Garantizado
                  </span>
                  <span className="text-[11px] font-mono text-[#8C6D58]">
                    {new Date().toLocaleDateString('es-ES')}
                  </span>
                </div>
                <p className="text-xs text-[#5C3D2E] dark:text-[#C5A898] leading-relaxed">
                  Este botón genera una <strong>copia espejo exacta</strong> que contiene el 100% de tus datos:
                  insumos, recetas, cantidades en stock, ventas, clientes, saldos pendientes y ajustes del negocio.
                </p>

                {/* Data preview metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#18110D] border border-[#3E2010]/10 text-center">
                    <span className="block text-[10px] text-[#8C6D58] font-medium">Insumos</span>
                    <strong className="text-sm font-mono text-[#3E2010] dark:text-[#E8C39E]">
                      {insumos.length}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#18110D] border border-[#3E2010]/10 text-center">
                    <span className="block text-[10px] text-[#8C6D58] font-medium">Recetas</span>
                    <strong className="text-sm font-mono text-[#3E2010] dark:text-[#E8C39E]">
                      {recetas.length}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#18110D] border border-[#3E2010]/10 text-center">
                    <span className="block text-[10px] text-[#8C6D58] font-medium">Lotes Activos</span>
                    <strong className="text-sm font-mono text-[#3E2010] dark:text-[#E8C39E]">
                      {lotes.length}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#18110D] border border-[#3E2010]/10 text-center">
                    <span className="block text-[10px] text-[#8C6D58] font-medium">Ventas</span>
                    <strong className="text-sm font-mono text-[#3E2010] dark:text-[#E8C39E]">
                      {ventas.length}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#18110D] border border-[#3E2010]/10 text-center col-span-2 sm:col-span-1">
                    <span className="block text-[10px] text-[#8C6D58] font-medium">Clientes</span>
                    <strong className="text-sm font-mono text-[#3E2010] dark:text-[#E8C39E]">
                      {clientes.length}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#3E2010] hover:bg-[#2A160B] active:scale-98 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2.5"
                >
                  <HardDriveDownload className="w-5 h-5 text-amber-400" />
                  <span>Descargar Archivo de Base de Datos (.JSON)</span>
                </button>

                {downloadSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>¡Copia de seguridad descargada exitosamente en tu carpeta de Descargas! Puedes guardarla en una memoria USB o enviarla por correo.</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#F1ECE4] dark:bg-[#251A15] hover:bg-[#E6DFD4] text-[#3E2010] dark:text-[#E8C39E] font-medium text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>¡Texto JSON copiado al portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar datos como texto (para enviar por WhatsApp)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Multi-computer steps callout */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  ¿Cómo pasar esta copia a otra computadora?
                </h4>
                <ol className="text-xs text-amber-900/90 dark:text-amber-300/90 list-decimal list-inside space-y-1 pl-1">
                  <li>Haz clic en <strong>Descargar Archivo (.JSON)</strong> y guárdalo en un pendrive USB o envíalo por WhatsApp/Correo.</li>
                  <li>Abre DulceGestión en la otra computadora (desde el navegador o la aplicación instalada).</li>
                  <li>Ve a la pestaña <strong>"2. Colocar en Otra PC (Importar)"</strong> y selecciona este archivo.</li>
                  <li>¡Todo tu inventario, recetas y ventas aparecerán al instante en la otra máquina!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: RESTAURAR EN OTRA PC */}
          {activeTab === 'restaurar' && (
            <div className="space-y-4">
              <div className="text-xs text-[#5C3D2E] dark:text-[#C5A898] leading-relaxed">
                Selecciona el archivo <strong>.JSON</strong> generado desde la otra computadora para cargar
                exactamente todos los datos en este equipo.
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#3E2010]/25 dark:border-[#52301A] hover:border-[#3E2010] dark:hover:border-[#E8C39E] rounded-2xl p-6 text-center cursor-pointer bg-[#FDFBF7] dark:bg-[#1E1511] transition-all space-y-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-[#78350F] dark:text-amber-300 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                  Haz clic aquí para seleccionar el archivo de copia (.json)
                </div>
                <p className="text-[11px] text-[#8C6D58] dark:text-[#A0816E]">
                  o arrastra el archivo directamente a esta ventana
                </p>
              </div>

              {/* Manual paste option */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898] flex items-center justify-between">
                  <span>O pega el texto JSON de la copia directamente:</span>
                  {importJsonText && (
                    <button
                      type="button"
                      onClick={() => {
                        setImportJsonText('');
                        setImportPreview(null);
                        setImportError(null);
                      }}
                      className="text-[10px] text-red-600 hover:underline"
                    >
                      Limpiar
                    </button>
                  )}
                </label>
                <textarea
                  rows={3}
                  value={importJsonText}
                  onChange={(e) => {
                    setImportJsonText(e.target.value);
                    if (e.target.value.trim()) {
                      inspectAndValidateJson(e.target.value);
                    } else {
                      setImportPreview(null);
                      setImportError(null);
                    }
                  }}
                  placeholder='Pega aquí el contenido JSON si te lo enviaste por WhatsApp o correo...'
                  className="w-full p-2.5 text-xs font-mono bg-[#FBF9F6] dark:bg-[#251A15] border border-[#3E2010]/15 rounded-xl outline-none focus:border-[#3E2010]"
                />
              </div>

              {/* Error warning */}
              {importError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Preview card before confirming */}
              {importPreview && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Copia detectada y lista para cargar
                    </span>
                    <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300">
                      {importPreview.negocio}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-white/80 dark:bg-[#161F18] rounded-lg">
                      <span className="block text-[10px] text-emerald-700">Insumos</span>
                      <strong>{importPreview.insumosCount}</strong>
                    </div>
                    <div className="p-2 bg-white/80 dark:bg-[#161F18] rounded-lg">
                      <span className="block text-[10px] text-emerald-700">Recetas</span>
                      <strong>{importPreview.recetasCount}</strong>
                    </div>
                    <div className="p-2 bg-white/80 dark:bg-[#161F18] rounded-lg">
                      <span className="block text-[10px] text-emerald-700">Lotes</span>
                      <strong>{importPreview.lotesCount}</strong>
                    </div>
                    <div className="p-2 bg-white/80 dark:bg-[#161F18] rounded-lg">
                      <span className="block text-[10px] text-emerald-700">Ventas</span>
                      <strong>{importPreview.ventasCount}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Confirmar e Importar Todos los Datos en Esta Computadora</span>
                  </button>
                </div>
              )}

              {importSuccess && (
                <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-semibold text-center animate-in zoom-in-95">
                  ¡Datos restaurados con éxito! El sistema está completamente actualizado.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: POR QUÉ TIPO WEB & MODO ESCRITORIO */}
          {activeTab === 'escritorio' && (
            <div className="space-y-4">
              {/* Explanation Card */}
              <div className="p-4 rounded-2xl bg-[#F8F6F2] dark:bg-[#221814] border border-[#3E2010]/15 dark:border-[#38261E] space-y-2.5">
                <h3 className="font-display font-bold text-sm text-[#2C1810] dark:text-[#F1EAE4] flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-amber-600" />
                  ¿Por qué se muestra en el navegador si es un sistema de escritorio?
                </h3>
                <p className="text-xs text-[#5C3D2E] dark:text-[#C5A898] leading-relaxed">
                  DulceGestión está desarrollado como una <strong>Aplicación Web Progresiva (PWA de Escritorio)</strong>.
                  La primera vez que entras mediante el enlace web se carga en tu navegador para que no necesites descargar pesados instaladores .EXE ni lidiar con permisos de administrador de Windows.
                </p>
                <p className="text-xs text-[#5C3D2E] dark:text-[#C5A898] leading-relaxed">
                  Sin embargo, <strong>puedes convertirla en una aplicación de escritorio nativa en 1 solo clic</strong>:
                </p>

                {/* Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#18110D] border border-[#3E2010]/10 text-xs space-y-1">
                    <strong className="text-[#3E2010] dark:text-[#E8C39E] block">🖥️ Ventana Propia</strong>
                    <span className="text-[11px] text-[#8C6D58]">
                      Se abre como programa independiente sin barra de direcciones ni pestañas de navegador.
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#18110D] border border-[#3E2010]/10 text-xs space-y-1">
                    <strong className="text-[#3E2010] dark:text-[#E8C39E] block">📌 Icono de Escritorio</strong>
                    <span className="text-[11px] text-[#8C6D58]">
                      Crea su acceso directo en el escritorio y en la barra de tareas de Windows o Mac.
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#18110D] border border-[#3E2010]/10 text-xs space-y-1">
                    <strong className="text-[#3E2010] dark:text-[#E8C39E] block">⚡ 100% Sin Internet</strong>
                    <span className="text-[11px] text-[#8C6D58]">
                      Guarda datos localmente en el disco duro y funciona incluso si no hay conexión a internet.
                    </span>
                  </div>
                </div>
              </div>

              {/* PWA Install Button or Guide */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-600 to-[#78350F] text-white shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <h4 className="font-display font-bold text-sm">
                      Instalar DulceGestión en esta Computadora
                    </h4>
                  </div>
                  {isInstalled && (
                    <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full">
                      ¡Ya Instalada!
                    </span>
                  )}
                </div>

                <p className="text-xs text-amber-100 leading-relaxed">
                  Haz clic en el botón de abajo para instalarla inmediatamente en Windows, Mac o Linux.
                </p>

                {isInstallable ? (
                  <button
                    type="button"
                    onClick={install}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-amber-50 text-[#3E2010] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Monitor className="w-4 h-4 text-[#78350F]" />
                    <span>Instalar Aplicación en la Computadora Ahora</span>
                  </button>
                ) : isInstalled ? (
                  <div className="p-2.5 rounded-xl bg-white/20 text-xs text-center font-medium">
                    ✓ La aplicación ya está instalada en tu sistema. Puedes buscar "DulceGestión" en tu menú de inicio o escritorio.
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-black/20 text-xs text-amber-100 space-y-2">
                    <strong className="block text-white">Instrucciones directas para tu navegador:</strong>
                    <div className="space-y-1 text-[11px]">
                      <div>
                        • <strong>Google Chrome:</strong> Haz clic en el icono <strong>⊕ (Instalar aplicación)</strong> en la parte derecha de la barra de direcciones superior, o en los 3 puntos ⋮ &gt; <em>"Guardar y compartir" &gt; "Instalar DulceGestión"</em>.
                      </div>
                      <div>
                        • <strong>Microsoft Edge:</strong> Haz clic en el icono de ventana con <strong>+</strong> al lado de la estrella de favoritos, o en los 3 puntos &gt; <em>"Aplicaciones" &gt; "Instalar este sitio como aplicación"</em>.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 bg-[#F8F6F2] dark:bg-[#231813] border-t border-[#3E2010]/10 dark:border-[#38261E] flex items-center justify-between">
          <span className="text-[11px] text-[#8C6D58] dark:text-[#A0816E]">
            DulceGestión v2.4 • Base de Datos Portátil
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3E2010] hover:bg-[#28150A] text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
