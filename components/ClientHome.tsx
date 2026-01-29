"use client";

import { useState, useEffect } from "react";
import { Tool } from "@/lib/data";
import { Modal } from "@/components/ui/modal";
import { Deconstructor } from "@/components/interactions/Deconstructor";
import { Architect } from "@/components/interactions/Architect";
import { Runway } from "@/components/interactions/Runway";
import { ToolDetails } from "@/components/interactions/ToolDetails";
import { AuthModal } from "@/components/interactions/AuthModal";
import { VaultModal } from "@/components/interactions/VaultModal";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

// Layout & Sections
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Featured } from "@/components/sections/Featured";
import { ToolGrid } from "@/components/sections/ToolGrid";

interface ClientHomeProps {
  initialTools: Tool[];
}

export default function ClientHome({ initialTools }: ClientHomeProps) {
  const [tools] = useState<Tool[]>(initialTools);
  const [search, setSearch] = useState("");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  // Modal State
  const [isDeconstructorOpen, setIsDeconstructorOpen] = useState(false);
  const [isArchitectOpen, setIsArchitectOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Async State
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  // --- Auth & Profile Logic ---
  const fetchProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchProfile(user.id);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Filtering Logic ---
  const categories = Array.from(new Set(tools.flatMap(t => t.tags)));
  const filteredTools = tools.filter(tool => {
    if (!search) return true;
    const term = search.toLowerCase();
    return tool.name.toLowerCase().includes(term) ||
      tool.description.toLowerCase().includes(term) ||
      tool.tags.some(t => t.toLowerCase().includes(term));
  });

  // --- Admin Logic ---
  const handleSyncCurator = async () => {
    const password = prompt("Enter ADMIN_SECRET to initiate Curator Protocol:");
    if (!password) return;

    setIsSyncing(true);
    try {
      const res = await fetch('/api/curate', {
        method: 'POST',
        headers: {
          'x-admin-secret': password
        }
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Curator failed:", res.status, res.statusText, errorData);
        alert(`Curator Failed: ${errorData.message || errorData.details || "Unauthorized"}`);
      }
    } catch (e) {
      console.error("Network Error:", e);
      alert("Network Error: Could not reach Curator API.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">

      <Header
        user={user}
        profile={profile}
        onOpenArchitect={() => setIsArchitectOpen(true)}
        onOpenDeconstructor={() => setIsDeconstructorOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        setSearch={setSearch}
        categories={categories}
      />

      <div className="relative z-10">
        <Hero />
        <Featured />

        {/* The Runway (Horizontal Scroll) */}
        <section id="runway" className="relative z-20">
          <Runway />
        </section>

        <ToolGrid
          tools={filteredTools}
          onSelect={setSelectedTool}
        />

        <Footer
          isSyncing={isSyncing}
          onSync={handleSyncCurator}
        />
      </div>

      {/* --- Modals Layer --- */}

      <Modal isOpen={!!selectedTool} onClose={() => setSelectedTool(null)}>
        {selectedTool && <ToolDetails tool={selectedTool} />}
      </Modal>

      <Modal
        isOpen={isDeconstructorOpen}
        onClose={() => setIsDeconstructorOpen(false)}
        className="max-w-[90vw] h-[90vh] p-0 border-0 bg-transparent shadow-none"
      >
        <Deconstructor onClose={() => setIsDeconstructorOpen(false)} />
      </Modal>

      <Modal
        isOpen={isArchitectOpen}
        onClose={() => setIsArchitectOpen(false)}
        className="max-w-[90vw] h-[90vh] p-0 border-0 bg-transparent shadow-none"
      >
        <Architect onClose={() => setIsArchitectOpen(false)} />
      </Modal>

      <Modal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        className="max-w-[90vw] h-[90vh] p-0 border-0 bg-transparent shadow-none"
      >
        <VaultModal onClose={() => setIsVaultOpen(false)} />
      </Modal>

      <Modal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        className="p-0 border-0 bg-transparent shadow-none w-auto h-auto"
      >
        <AuthModal onClose={() => setIsAuthOpen(false)} />
      </Modal>

    </main >
  );
}
