"use client";

import { useEffect, useState } from "react";
import { userService, ApiUser } from "@/services/userService";
import { clientService, ApiClient } from "@/services/clientService";

export default function AdminUsers() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [editUser, setEditUser] = useState<ApiUser | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", user_name: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  const [resetUser, setResetUser] = useState<ApiUser | null>(null);
  const [resetPwd, setResetPwd] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ user_name: "", email: "", password: "", role: "client_user", client_id: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  // Inline nueva empresa
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientContact, setNewClientContact] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientLoading, setNewClientLoading] = useState(false);
  const [newClientMsg, setNewClientMsg] = useState("");

  async function load() {
    try {
      const [u, c] = await Promise.all([userService.getAll(), clientService.getAll()]);
      setUsers(u);
      setClients(c);
    } catch { /* */ }
    setFetching(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.user_name.toLowerCase().includes(q) || (u.name || "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  // Edit
  function openEdit(u: ApiUser) {
    setEditUser(u);
    setEditForm({ name: u.name || "", email: u.email, user_name: u.user_name });
    setEditMsg("");
  }
  async function saveEdit() {
    if (!editUser) return;
    setEditLoading(true);
    setEditMsg("");
    try {
      await userService.update(editUser.id, editForm);
      setEditMsg("Guardado.");
      await load();
      setTimeout(() => setEditUser(null), 800);
    } catch { setEditMsg("Error al guardar."); }
    setEditLoading(false);
  }

  // Reset password
  function openReset(u: ApiUser) {
    setResetUser(u);
    setResetPwd("");
    setResetConfirm("");
    setResetMsg("");
  }
  async function saveReset() {
    if (!resetUser) return;
    if (resetPwd.length < 6) { setResetMsg("Mínimo 6 caracteres."); return; }
    if (resetPwd !== resetConfirm) { setResetMsg("No coinciden."); return; }
    setResetLoading(true);
    setResetMsg("");
    try {
      await userService.resetPassword(resetUser.id, resetPwd);
      setResetMsg("Contraseña actualizada.");
      setTimeout(() => setResetUser(null), 800);
    } catch { setResetMsg("Error."); }
    setResetLoading(false);
  }

  // Toggle status
  async function toggleStatus(u: ApiUser) {
    try {
      await userService.toggleStatus(u.id);
      await load();
    } catch { /* */ }
  }

  // Crear nueva empresa inline
  async function saveNewClient() {
    if (!newClientName.trim()) { setNewClientMsg("El nombre es requerido."); return; }
    setNewClientLoading(true);
    setNewClientMsg("");
    try {
      const created = await clientService.create(newClientName.trim(), newClientContact.trim() || undefined, newClientEmail.trim() || undefined);
      setClients((prev) => [...prev, created].sort((a, b) => a.company_name.localeCompare(b.company_name)));
      setCreateForm((prev) => ({ ...prev, client_id: String(created.id) }));
      setNewClientOpen(false);
      setNewClientName("");
      setNewClientContact("");
      setNewClientEmail("");
    } catch {
      setNewClientMsg("Error al crear la empresa.");
    }
    setNewClientLoading(false);
  }

  // Create
  async function saveCreate() {
    if (!createForm.user_name || !createForm.email || !createForm.password) { setCreateMsg("Completá todos los campos."); return; }
    if (createForm.password.length < 6) { setCreateMsg("Contraseña: mínimo 6 caracteres."); return; }
    setCreateLoading(true);
    setCreateMsg("");
    try {
      await userService.create({
        user_name: createForm.user_name,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        client_id: createForm.client_id ? Number(createForm.client_id) : null,
      });
      setCreateMsg("Usuario creado.");
      await load();
      setTimeout(() => { setCreateOpen(false); setCreateForm({ user_name: "", email: "", password: "", role: "client_user", client_id: "" }); }, 800);
    } catch (e: any) {
      setCreateMsg(e?.errors?.join(", ") || e?.error || "Error al crear.");
    }
    setCreateLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: "StyreneA, sans-serif", fontSize: "13px", border: "1px solid rgba(0,0,0,0.2)",
    padding: "9px 12px", outline: "none", width: "100%", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600,
    letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", margin: "0 0 4px 0",
  };

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "20px", fontWeight: 400, margin: 0 }}>
          Usuarios <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.35)" }}>({users.length})</span>
        </h2>
        <button
          onClick={() => { setCreateOpen(true); setCreateMsg(""); }}
          style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", fontWeight: 500, color: "#fff", backgroundColor: "#000", border: "none", padding: "9px 20px", cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase" }}
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar por nombre, usuario o email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ ...inputStyle, marginBottom: "20px", maxWidth: "400px" }}
      />

      {/* Table */}
      {fetching ? (
        <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando...</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "0.5fr 1.5fr 1.5fr 2fr 1fr 0.8fr 1.5fr", gap: "12px", padding: "0 0 10px 0", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
            {["ID", "Usuario", "Nombre", "Email", "Rol", "Estado", "Acciones"].map((h) => (
              <p key={h} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", margin: 0 }}>{h}</p>
            ))}
          </div>
          {filtered.map((u) => (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "0.5fr 1.5fr 1.5fr 2fr 1fr 0.8fr 1.5fr", gap: "12px", padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,0.06)", alignItems: "center" }}>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)", margin: 0 }}>{u.id}</p>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>{u.user_name}</p>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: 0 }}>{u.name || "—"}</p>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.6)", margin: 0 }}>{u.email}</p>
              <span style={{
                fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                color: u.role === "master_admin" ? "#7c3aed" : "#0369a1",
              }}>
                {u.role === "master_admin" ? "Admin" : "Cliente"}
              </span>
              <span style={{
                fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600,
                color: u.active ? "#3a6b3a" : "#9c0f0f",
              }}>
                {u.active ? "Activo" : "Inactivo"}
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => openEdit(u)} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "#000", border: "1px solid rgba(0,0,0,0.2)", background: "none", padding: "5px 10px", cursor: "pointer" }}>Editar</button>
                <button onClick={() => openReset(u)} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "#000", border: "1px solid rgba(0,0,0,0.2)", background: "none", padding: "5px 10px", cursor: "pointer" }}>Clave</button>
                <button onClick={() => toggleStatus(u)} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: u.active ? "#9c0f0f" : "#3a6b3a", border: "1px solid rgba(0,0,0,0.2)", background: "none", padding: "5px 10px", cursor: "pointer" }}>
                  {u.active ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── Modal: Editar usuario ── */}
      {editUser && (
        <Modal title={`Editar: ${editUser.user_name}`} onClose={() => setEditUser(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div><p style={labelStyle}>Nombre</p><input style={inputStyle} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
            <div><p style={labelStyle}>Email</p><input style={inputStyle} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
            <div><p style={labelStyle}>Usuario</p><input style={inputStyle} value={editForm.user_name} onChange={(e) => setEditForm({ ...editForm, user_name: e.target.value })} /></div>
            {editMsg && <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: editMsg === "Guardado." ? "#3a6b3a" : "#9c0f0f", margin: 0 }}>{editMsg}</p>}
            <button onClick={saveEdit} disabled={editLoading} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#fff", backgroundColor: "#000", border: "none", padding: "12px", cursor: "pointer" }}>
              {editLoading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal: Resetear contraseña ── */}
      {resetUser && (
        <Modal title={`Contraseña: ${resetUser.user_name}`} onClose={() => setResetUser(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div><p style={labelStyle}>Nueva Contraseña</p><input type="password" style={inputStyle} value={resetPwd} onChange={(e) => setResetPwd(e.target.value)} /></div>
            <div><p style={labelStyle}>Confirmar</p><input type="password" style={inputStyle} value={resetConfirm} onChange={(e) => setResetConfirm(e.target.value)} /></div>
            {resetMsg && <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: resetMsg.includes("actualizada") ? "#3a6b3a" : "#9c0f0f", margin: 0 }}>{resetMsg}</p>}
            <button onClick={saveReset} disabled={resetLoading} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#fff", backgroundColor: "#000", border: "none", padding: "12px", cursor: "pointer" }}>
              {resetLoading ? "Guardando..." : "Resetear Contraseña"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal: Crear usuario ── */}
      {createOpen && (
        <Modal title="Nuevo Usuario" onClose={() => { setCreateOpen(false); setNewClientOpen(false); setNewClientName(""); setNewClientContact(""); setNewClientEmail(""); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div><p style={labelStyle}>Nombre de Usuario *</p><input style={inputStyle} value={createForm.user_name} onChange={(e) => setCreateForm({ ...createForm, user_name: e.target.value })} /></div>
            <div><p style={labelStyle}>Email *</p><input type="email" style={inputStyle} value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} /></div>
            <div><p style={labelStyle}>Contraseña *</p><input type="password" style={inputStyle} value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} /></div>
            <div>
              <p style={labelStyle}>Rol</p>
              <select style={inputStyle} value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
                <option value="client_user">Cliente</option>
                <option value="master_admin">Administrador</option>
              </select>
            </div>
            {createForm.role === "client_user" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={labelStyle}>Empresa (cliente)</p>
                  <button
                    type="button"
                    onClick={() => { setNewClientOpen((v) => !v); setNewClientMsg(""); }}
                    style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "#000", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                  >
                    {newClientOpen ? "Cancelar" : "+ Agregar empresa nueva"}
                  </button>
                </div>

                <select style={inputStyle} value={createForm.client_id} onChange={(e) => setCreateForm({ ...createForm, client_id: e.target.value })}>
                  <option value="">— Sin asignar —</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>

                {/* Mini-form nueva empresa */}
                {newClientOpen && (
                  <div style={{ border: "1px solid rgba(0,0,0,0.12)", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#fafafa" }}>
                    <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", margin: 0 }}>Nueva empresa</p>
                    <div>
                      <p style={labelStyle}>Nombre *</p>
                      <input style={inputStyle} value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Empresa S.A." />
                    </div>
                    <div>
                      <p style={labelStyle}>Contacto</p>
                      <input style={inputStyle} value={newClientContact} onChange={(e) => setNewClientContact(e.target.value)} placeholder="Nombre del contacto" />
                    </div>
                    <div>
                      <p style={labelStyle}>Email</p>
                      <input type="email" style={inputStyle} value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} placeholder="empresa@correo.com" />
                    </div>
                    {newClientMsg && <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#9c0f0f", margin: 0 }}>{newClientMsg}</p>}
                    <button
                      type="button"
                      onClick={saveNewClient}
                      disabled={newClientLoading}
                      style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", fontWeight: 500, color: "#fff", backgroundColor: newClientLoading ? "rgba(0,0,0,0.4)" : "#000", border: "none", padding: "9px 14px", cursor: newClientLoading ? "not-allowed" : "pointer", alignSelf: "flex-start" }}
                    >
                      {newClientLoading ? "Creando..." : "Crear empresa"}
                    </button>
                  </div>
                )}
              </div>
            )}
            {createMsg && <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: createMsg.includes("creado") ? "#3a6b3a" : "#9c0f0f", margin: 0 }}>{createMsg}</p>}
            <button onClick={saveCreate} disabled={createLoading} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#fff", backgroundColor: "#000", border: "none", padding: "12px", cursor: "pointer" }}>
              {createLoading ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 200 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#fff", width: "440px", maxHeight: "80vh", overflowY: "auto", zIndex: 201, padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "16px", fontWeight: 400, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "rgba(0,0,0,0.4)" }}>×</button>
        </div>
        {children}
      </div>
    </>
  );
}
