import React, { useState } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/operations';
import { Avatar } from '../ui/Primitives';

export const AdminScreen: React.FC = () => {
  const {
    users,
    stores,
    parameters,
    toggleUserActive,
    addDemoUser,
    updateParameter,
  } = useApp();

  const [tab, setTab] = useState<'usuarios' | 'unidades' | 'perfis' | 'parametros'>('usuarios');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('gerente');
  const [newStoreId, setNewStoreId] = useState<string>('st-04');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [editingParamId, setEditingParamId] = useState<string | null>(null);
  const [paramDraft, setParamDraft] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addDemoUser(
      newName,
      newRole,
      newRole === 'admin' || newRole === 'supervisor' ? null : newStoreId,
      newJobTitle
    );
    setNewName('');
    setNewJobTitle('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#24272D] dark:text-[#F3F4F6]">
            Administração da Plataforma
          </h2>
          <p className="text-xs text-[#6B7280] dark:text-[#8B93A1]">
            Gestão demonstrativa de usuários, unidades, perfis de acesso e parâmetros operacionais.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 liquid-glass-segment rounded-xl overflow-x-auto">
          {(
            [
              { id: 'usuarios', label: 'Usuários' },
              { id: 'unidades', label: 'Unidades' },
              { id: 'perfis', label: 'Perfis' },
              { id: 'parametros', label: 'Parâmetros' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'bg-white dark:bg-[#1F2531] text-[#24272D] dark:text-[#F3F4F6] font-semibold shadow-xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'text-[#6B7280] dark:text-[#8B93A1] hover:text-[#24272D] dark:hover:text-[#F3F4F6]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'usuarios' && (
        <div className="space-y-4">
          <form
            onSubmit={handleAddUser}
            className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end text-xs"
          >
            <div className="sm:col-span-3">
              <label className="block font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-1">Nome completo</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex.: Mariana Alves"
                className="w-full min-h-[38px] px-3 rounded-xl bg-[#F5F6F8] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] focus:outline-none focus:border-[#D52E3A] dark:focus:border-[#E1434F]"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-1">Cargo</label>
              <input
                type="text"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                placeholder="Ex.: Gerente de Loja"
                className="w-full min-h-[38px] px-3 rounded-xl bg-[#F5F6F8] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] focus:outline-none focus:border-[#D52E3A] dark:focus:border-[#E1434F]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-1">Perfil</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full min-h-[38px] px-2.5 rounded-xl bg-[#F5F6F8] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6]"
              >
                <option value="gerente">Gerente</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#24272D] dark:text-[#F3F4F6] mb-1">Unidade</label>
              <select
                value={newStoreId}
                disabled={newRole === 'admin' || newRole === 'supervisor'}
                onChange={(e) => setNewStoreId(e.target.value)}
                className="w-full min-h-[38px] px-2.5 rounded-xl bg-[#F5F6F8] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] disabled:opacity-50"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full min-h-[38px] px-3 rounded-xl bg-[#D52E3A] hover:bg-[#B91F2C] text-white font-semibold inline-flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </form>

          <div className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl divide-y divide-[#E5E7EB] dark:divide-white/[0.06] overflow-hidden">
            {users.map((u) => (
              <div key={u.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={u.avatarUrl} initials={u.initials} name={u.name} size="sm" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] truncate">
                      {u.name} · <span className="text-[#D52E3A] dark:text-[#FCA5A5]">{u.roleLabel}</span>
                    </div>
                    <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1] truncate">
                      {u.jobTitle} · {u.storeName}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleUserActive(u.id)}
                  className={`min-h-[34px] px-3 rounded-xl text-xs font-semibold border shrink-0 transition-colors ${
                    u.active
                      ? 'border-[#E5E7EB] dark:border-white/[0.08] bg-transparent dark:bg-[#171B24] text-[#15803D] dark:text-[#4ADE80]'
                      : 'border-[#FECDD3] dark:border-[#E1434F]/35 text-[#B91F2C] dark:text-[#FCA5A5]'
                  }`}
                >
                  {u.active ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'unidades' && (
        <div className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl divide-y divide-[#E5E7EB] dark:divide-white/[0.06] overflow-hidden">
          {stores.map((s) => (
            <div key={s.id} className="p-4 flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                  <span className="font-mono-num text-[#D52E3A] dark:text-[#F07178] mr-1.5">{s.code}</span>
                  {s.name}
                </div>
                <div className="text-[11px] text-[#6B7280] dark:text-[#8B93A1] mt-0.5">
                  {s.city} · {s.region} · Gerente: {s.managerName}
                </div>
              </div>
              <div className="text-right font-mono-num text-[11px] text-[#4B5563] dark:text-[#9CA3AF]">
                {s.teamSize} pessoas
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'perfis' && (
        <div className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[480px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-white/[0.08] bg-[#F5F6F8] dark:bg-[#161A23] text-[11px] font-semibold text-[#6B7280] dark:text-[#8B93A1]">
                <th className="py-2.5 px-4">Capacidade</th>
                <th className="py-2.5 px-3">Administrador</th>
                <th className="py-2.5 px-3">Supervisor</th>
                <th className="py-2.5 px-4">Gerente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-white/[0.06]">
              {[
                ['Cumprir tarefas designadas e enviar evidências', 'Sim', 'Sim', 'Designadas'],
                ['Abrir, editar e atribuir atividades', 'Rede', 'Regional', 'Não'],
                ['Conferir, aprovar ou devolver evidências', 'Rede', 'Regional', 'Não'],
                ['Acompanhar Campeonato e indicadores', 'Rede', 'Regional', 'Sua loja + Rede'],
                ['Gerenciar usuários e parâmetros', 'Sim', 'Não', 'Não'],
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F7F8FA] dark:hover:bg-white/[0.03]">
                  <td className="py-3 px-4 font-medium text-[#24272D] dark:text-[#F3F4F6]">{row[0]}</td>
                  <td className="py-3 px-3 text-[#15803D] dark:text-[#4ADE80] font-semibold">{row[1]}</td>
                  <td className="py-3 px-3 text-[#4B5563] dark:text-[#D1D5DB]">{row[2]}</td>
                  <td className="py-3 px-4 text-[#4B5563] dark:text-[#D1D5DB]">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'parametros' && (
        <div className="bg-white dark:bg-[#11141B] border border-[#E5E7EB] dark:border-white/[0.08] rounded-2xl divide-y divide-[#E5E7EB] dark:divide-white/[0.06] overflow-hidden">
          {parameters.map((param) => {
            const isEditing = editingParamId === param.id;
            return (
              <div key={param.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#24272D] dark:text-[#F3F4F6] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D52E3A] dark:text-[#E1434F] shrink-0" />
                    <span>{param.label}</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#8B93A1] mt-0.5">
                    {param.description}
                  </p>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={paramDraft}
                      onChange={(e) => setParamDraft(e.target.value)}
                      className="min-h-[36px] px-2.5 text-xs rounded-xl bg-[#F5F6F8] dark:bg-[#0D1017] border border-[#E5E7EB] dark:border-white/[0.08] text-[#24272D] dark:text-[#F3F4F6] focus:outline-none focus:border-[#D52E3A] dark:focus:border-[#E1434F]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        updateParameter(param.id, paramDraft);
                        setEditingParamId(null);
                      }}
                      className="min-h-[36px] px-3 rounded-xl bg-[#D52E3A] text-white text-xs font-semibold"
                    >
                      Salvar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono-num font-semibold text-[#24272D] dark:text-[#F3F4F6]">
                      {param.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingParamId(param.id);
                        setParamDraft(param.value);
                      }}
                      className="min-h-[34px] px-3 rounded-xl border border-[#E5E7EB] dark:border-white/[0.08] bg-transparent dark:bg-[#171B24] text-xs font-medium text-[#24272D] dark:text-[#F3F4F6] hover:bg-[#F7F8FA] dark:hover:bg-[#1F2531] transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
