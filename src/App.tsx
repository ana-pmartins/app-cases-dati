import { useState, useEffect, useMemo } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  setDoc,
  getDocs,
  limit
} from "firebase/firestore";
import { db, loginWithGoogle, logout } from "./lib/firebase";
import { SuccessCase } from "./types";
import { useAuth } from "./hooks/useAuth";
import { CaseCard } from "./components/CaseCard";
import { Filters } from "./components/Filters";
import { AdminModal } from "./components/AdminModal";
import { UserManagementModal } from "./components/UserManagementModal";
import { 
  Plus, 
  LogOut, 
  ShieldAlert, 
  LayoutGrid, 
  Search, 
  BookOpen, 
  Loader2,
  Lock,
  ArrowRight,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { handleFirestoreError, OperationType } from "./lib/firebase";

export default function App() {
  const { user, authProfile, loading: authLoading, isAuthorized } = useAuth();
  const [cases, setCases] = useState<SuccessCase[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<SuccessCase | null>(null);

  // Initialize first admin if list is empty or specific master email
  useEffect(() => {
    const initAdmin = async () => {
      if (user?.email) {
        const masterEmail = "ana.pmartins@dati.com.br".toLowerCase();
        const currentEmail = user.email.toLowerCase();
        const usersRef = collection(db, "authorized_users");
        
        console.log("Verificando acesso administrativo para:", currentEmail);

        // Check if current user is the master email
        if (currentEmail === masterEmail) {
          try {
            await setDoc(doc(db, "authorized_users", currentEmail), {
              email: currentEmail,
              role: "admin",
              name: user.displayName || "Ana Martins"
            });
            console.log("Acesso Admin Master confirmado para", currentEmail);
          } catch (e) {
            console.error("Erro ao validar Master Admin:", e);
          }
          return;
        }

        const q = query(usersRef, limit(1));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          // If no authorized users exist, add the first one as admin
          try {
            await setDoc(doc(db, "authorized_users", currentEmail), {
              email: currentEmail,
              role: "admin",
              name: user.displayName || "Admin"
            });
            console.log("Primeiro administrador criado:", currentEmail);
          } catch (e) {
            console.error("Erro ao criar admin inicial:", e);
          }
        }
      }
    };
    if (user && !authLoading) initAdmin();
  }, [user, authLoading]);

  useEffect(() => {
    if (!isAuthorized) return;

    const q = query(collection(db, "cases"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const casesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SuccessCase[];
      setCases(casesData);
      setCasesLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "cases");
    });

    return () => unsubscribe();
  }, [isAuthorized]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    cases.forEach((c) => c.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [cases]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch = 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTags = 
        selectedTags.length === 0 || 
        selectedTags.every((t) => c.tags.includes(t));
      
      return matchesSearch && matchesTags;
    });
  }, [cases, searchQuery, selectedTags]);

  const handleSaveCase = async (caseData: Partial<SuccessCase>) => {
    if (!user) {
      alert("Usuário não autenticado.");
      return;
    }

    console.log("Iniciando salvamento do case...", caseData);
    const { id, ...cleanData } = caseData; 
    
    // Ensure all required fields for rules validation exist even if empty
    const dataToSave = {
      title: cleanData.title || "",
      blogUrl: cleanData.blogUrl || "",
      tags: cleanData.tags || [],
      pdfUrl: cleanData.pdfUrl || "",
      pngUrl: cleanData.pngUrl || "",
      updatedAt: serverTimestamp(),
      authorId: user.uid,
    };

    try {
      if (id) {
        console.log("Atualizando case existente:", id);
        const docRef = doc(db, "cases", id);
        await updateDoc(docRef, dataToSave);
      } else {
        console.log("Criando novo case...");
        await addDoc(collection(db, "cases"), {
          ...dataToSave,
          createdAt: serverTimestamp(),
        });
      }
      console.log("Case salvo com sucesso!");
    } catch (error) {
      console.error("Erro detalhado ao salvar case:", error);
      handleFirestoreError(error, id ? OperationType.UPDATE : OperationType.CREATE, `cases/${id || 'new'}`);
      throw error;
    }
  };

  const handleDeleteCase = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este case?")) {
      try {
        await deleteDoc(doc(db, "cases", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `cases/${id}`);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-dati-blue animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-dati-blue rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-dati-blue/30">
                D
              </div>
              <span className="text-2xl font-black text-dati-dark tracking-tighter italic">DATI</span>
            </div>
            
            <h1 className="text-5xl font-black text-dati-dark mb-4 leading-none tracking-tight">
              Central de <span className="text-dati-blue">Cases de Sucesso.</span>
            </h1>
            <p className="text-lg text-slate-500 mb-10 leading-relaxed font-medium">
              Acesse rapidamente os resultados que entregamos e use-os para impulsionar suas negociações.
            </p>
            
            <button
              onClick={loginWithGoogle}
              className="group flex items-center gap-3 bg-dati-dark text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-dati-blue transition-all shadow-xl shadow-dati-dark/10 active:scale-95"
            >
              Acessar plataforma
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-6 text-sm text-slate-400">Exclusivo para o time comercial da Dati.</p>
          </motion.div>
        </div>
        
        <div className="flex-1 bg-dati-dark relative overflow-hidden hidden md:flex items-center justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-20 bg-[radial-gradient(circle,at_center,_var(--color-dati-blue)_0%,transparent_70%)]" />
          <div className="relative z-10 text-white p-12 max-w-lg">
            <Quote icon={BookOpen} text="Cases de sucesso não são apenas histórias, são evidências do nosso compromisso com a excelência técnica." author="Time de Sucesso Dati" />
          </div>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-red-50 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black text-dati-dark mb-3 tracking-tight">Acesso Restrito</h2>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">
            Seu e-mail (<span className="text-dati-dark font-bold">{user.email}</span>) não está autorizado a acessar esta plataforma. 
            Contate um administrador para solicitar acesso.
          </p>
          <button
            onClick={logout}
            className="w-full py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Sair e trocar de conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-gray flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-dati-dark text-white shadow-xl shadow-dati-dark/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-dati-dark font-black text-xs">
              DATI
            </div>
            <h1 className="text-lg font-extrabold tracking-tight">Success Hub</h1>
          </div>

          <div className="flex items-center gap-4">
            {authProfile?.role === "admin" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Gerenciar Usuários"
                >
                  <Users size={18} />
                </button>
                <button
                  onClick={() => {
                    setEditingCase(null);
                    setIsAdminModalOpen(true);
                  }}
                  className="hidden sm:flex items-center gap-2 btn-primary"
                  style={{ backgroundColor: 'var(--color-dati-purple)' }}
                >
                  <Plus size={16} />
                  Novo Case
                </button>
              </div>
            )}
            
            <div className="h-6 w-[1px] bg-white/20" />
            
            <button
              onClick={logout}
              className="p-2 text-white/60 hover:text-dati-orange transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar / Filters */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <Filters
                allTags={allTags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Perfil de Acesso</p>
                <p className="text-sm font-bold text-dati-dark">{authProfile?.name}</p>
                <p className="text-xs font-medium text-slate-400 capitalize">{authProfile?.role === 'admin' ? 'Administrador' : 'Comercial (Viewer)'}</p>
              </div>

              {authProfile?.role === "admin" && (
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="sm:hidden w-full flex items-center justify-center gap-2 btn-primary"
                >
                  <Plus size={20} />
                  Criar Novo Case
                </button>
              )}
            </div>
          </aside>

          {/* Cases Grid */}
          <div className="lg:col-span-9">
            <div className="mb-8">
              <h2 className="text-xs font-black uppercase text-slate-400 mb-2 tracking-[0.2em]">Diretório de Cases</h2>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-extrabold text-dati-dark tracking-tight leading-none">
                  Explorar Resultados
                </h3>
              </div>
            </div>

            {casesLoading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-slate-200 animate-spin mb-4" />
                <p className="text-slate-400 font-medium tracking-tight">Carregando catálogo...</p>
              </div>
            ) : filteredCases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredCases.map((c) => (
                    <CaseCard
                      key={c.id}
                      caseData={c}
                      isAdmin={authProfile?.role === "admin"}
                      onEdit={(data) => {
                        setEditingCase(data);
                        setIsAdminModalOpen(true);
                      }}
                      onDelete={handleDeleteCase}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-20 bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                  <Search size={24} />
                </div>
                <h3 className="text-lg font-bold text-dati-dark mb-1">Nenhum case encontrado</h3>
                <p className="text-sm text-slate-400 font-medium">
                  Tente ajustar seus filtros ou busca.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} Dati Sucesso do Cliente. Uso estritamente interno.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-bold text-slate-500 hover:text-dati-blue">Suporte</a>
            <a href="#" className="text-xs font-bold text-slate-500 hover:text-dati-blue">Políticas</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setEditingCase(null);
        }}
        initialData={editingCase}
        onSave={handleSaveCase}
      />
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
    </div>
  );
}

function Quote({ icon: Icon, text, author }: { icon: any, text: string, author: string }) {
  return (
    <div className="space-y-6">
      <div className="w-12 h-12 bg-dati-blue rounded-2xl flex items-center justify-center">
        <Icon className="text-dati-dark" size={24} />
      </div>
      <p className="text-3xl font-light italic leading-snug">"{text}"</p>
      <div>
        <div className="h-[2px] w-12 bg-dati-green mb-2" />
        <p className="font-bold text-lg tracking-tight">{author}</p>
      </div>
    </div>
  );
}
