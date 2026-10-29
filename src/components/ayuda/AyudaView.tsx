import React from 'react';
import { HelpCircle, ShieldCheck, Flame, Boxes, Users, ClipboardList, Smartphone } from 'lucide-react';

export const AyudaView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#FBF9F6] dark:bg-[#150F0D]">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#2C1810] dark:text-[#F1EAE4]">
          Guía de Uso de DulceGestión
        </h1>
        <p className="text-xs text-[#8C6D58] dark:text-[#A0816E] mt-1">
          Aprende el flujo de trabajo de repostería: insumos, recetas, horneado y control de ventas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1 */}
        <div className="bg-white dark:bg-[#1E1613] p-5 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#3E2010] text-[#FBF9F6] text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="font-display font-bold text-sm text-[#2C1810] dark:text-[#F1EAE4]">
              Inventario de Insumos
            </h3>
          </div>
          <p className="text-xs text-[#5C3D2E] dark:text-[#C5A898] leading-relaxed">
            Registra tu materia prima (harina, azúcar, mantequilla, huevos, vainilla, etc.) con su
            costo, cantidad comprada, tipo de unidad (kg, gr, lt, ml) y fecha de caducidad.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white dark:bg-[#1E1613] p-5 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#3E2010] text-[#FBF9F6] text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="font-display font-bold text-sm text-[#2C1810] dark:text-[#F1EAE4]">
              El Recetario
            </h3>
          </div>
          <p className="text-xs text-[#5C3D2E] dark:text-[#C5A898] leading-relaxed">
            Crea recetas vinculadas directamente con tus insumos de inventario. Especifica tiempo de
            elaboración, categoría y precio de venta recomendado.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white dark:bg-[#1E1613] p-5 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#3E2010] text-[#FBF9F6] text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="font-display font-bold text-sm text-[#2C1810] dark:text-[#F1EAE4]">
              Hornear / Elaborar Lote
            </h3>
          </div>
          <p className="text-xs text-[#5C3D2E] dark:text-[#C5A898] leading-relaxed">
            Al hornear, especifica exactamente cuántas unidades salieron. El sistema descuenta en
            tiempo real los insumos del inventario, calcula el costo total en $ y Bs, y envía el lote
            a Ventas.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-white dark:bg-[#1E1613] p-5 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#3E2010] text-[#FBF9F6] text-xs font-bold flex items-center justify-center">
              4
            </span>
            <h3 className="font-display font-bold text-sm text-[#2C1810] dark:text-[#F1EAE4]">
              Ventas & Control de Fiado
            </h3>
          </div>
          <p className="text-xs text-[#5C3D2E] dark:text-[#C5A898] leading-relaxed">
            Registra a qué cliente le vendiste, método de pago, referencia bancaria y si quedó
            pagado, sin pagar o con pago parcial. El sistema calcula automáticamente la deuda del
            cliente.
          </p>
        </div>
      </div>

      {/* Admin PIN Info box */}
      <div className="bg-[#FFF8F0] dark:bg-[#251A14] p-5 rounded-2xl border border-[#E8C39E] dark:border-[#4B2F1F] space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#8C4A27]" />
          <h3 className="font-display font-bold text-sm text-[#3E2010] dark:text-[#F1EAE4]">
            Clave de Administrador
          </h3>
        </div>
        <p className="text-xs text-[#5C3D2E] dark:text-[#C5A898] leading-relaxed">
          No necesitas iniciar sesión para consultar el sistema o explorar recetas e inventario, pero
          para registrar ventas, hornear o modificar cualquier dato, se te solicitará el PIN de
          administrador (clave por defecto: <strong className="font-mono text-[#3E2010] dark:text-[#E8C39E]">1234</strong>). Puedes cambiarla en cualquier momento desde <strong>Ajustes</strong>.
        </p>
      </div>
    </div>
  );
};
