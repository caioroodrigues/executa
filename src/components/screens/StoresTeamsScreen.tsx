import React, { useState } from 'react';
import { Building2, MapPin, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Primitives';

export const StoresTeamsScreen: React.FC = () => {
  const { stores, users, tasks, currentUser, capabilities, openTaskDetail } = useApp();
  const visibleStores = capabilities.canManageStores
    ? stores
    : stores.filter((s) => s.id === (currentUser.storeId || 'st-04'));

  const [selectedStoreId, setSelectedStoreId] = useState<string>(visibleStores[0]?.id || 'st-04');
  const activeStore = visibleStores.find((s) => s.id === selectedStoreId) || visibleStores[0];

  const storeTeam = users.filter((u) => u.storeId === activeStore?.id);
  const storeTasks = tasks.filter((t) => t.storeId === activeStore?.id);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-[#24272D] dark:text-[#F3F4F6]">
          Lojas e Equipes
        </h2>
        <p className="hidden sm:block text-xs text-[#6B7280] dark:text-[#8B93A1]">
          Acompanhamento por unidade, responsáveis de turno e carga operacional.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Store List */}
        <div className="lg:col-span-5 bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl divide-y divide-[#E5E7EB] dark:divide-white/[0.06] overflow-hidden">
          {visibleStores.map((store) => {
            const isSelected = store.id === activeStore?.id;
            return (
              <button
                key={store.id}
                type="button"
                onClick={() => setSelectedStoreId(store.id)}
                className={`w-full text-left p-3.5 transition-colors flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#FFF1F2]/75 dark:bg-[#E1434F]/[0.11]'
                    : 'hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03]'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                    <span className="font-mono-num text-[#D52E3A] dark:text-[#F07178]">{store.code}</span>
                    <span className="truncate">{store.name}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                    Gerente: {store.managerName} · {store.teamSize} colaboradores
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono-num text-sm font-bold text-[#24272D] dark:text-[#F3F4F6]">
                    {store.slaRate}%
                  </div>
                  <div className="text-[10px] text-[#6B7280] dark:text-[#8B93A1]">no prazo</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Store Details + Team + Tasks */}
        {activeStore && (
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#E5E7EB] dark:border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#8B93A1]">
                    <Building2 className="w-3.5 h-3.5 text-[#D52E3A] dark:text-[#E1434F]" />
                    <span className="font-mono-num font-semibold">{activeStore.code}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activeStore.city} ({activeStore.region})
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                    {activeStore.name}
                  </h3>
                </div>
                <span className="text-xs font-medium text-[#15803D] dark:text-[#4ADE80]">
                  {activeStore.status === 'auditoria' ? 'Em auditoria' : 'Operação regular'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3.5 text-xs">
                <div>
                  <div className="text-[#6B7280] dark:text-[#8B93A1]">No prazo</div>
                  <div className="mt-0.5 font-mono-num text-lg font-bold text-[#24272D] dark:text-[#F3F4F6]">
                    {activeStore.slaRate}%
                  </div>
                </div>
                <div>
                  <div className="text-[#6B7280] dark:text-[#8B93A1]">Aprovação 1ª vez</div>
                  <div className="mt-0.5 font-mono-num text-lg font-bold text-[#24272D] dark:text-[#F3F4F6]">
                    {activeStore.qualityIndex}%
                  </div>
                </div>
                <div>
                  <div className="text-[#6B7280] dark:text-[#8B93A1]">Abertas</div>
                  <div className="mt-0.5 font-mono-num text-lg font-bold text-[#24272D] dark:text-[#F3F4F6]">
                    {activeStore.openTasks}
                  </div>
                </div>
                <div>
                  <div className="text-[#6B7280] dark:text-[#8B93A1]">Atrasadas</div>
                  <div className="mt-0.5 font-mono-num text-lg font-bold text-[#B91F2C] dark:text-[#F87171]">
                    {activeStore.overdueTasks}
                  </div>
                </div>
              </div>
            </div>

            {/* Team Roster */}
            <div className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-4 sm:p-5">
              <h4 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] flex items-center gap-1.5 mb-3">
                <Users className="w-4 h-4 text-[#D52E3A] dark:text-[#E1434F]" />
                <span>Responsáveis cadastrados na unidade ({storeTeam.length})</span>
              </h4>
              {storeTeam.length === 0 ? (
                <p className="text-xs text-[#6B7280] dark:text-[#8B93A1]">
                  Gerência vinculada à regional: {activeStore.managerName}.
                </p>
              ) : (
                <div className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06]">
                  {storeTeam.map((member) => {
                    const memberTasks = tasks.filter(
                      (t) => t.assigneeId === member.id && t.status !== 'aprovada'
                    ).length;
                    return (
                      <div
                        key={member.id}
                        className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar
                            src={member.avatarUrl}
                            initials={member.initials}
                            name={member.name}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] truncate">
                              {member.name}
                            </div>
                            <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1] truncate">
                              {member.jobTitle} · {member.roleLabel}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-mono-num text-[#4B5563] dark:text-[#9CA3AF] shrink-0">
                          {memberTasks} ativa(s)
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Unit Tasks */}
            <div className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-4 sm:p-5">
              <h4 className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-3">
                Atividades da unidade ({storeTasks.length})
              </h4>
              {storeTasks.length === 0 ? (
                <p className="text-xs text-[#6B7280] dark:text-[#8B93A1]">
                  Nenhuma atividade registrada para esta loja no momento.
                </p>
              ) : (
                <div className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06]">
                  {storeTasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => openTaskDetail(t.id)}
                      className="w-full text-left py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:opacity-80"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#24272D] dark:text-[#F3F4F6] truncate">
                          <span className="font-mono-num text-[#6B7280] dark:text-[#8B93A1] mr-1.5">{t.code}</span>
                          {t.title}
                        </div>
                        <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1]">
                          {t.assigneeName} · {t.category}
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-[#6B7280] dark:text-[#8B93A1] shrink-0">
                        Abrir
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
