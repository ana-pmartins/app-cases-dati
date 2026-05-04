import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Mail, Shield, UserPlus, Loader2 } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot, setDoc, deleteDoc, doc } from "firebase/firestore";
import { AuthorizedUser } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "viewer">("viewer");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const q = query(collection(db, "authorized_users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as AuthorizedUser));
    });
    return () => unsubscribe();
  }, [isOpen]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "authorized_users", newEmail.toLowerCase()), {
        email: newEmail.toLowerCase(),
        role: newRole,
        name: newEmail.split("@")[0] // Default name
      });
      setNewEmail("");
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (window.confirm(`Remover acesso de ${email}?`)) {
      await deleteDoc(doc(db, "authorized_users", email));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dati-dark/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-dati-dark flex items-center gap-2">
            <Shield size={20} className="text-dati-purple" />
            Gestão de Acessos
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-grow overflow-y-auto font-sans">
          <form onSubmit={handleAddUser} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Autorizar novo e-mail</p>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@empresa.com"
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-dati-blue outline-none transition-all"
                />
              </div>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-dati-blue outline-none bg-white font-semibold"
              >
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
              <button
                disabled={loading}
                className="bg-dati-dark text-white px-4 py-2 rounded-xl hover:bg-dati-blue transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={18} />}
              </button>
            </div>
          </form>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Usuários Autorizados ({users.length})</p>
            <div className="space-y-1">
              {users.map((u) => (
                <div key={u.email} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-dati-dark">{u.email}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                      {u.role === 'admin' ? <Shield size={10} className="text-dati-purple" /> : null}
                      {u.role}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(u.email)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {users.length === 0 && (
                <div className="py-8 text-center text-slate-400 italic text-sm">Nenhum usuário cadastrado.</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
