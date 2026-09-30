"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStore } from "@/lib/store";
import { ALL_MODULES, TEMPLATES, NO_ACCESS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { useState } from "react";
import {
  Plus, X, UserCog, Power, Edit, ChevronRight, Check,
} from "lucide-react";
import type { User, ModuleKey, Level, TemplateKey } from "@/types";

const LEVELS: Level[] = ["none", "view", "manage"];
const LEVEL_LABEL: Record<Level, string> = { none: "Tidak Ada", view: "Lihat", manage: "Kelola" };
const TEMPLATE_KEYS: TemplateKey[] = ["Staf Penjualan", "Staf Gudang", "Staf Pembelian", "Staf Keuangan", "Kustom"];

// ---- Permission Matrix ----
function PermissionMatrix({
  permissions,
  onChange,
}: {
  permissions: Record<ModuleKey, Level>;
  onChange: (key: ModuleKey, level: Level) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left py-2 pr-3 font-medium text-[hsl(var(--muted-fg))]">Modul</th>
            {LEVELS.map((l) => (
              <th key={l} className="text-center py-2 px-2 font-medium text-[hsl(var(--muted-fg))]">{LEVEL_LABEL[l]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALL_MODULES.map((m) => (
            <tr key={m.key} className="border-t border-[hsl(var(--border))]">
              <td className="py-2 pr-3 font-medium">{m.label}</td>
              {LEVELS.map((l) => (
                <td key={l} className="text-center py-2 px-2">
                  <button
                    type="button"
                    onClick={() => onChange(m.key, l)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${
                      permissions[m.key] === l
                        ? l === "manage"
                          ? "border-blue-500 bg-blue-500"
                          : l === "view"
                          ? "border-green-500 bg-green-500"
                          : "border-[hsl(var(--muted-fg))] bg-[hsl(var(--muted-fg))]"
                        : "border-[hsl(var(--border))] bg-transparent hover:border-blue-400"
                    }`}
                  >
                    {permissions[m.key] === l && <Check className="w-2.5 h-2.5 text-white" />}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Employee Form Modal ----
function EmployeeFormModal({
  editUser,
  onClose,
}: {
  editUser?: User;
  onClose: () => void;
}) {
  const addUser = useStore((s) => s.addUser);
  const updateUserPermissions = useStore((s) => s.updateUserPermissions);

  const [name, setName] = useState(editUser?.name ?? "");
  const [email, setEmail] = useState(editUser?.email ?? "");
  const [password, setPassword] = useState(editUser?.password ?? "");
  const [template, setTemplate] = useState<TemplateKey | string>(editUser?.template ?? "Staf Penjualan");
  const [permissions, setPermissions] = useState<Record<ModuleKey, Level>>(
    editUser?.permissions ?? TEMPLATES["Staf Penjualan"]
  );

  function handleTemplateChange(t: TemplateKey) {
    setTemplate(t);
    if (t !== "Kustom") {
      setPermissions(TEMPLATES[t]);
    }
  }

  function handlePermChange(key: ModuleKey, level: Level) {
    setTemplate("Kustom");
    setPermissions((p) => ({ ...p, [key]: level }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editUser) {
      updateUserPermissions(editUser.id, permissions, template as string);
    } else {
      const newUser: User = {
        id: `emp-${Date.now()}`,
        name, email, password,
        isOwner: false,
        active: true,
        template: template as string,
        permissions,
      };
      addUser(newUser);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="sticky top-0 flex items-center justify-between px-6 pt-5 pb-3 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]">
          <h2 className="font-bold">{editUser ? `Ubah Penugasan: ${editUser.name}` : "Tambah Karyawan"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Data akun (hanya saat tambah baru) */}
          {!editUser && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Data Akun</h3>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-fg))] block mb-1">Nama Lengkap</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Contoh: Dewi Lestari"
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-fg))] block mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="dewi@usaha.in"
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--muted-fg))] block mb-1">Password Awal</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>
          )}

          {/* Template jabatan */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Template Jabatan</h3>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATE_KEYS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTemplateChange(t)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all ${
                    template === t
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "border-[hsl(var(--border))] hover:border-blue-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Permission Matrix */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Matriks Penugasan</h3>
            <div className="rounded-lg border border-[hsl(var(--border))] p-3 bg-[hsl(var(--muted))]">
              <PermissionMatrix permissions={permissions} onChange={handlePermChange} />
            </div>
          </div>

          <button type="submit"
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
            {editUser ? "Simpan Perubahan" : "Buat Akun Karyawan"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function TimPage() {
  const user = useCurrentUser();
  const users = useStore((s) => s.users);
  const toggleUserActive = useStore((s) => s.toggleUserActive);

  if (!user?.isOwner) redirect("/tidak-ada-akses");

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<User | undefined>(undefined);

  const employees = users.filter((u) => !u.isOwner);

  function openEdit(emp: User) {
    setEditTarget(emp);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditTarget(undefined);
  }

  return (
    <DashboardLayout title="Manajemen Tim" subtitle={`${employees.length} karyawan terdaftar`}>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[hsl(var(--muted-fg))]">Kelola akun karyawan dan penugasan modul</p>
        <button id="add-employee-btn" onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Tambah Karyawan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {employees.map((emp) => {
          const assignedModules = ALL_MODULES.filter(
            (m) => emp.permissions[m.key as ModuleKey] !== "none"
          );
          return (
            <div key={emp.id} className={`card flex flex-col sm:flex-row sm:items-center gap-4 ${!emp.active ? "opacity-60" : ""}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold shrink-0">
                {emp.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{emp.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-fg))]">
                    {emp.template}
                  </span>
                  {!emp.active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Nonaktif</span>
                  )}
                </div>
                <p className="text-xs text-[hsl(var(--muted-fg))] mb-2">{emp.email}</p>
                <div className="flex flex-wrap gap-1">
                  {assignedModules.slice(0, 5).map((m) => {
                    const level = emp.permissions[m.key as ModuleKey];
                    return (
                      <span key={m.key} className="text-[10px] px-1.5 py-0.5 rounded border font-medium"
                        style={{
                          background: level === "manage" ? "hsl(224 76% 93%)" : "hsl(220 14% 93%)",
                          color: level === "manage" ? "hsl(224 76% 30%)" : "hsl(220 10% 40%)",
                          borderColor: level === "manage" ? "hsl(224 76% 82%)" : "hsl(220 14% 82%)",
                        }}>
                        {m.label}
                      </span>
                    );
                  })}
                  {assignedModules.length > 5 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-[hsl(var(--border))] text-[hsl(var(--muted-fg))]">
                      +{assignedModules.length - 5} lagi
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(emp)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-xs font-medium hover:bg-[hsl(var(--muted))] transition-colors">
                  <Edit className="w-3.5 h-3.5" /> Ubah
                </button>
                <button onClick={() => toggleUserActive(emp.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    emp.active
                      ? "border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      : "border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  }`}>
                  <Power className="w-3.5 h-3.5" />
                  {emp.active ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <EmployeeFormModal editUser={editTarget} onClose={closeForm} />
      )}
    </DashboardLayout>
  );
}
