import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Award,
  Calendar,
  ExternalLink,
  Minus,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CHAMPIONSHIP_CYCLES } from '../../data/championshipData';
import { ChampionshipCycleId } from '../../types/operations';

export const CampeonatoScreen: React.FC = () => {
  const { currentUser, openTaskDetail } = useApp();

  const [cycleId, setCycleId] = useState<ChampionshipCycleId>('novembro_2026');
  const [regionFilter, setRegionFilter] = useState<string>('todas');
  const [inspectedStoreId, setInspectedStoreId] = useState<string>(
    currentUser.storeId || 'st-04'
  );

  const cycle = CHAMPIONSHIP_CYCLES[cycleId];

  const regions = useMemo(() => {
    return Array.from(new Set(cycle.standings.map((s) => s.region)));
  }, [cycle]);

  const filteredStandings = useMemo(() => {
    if (regionFilter === 'todas') return cycle.standings;
    return cycle.standings.filter((s) => s.region === regionFilter);
  }, [cycle, regionFilter]);

  const topThree = useMemo(() => {
    return cycle.standings.slice(0, 3);
  }, [cycle]);

  const userStandingIndex = useMemo(() => {
    const targetId = currentUser.storeId || cycle.standings[0]?.storeId;
    return cycle.standings.findIndex((s) => s.storeId === targetId);
  }, [cycle, currentUser.storeId]);

  const highlightStanding =
    cycle.standings[userStandingIndex >= 0 ? userStandingIndex : 0] || cycle.standings[0];

  const inspectedStanding =
    cycle.standings.find((s) => s.storeId === inspectedStoreId) || highlightStanding;

  const inspectedPosition =
    cycle.standings.findIndex((s) => s.storeId === inspectedStanding.storeId) + 1;

  const storeEvents = useMemo(() => {
    const direct = cycle.events.filter((e) => e.storeId === inspectedStanding.storeId);
    if (direct.length > 0) return direct;
    return [
      {
        id: `fallback-${inspectedStanding.storeId}`,
        storeId: inspectedStanding.storeId,
        title: `Consolidação semanal — ${inspectedStanding.completedTasks} atividades concluídas`,
        category: 'Desempenho operacional',
        pointsDelta: inspectedStanding.weeklyDeltaPoints || 120,
        occurredAt: 'Neste ciclo',
      },
    ];
  }, [cycle.events, inspectedStanding]);

  // SVG Sparkline geometry for weekly progression
  const chartGeometry = useMemo(() => {
    const pts = inspectedStanding.weeklyProgression;
    const width = 320;
    const height = 104;
    const padX = 18;
    const padY = 16;
    const values = pts.map((p) => p.points);
    const min = Math.min(...values) * 0.85;
    const max = Math.max(...values) * 1.05 || 1;

    const coords = pts.map((p, idx) => {
      const x =
        pts.length === 1
          ? width / 2
          : padX + (idx / (pts.length - 1)) * (width - padX * 2);
      const y =
        height - padY - ((p.points - min) / (max - min || 1)) * (height - padY * 2);
      return { ...p, x, y };
    });

    const linePath = coords
      .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ');

    const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(
      height - padY
    ).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(height - padY).toFixed(1)} Z`;

    return { width, height, coords, linePath, areaPath };
  }, [inspectedStanding]);

  const podiumOrder =
    topThree.length === 3 ? [topThree[1], topThree[0], topThree[2]] : topThree;

  return (
    <div className="space-y-5">
      {/* Page Title & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-xl font-bold tracking-tight text-[#24272D] dark:text-[#F3F4F6]">
            {cycle.name}
          </h2>
          <p className="text-[11px] sm:text-xs text-[#6B7280] dark:text-[#8B93A1] mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#D52E3A] dark:text-[#E1434F] shrink-0" aria-hidden="true" />
            <span>{cycle.periodLabel.split(' · ')[0]}</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="hidden sm:inline">{cycle.statusLabel}</span>
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl liquid-glass-segment self-start overflow-x-auto max-w-full">
          {(
            [
              { id: 'novembro_2026', label: 'Novembro' },
              { id: 'outubro_2026', label: 'Outubro' },
              { id: 'temporada_2026', label: 'Temporada 2026' },
            ] as const
          ).map((item) => {
            const active = cycleId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCycleId(item.id)}
                className={`min-h-[34px] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-white dark:bg-[#1F2531] text-[#24272D] dark:text-[#F3F4F6] font-semibold shadow-xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'text-[#6B7280] dark:text-[#8B93A1] hover:text-[#24272D] dark:hover:text-[#F3F4F6]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Hero Summary (Liquid Glass Surface) */}
      <section
        aria-label="Resumo do campeonato"
        className="liquid-glass-surface rounded-2xl p-4 sm:p-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-[#D52E3A] dark:text-[#FCA5A5]">
              {currentUser.storeId ? 'Desempenho da sua loja' : 'Liderança atual do ciclo'}
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <span className="text-base sm:text-lg font-bold text-[#24272D] dark:text-[#F3F4F6]">
                {highlightStanding.storeCode} · {highlightStanding.storeName.split(' — ')[0]}
              </span>
              <span className="hidden sm:inline text-xs text-[#6B7280] dark:text-[#8B93A1]">
                Gerente: {highlightStanding.managerName}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-5 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5E7EB]/80 dark:border-white/[0.08]">
            <div>
              <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">Posição</div>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-bold font-mono-num text-[#24272D] dark:text-[#F3F4F6]">
                  {userStandingIndex + 1}º
                </span>
                {highlightStanding.positionDelta !== 0 && (
                  <span
                    className={`text-[11px] font-semibold font-mono-num inline-flex items-center ${
                      highlightStanding.positionDelta > 0
                        ? 'text-[#15803D] dark:text-[#4ADE80]'
                        : 'text-[#B91F2C] dark:text-[#F87171]'
                    }`}
                  >
                    {highlightStanding.positionDelta > 0 ? '+' : ''}
                    {highlightStanding.positionDelta}
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">Pontuação</div>
              <div className="mt-0.5 text-xl sm:text-2xl font-bold font-mono-num text-[#D52E3A] dark:text-[#FCA5A5]">
                {highlightStanding.totalPoints.toLocaleString('pt-BR')}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">Na semana</div>
              <div className="mt-0.5 text-xl sm:text-2xl font-bold font-mono-num text-[#15803D] dark:text-[#4ADE80]">
                +{highlightStanding.weeklyDeltaPoints}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Top 3 Podium */}
      <section aria-label="Pódio dos três primeiros colocados" className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-semibold text-[#24272D] dark:text-[#F3F4F6] flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#D52E3A] dark:text-[#E1434F]" aria-hidden="true" />
            <span>Pódio do ciclo</span>
          </h3>
          <span className="hidden sm:inline text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
            Toque em uma loja para ver o histórico
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3.5 items-end pt-1">
          {podiumOrder.map((unit) => {
            const rank = cycle.standings.findIndex((s) => s.storeId === unit.storeId) + 1;
            const isFirst = rank === 1;
            const isUserUnit = currentUser.storeId === unit.storeId;
            const isSelected = inspectedStanding.storeId === unit.storeId;

            return (
              <button
                key={unit.storeId}
                type="button"
                onClick={() => setInspectedStoreId(unit.storeId)}
                className={`text-left rounded-2xl transition-all p-2.5 sm:p-4 flex flex-col justify-between border ${
                  isFirst
                    ? 'min-h-[146px] sm:min-h-[164px] bg-[#FFF1F2]/90 dark:bg-[#E1434F]/[0.11] border-[#FDA4AF] dark:border-[#E1434F]/35 shadow-sm'
                    : rank === 2
                      ? 'min-h-[126px] sm:min-h-[142px] liquid-glass-surface'
                      : 'min-h-[114px] sm:min-h-[130px] liquid-glass-surface'
                } ${isSelected ? 'ring-2 ring-[#D52E3A]/60 dark:ring-[#E1434F]/60' : ''}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`font-mono-num text-xs sm:text-sm font-bold ${
                      isFirst
                        ? 'text-[#B91F2C] dark:text-[#FCA5A5]'
                        : 'text-[#6B7280] dark:text-[#9CA3AF]'
                    }`}
                  >
                    {rank}º
                  </span>
                  {isFirst ? (
                    <Award className="w-4 h-4 text-[#D52E3A] dark:text-[#E1434F] shrink-0" aria-hidden="true" />
                  ) : (
                    isUserUnit && (
                      <span className="text-[10px] font-semibold text-[#D52E3A] dark:text-[#FCA5A5] truncate">
                        Você
                      </span>
                    )
                  )}
                </div>

                <div className="my-2 min-w-0">
                  <div className="font-mono-num text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                    {unit.storeCode}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#24272D] dark:text-[#F3F4F6] truncate">
                    {unit.storeName.split(' — ')[0]}
                  </div>
                  <div className="hidden sm:block text-[11px] text-[#6B7280] dark:text-[#8B93A1] truncate">
                    {unit.managerName}
                  </div>
                </div>

                <div className="pt-1.5 border-t border-black/5 dark:border-white/[0.08] flex items-baseline justify-between gap-1">
                  <span className="font-mono-num text-sm sm:text-base font-bold text-[#24272D] dark:text-[#F3F4F6]">
                    {unit.totalPoints.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] text-[#6B7280] dark:text-[#8B93A1]">pts</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Split: Standings Table + Score Detail & Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Standings List / Table */}
        <section className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#24272D] dark:text-[#F3F4F6]">
              Classificação geral
            </h3>
            <select
              aria-label="Filtrar regional no campeonato"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="min-h-[36px] px-2.5 py-1 rounded-xl liquid-glass-surface text-xs text-[#24272D] dark:text-[#F3F4F6]"
            >
              <option value="todas">Todas as regionais</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl divide-y divide-[#E5E7EB] dark:divide-white/[0.06] overflow-hidden">
            {filteredStandings.map((row) => {
              const globalPos = cycle.standings.findIndex((s) => s.storeId === row.storeId) + 1;
              const isUserUnit = currentUser.storeId === row.storeId;
              const isSelected = inspectedStanding.storeId === row.storeId;

              return (
                <button
                  key={row.storeId}
                  type="button"
                  onClick={() => setInspectedStoreId(row.storeId)}
                  className={`w-full text-left px-3.5 sm:px-4 py-3 transition-colors flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#FFF1F2]/75 dark:bg-[#E1434F]/[0.11]'
                      : isUserUnit
                        ? 'bg-[#FFF1F2]/35 dark:bg-[#E1434F]/[0.06]'
                        : 'hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 shrink-0 flex items-center gap-1 font-mono-num text-xs font-bold text-[#24272D] dark:text-[#F3F4F6]">
                      <span>{globalPos}º</span>
                      {row.positionDelta > 0 ? (
                        <ArrowUp className="w-3 h-3 text-[#15803D] dark:text-[#4ADE80]" aria-label="Subiu" />
                      ) : row.positionDelta < 0 ? (
                        <ArrowDown className="w-3 h-3 text-[#B91F2C] dark:text-[#F87171]" aria-label="Caiu" />
                      ) : (
                        <Minus className="w-3 h-3 text-[#AEB0B3] dark:text-[#6B7280]" aria-label="Manteve" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] truncate">
                        <span className="font-mono-num text-[#D52E3A] dark:text-[#F07178]">{row.storeCode}</span>
                        <span className="truncate">{row.storeName.split(' — ')[0]}</span>
                        {isUserUnit && (
                          <span className="text-[10px] font-semibold text-[#B91F2C] dark:text-[#FCA5A5] shrink-0">
                            · Sua loja
                          </span>
                        )}
                      </div>
                      <div className="hidden sm:block text-[11px] text-[#6B7280] dark:text-[#8B93A1] truncate">
                        {row.managerName} · {row.completedTasks} tarefas · {row.evidenceRate}% evidências
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono-num text-sm font-bold text-[#24272D] dark:text-[#F3F4F6]">
                      {row.totalPoints.toLocaleString('pt-BR')} pts
                    </div>
                    {row.weeklyDeltaPoints > 0 && (
                      <div className="font-mono-num text-[11px] text-[#15803D] dark:text-[#4ADE80]">
                        +{row.weeklyDeltaPoints} sem.
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right Panel: Selected Store Details, Evolution Chart & Point History */}
        <aside className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-4 space-y-4">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E5E7EB] dark:border-white/[0.08]">
              <div>
                <div className="text-[11px] font-medium text-[#6B7280] dark:text-[#8B93A1]">
                  Detalhes da pontuação · {inspectedPosition}º lugar
                </div>
                <h4 className="text-sm font-bold text-[#24272D] dark:text-[#F3F4F6] mt-0.5">
                  {inspectedStanding.storeCode} — {inspectedStanding.storeName.split(' — ')[0]}
                </h4>
              </div>
              <div className="text-right font-mono-num">
                <div className="text-base font-bold text-[#D52E3A] dark:text-[#FCA5A5]">
                  {inspectedStanding.totalPoints.toLocaleString('pt-BR')} pts
                </div>
              </div>
            </div>

            {/* Evolution Sparkline */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-[#24272D] dark:text-[#F3F4F6] inline-flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#D52E3A] dark:text-[#E1434F]" aria-hidden="true" />
                  <span>Evolução no campeonato</span>
                </span>
                <span className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                  Por etapa do ciclo
                </span>
              </div>

              <div className="rounded-xl bg-[#F7F8FA] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] p-3">
                <svg
                  viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                  className="w-full h-24 overflow-visible"
                  role="img"
                  aria-label={`Evolução de pontos da loja ${inspectedStanding.storeCode}`}
                >
                  <defs>
                    <linearGradient id="mmChampGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E1434F" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#E1434F" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={chartGeometry.areaPath} fill="url(#mmChampGrad)" />
                  <path
                    d={chartGeometry.linePath}
                    fill="none"
                    stroke="#E1434F"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {chartGeometry.coords.map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4"
                        className="fill-white dark:fill-[#11141B] stroke-[#D52E3A] dark:stroke-[#E1434F]"
                        strokeWidth="2"
                      />
                    </g>
                  ))}
                </svg>
                <div className="mt-1 grid grid-cols-4 text-center text-[11px]">
                  {inspectedStanding.weeklyProgression.map((step) => (
                    <div key={step.label}>
                      <div className="text-[#6B7280] dark:text-[#8B93A1]">{step.label}</div>
                      <div className="font-mono-num font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                        {step.points}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Score Events & Related Tasks */}
            <div>
              <h4 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-2">
                Histórico de eventos de pontuação
              </h4>
              <div className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06] border border-[#E5E7EB] dark:border-white/[0.08] rounded-xl overflow-hidden">
                {storeEvents.map((ev) => (
                  <div key={ev.id} className="p-3 text-xs bg-white dark:bg-[#11141B]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-[#24272D] dark:text-[#F3F4F6] leading-snug">
                        {ev.title}
                      </div>
                      <span className="font-mono-num font-bold text-[#15803D] dark:text-[#4ADE80] shrink-0">
                        +{ev.pointsDelta} pts
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                      <span>
                        {ev.category} · <span className="font-mono-num">{ev.occurredAt}</span>
                      </span>
                      {ev.relatedTaskId && (
                        <button
                          type="button"
                          onClick={() => openTaskDetail(ev.relatedTaskId!)}
                          className="inline-flex items-center gap-1 font-semibold text-[#D52E3A] dark:text-[#FCA5A5] hover:underline shrink-0"
                        >
                          <span>{ev.relatedTaskCode}</span>
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#6B7280] dark:text-[#8B93A1] px-1 leading-relaxed">
            Pontuação exibida em caráter demonstrativo com dados simulados. Critérios oficiais de pontuação e desempate permanecem desacoplados para integração com o servidor.
          </p>
        </aside>
      </div>
    </div>
  );
};
