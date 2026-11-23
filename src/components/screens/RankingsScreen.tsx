import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RANKING_DATA } from '../../data/mockOperations';

type Period = 'semana' | 'mes' | 'trimestre';

export const RankingsScreen: React.FC = () => {
  const { currentUser, navigate, capabilities } = useApp();
  const [period, setPeriod] = useState<Period>('semana');
  const [regionFilter, setRegionFilter] = useState<string>('todas');

  const rows = useMemo(() => {
    const base = RANKING_DATA[period];
    if (regionFilter === 'todas') return base;
    return base.filter((r) => r.region === regionFilter);
  }, [period, regionFilter]);

  const regions = useMemo(() => {
    const set = new Set(RANKING_DATA.semana.map((r) => r.region));
    return Array.from(set);
  }, []);

  const avgOnTime = useMemo(() => {
    if (!rows.length) return 0;
    return Math.round(rows.reduce((acc, r) => acc + r.onTimeRate, 0) / rows.length);
  }, [rows]);

  const totalCompleted = useMemo(
    () => rows.reduce((acc, r) => acc + r.completedCount, 0),
    [rows]
  );

  return (
    <div className="space-y-5">
      {/* Header + Period Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#24272D] dark:text-[#F3F4F6]">
            Desempenho entre Unidades
          </h2>
          <p className="hidden sm:block text-xs text-[#6B7280] dark:text-[#8B93A1]">
            Indicadores operacionais fictícios por período (prazo, conferência e volume concluído).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 liquid-glass-segment rounded-xl">
            {(
              [
                { id: 'semana', label: '7 dias' },
                { id: 'mes', label: '30 dias' },
                { id: 'trimestre', label: 'Trimestre' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  period === p.id
                    ? 'bg-white dark:bg-[#1F2531] text-[#24272D] dark:text-[#F3F4F6] font-semibold shadow-xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'text-[#6B7280] dark:text-[#8B93A1] hover:text-[#24272D] dark:hover:text-[#F3F4F6]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <select
            aria-label="Filtrar regional"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] text-xs text-[#24272D] dark:text-[#F3F4F6]"
          >
            <option value="todas">Todas as regionais</option>
            {regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Period Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08]">
          <div className="text-xs text-[#6B7280] dark:text-[#8B93A1]">Média no prazo</div>
          <div className="mt-1 text-xl font-bold font-mono-num text-[#24272D] dark:text-[#F3F4F6]">
            {avgOnTime}%
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08]">
          <div className="text-xs text-[#6B7280] dark:text-[#8B93A1]">Concluídas no período</div>
          <div className="mt-1 text-xl font-bold font-mono-num text-[#24272D] dark:text-[#F3F4F6]">
            {totalCompleted}
          </div>
        </div>
        <div className="hidden sm:flex col-span-1 p-3.5 rounded-2xl bg-[#FFF1F2] dark:bg-[#E1434F]/[0.1] border border-[#FECDD3] dark:border-[#E1434F]/30 items-center justify-between">
          <div>
            <div className="text-xs text-[#B91F2C] dark:text-[#FCA5A5]">Unidade líder</div>
            <div className="mt-0.5 text-sm font-bold text-[#24272D] dark:text-[#F3F4F6]">
              {rows[0]?.storeCode} · {rows[0]?.onTimeRate}% no prazo
            </div>
          </div>
          {capabilities.canManageStores && (
            <button
              type="button"
              onClick={() => navigate('stores')}
              className="text-xs font-semibold text-[#B91F2C] dark:text-[#FCA5A5] underline"
            >
              Ver lojas
            </button>
          )}
        </div>
      </div>

      {/* Visual Horizontal Bar Comparison (Clean Operational Chart) */}
      <section className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-4 sm:p-5">
        <h3 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-3.5">
          Cumprimento de prazo por loja (%)
        </h3>
        <div className="space-y-3">
          {rows.map((row, idx) => {
            const isUserStore = currentUser.storeId === row.storeId;
            return (
              <div key={row.storeId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono-num text-[11px] font-semibold text-[#6B7280] dark:text-[#8B93A1] w-5">
                      #{idx + 1}
                    </span>
                    <span
                      className={`truncate ${
                        isUserStore
                          ? 'font-bold text-[#D52E3A] dark:text-[#FCA5A5]'
                          : 'font-medium text-[#24272D] dark:text-[#F3F4F6]'
                      }`}
                    >
                      {row.storeCode} — {row.storeName}
                      {isUserStore ? ' (Sua loja)' : ''}
                    </span>
                  </div>
                  <span className="font-mono-num font-semibold text-[#24272D] dark:text-[#F3F4F6] shrink-0">
                    {row.onTimeRate}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#F3F4F6] dark:bg-white/[0.07] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUserStore || idx === 0
                        ? 'bg-[#D52E3A] dark:bg-[#E1434F]'
                        : 'bg-[#AEB0B3] dark:bg-[#6B7280]'
                    }`}
                    style={{ width: `${row.onTimeRate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detailed Comparison Table (tablet/desktop) */}
      <div className="hidden md:block bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] dark:border-white/[0.08] bg-[#F7F8FA] dark:bg-[#161A23] text-[11px] font-semibold text-[#6B7280] dark:text-[#8B93A1]">
              <th className="py-2.5 px-4">Pos.</th>
              <th className="py-2.5 px-3">Unidade</th>
              <th className="py-2.5 px-3 text-right">Concluídas</th>
              <th className="py-2.5 px-3 text-right">No prazo</th>
              <th className="py-2.5 px-3 text-right">Aprovação 1ª vez</th>
              <th className="py-2.5 px-4 text-right">Tempo médio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06] text-xs">
            {rows.map((row, idx) => {
              const isUserStore = currentUser.storeId === row.storeId;
              return (
                <tr
                  key={row.storeId}
                  className={
                    isUserStore ? 'bg-[#FFF1F2]/50 dark:bg-[#E1434F]/[0.09]' : 'hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03]'
                  }
                >
                  <td className="py-3 px-4 font-mono-num font-semibold">
                    <div className="inline-flex items-center gap-1.5">
                      <span>{idx + 1}º</span>
                      {row.deltaPosition > 0 ? (
                        <ArrowUp className="w-3 h-3 text-[#15803D] dark:text-[#4ADE80]" aria-label="Subiu" />
                      ) : row.deltaPosition < 0 ? (
                        <ArrowDown className="w-3 h-3 text-[#B91F2C] dark:text-[#F87171]" aria-label="Caiu" />
                      ) : (
                        <Minus className="w-3 h-3 text-[#AEB0B3] dark:text-[#6B7280]" aria-label="Estável" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                      {row.storeCode} · {row.storeName}
                    </div>
                    <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                      {row.region}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono-num">{row.completedCount}</td>
                  <td className="py-3 px-3 text-right font-mono-num font-semibold">
                    {row.onTimeRate}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono-num">
                    {row.firstPassApprovalRate}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num text-[#6B7280] dark:text-[#8B93A1]">
                    {row.avgResponseHours.toFixed(1)}h
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
