"use client";

import { useState } from "react";
import { Tool } from "@/lib/data";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { TextReveal } from "@/components/ui/TextReveal";
import { InfiniteMarquee } from "@/components/ui/InfiniteMarquee";
import { FlashlightCard } from "@/components/ui/FlashlightCard";
import { Search, Globe, MoveUpRight, Filter, ArrowRight, X, ExternalLink, Zap, RefreshCw, LayoutGrid, List as ListIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Deconstructor } from "@/components/interactions/Deconstructor";
import { Architect } from "@/components/interactions/Architect";
import { Runway } from "@/components/interactions/Runway";
import { ToolDetails } from "@/components/interactions/ToolDetails";

interface ClientHomeProps {
  initialTools: Tool[];
}

export default function ClientHome({ initialTools }: ClientHomeProps) {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [search, setSearch] = useState("");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isDeconstructorOpen, setIsDeconstructorOpen] = useState(false);
  const [isArchitectOpen, setIsArchitectOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Derive categories from the current tools state
  const categories = Array.from(new Set(tools.flatMap(t => t.tags)));

  // Filter tools
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
      tool.description.toLowerCase().includes(search.toLowerCase());

    // If search is empty, filter by tags if a tag is clicked (we can reuse search for this or add a separate filter state)
    // For simplicity in this "Index" model, let's keep it Search-driven. 
    // If the category pill is clicked, we sets search to that tag.
    return matchesSearch;
  });

  const handleCuratorSync = async () => {
    const password = window.prompt("Enter ADMIN_SECRET to initiate Curator Protocol:");
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

      {/* 1. Header Navigation */}
      <nav className="fixed z-50 top-0 inset-x-0 h-20 border-b border-zinc-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-12">
        <div className="text-xl font-black tracking-tighter" role="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          TRAKIN.AI
        </div>

        <div className="hidden md:flex items-center p-1 bg-zinc-100/80 backdrop-blur-md rounded-full border border-zinc-200/50">
          <a href="#featured" className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:bg-white hover:shadow-sm transition-all">Featured</a>
          <a href="#runway" className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:bg-white hover:shadow-sm transition-all">Runway</a>
          <a href="#collection" className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:bg-white hover:shadow-sm transition-all">Collection</a>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsArchitectOpen(true)}
            variant="ghost"
            className="hidden sm:flex text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-blue-600 transition-colors gap-2"
          >
            [ Architect ]
          </Button>
          <Button
            onClick={() => setIsDeconstructorOpen(true)}
            variant="ghost"
            className="hidden sm:flex text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-green-600 transition-colors gap-2"
          >
            [ Deconstructor ]
          </Button>
          <Button
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-full transition-colors ${showFilters ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-900 text-white hover:bg-zinc-700'}`}
          >
            {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
          </Button>
        </div>
      </nav>

      {/* Filter Overlay */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100 py-8 px-6 lg:px-12 shadow-lg"
          >
            <div className="max-w-[1600px] mx-auto">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Filter by Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSearch(cat);
                      setShowFilters(false);
                      document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-bold uppercase tracking-widest hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all"
                  >
                    {cat}
                  </button>
                ))}
                <button
                  onClick={() => { setSearch(""); setShowFilters(false); }}
                  className="px-4 py-2 rounded-full border border-red-100 bg-red-50 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all ml-auto"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Hero Section */}
      <section className="relative pt-48 pb-32 px-6 lg:px-12 max-w-[1600px] mx-auto min-h-[90vh] flex flex-col justify-center">
        <div className="space-y-4">
          <div className="overflow-hidden">
            <TextReveal
              text="TRAKIN.AI™"
              className="text-[12vw] leading-[0.8] font-black tracking-tighter text-zinc-900"
              duration={0.8}
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-xl md:text-3xl font-medium text-zinc-500 max-w-2xl mt-8 tracking-tight"
          >
            Defining tomorrow's toolset. <br />
            The curated index of high-performance AI.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
          className="mt-16 w-fit relative group cursor-pointer"
          onClick={() => {
            document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <div className="relative rounded-full border border-zinc-200 bg-white px-8 py-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg flex items-center gap-3 overflow-hidden">
            <span className="relative z-10 text-sm font-bold uppercase tracking-widest">Explore Collection</span>
            <ArrowRight className="relative z-10 w-4 h-4" />
            <BorderBeam size={100} duration={8} delay={4} />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
        </motion.div>
      </section>

      {/* 3. Infinite Marquee Strip */}
      <section className="py-20 border-y border-zinc-100 bg-zinc-50/50 overflow-hidden">
        <InfiniteMarquee speed="slow">
          {tools.map((tool, i) => (
            <div key={i} className="mx-8 flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="w-12 h-12 bg-zinc-200 rounded-full animate-pulse" />
              <span className="text-3xl font-black text-zinc-300 tracking-tighter uppercase">{tool.name}</span>
            </div>
          ))}
        </InfiniteMarquee>
      </section>

      {/* 4. The Collection (Grid) */}
      <section id="collection" className="py-32 px-6 lg:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6">The Index</h2>
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search model, style, capability..."
                className="pl-12 h-14 rounded-full border-zinc-200 bg-zinc-50 focus:bg-white text-lg transition-all"
              />
            </div>
          </div>


          <div className="flex gap-4 items-center">
            <div className="flex bg-zinc-100 p-1 rounded-full border border-zinc-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 hidden sm:inline-block">
              {filteredTools.length} UNITS
            </span>
          </div>
        </div>

        <motion.div
          layout
          className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            : "flex flex-col gap-4"
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool) => (
              viewMode === 'grid' ? (
                <ToolCardWithPreview key={tool.id} tool={tool} onClick={() => setSelectedTool(tool)} />
              ) : (
                <ToolListItem key={tool.id} tool={tool} onClick={() => setSelectedTool(tool)} />
              )
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ... rest of sections ... */}





      {/* 5. Parallax Imagery */}
      <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center bg-zinc-900 text-white">
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2874&auto=format&fit=crop')] bg-cover bg-center bg-fixed filter grayscale contrast-125" />
        </div>

        <div className="relative z-10 text-center space-y-8">
          <h2 className="text-6xl md:text-9xl font-black tracking-tighter">
            VISUAL <br /> INTELLIGENCE
          </h2>
          <Button
            onClick={() => setIsDeconstructorOpen(true)}
            className="h-16 px-10 text-lg font-bold uppercase tracking-widest bg-white text-black hover:bg-zinc-200 rounded-none border border-transparent hover:border-white transition-all"
          >
            Launch Deconstructor
          </Button>
        </div>
      </section>

      {/* 6. The Runway */}
      <Runway />

      {/* 7. Footer */}
      <footer className="py-20 px-6 lg:px-12 border-t border-zinc-200 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div>
            <h3 className="text-2xl font-black tracking-tighter mb-4">TRAKIN.AI™</h3>
            <p className="text-zinc-400 text-sm max-w-sm">
              Curating the bleeding edge of artificial intelligence tools for builders, designers, and dreamers.
            </p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="flex gap-8 text-sm font-bold uppercase tracking-widest text-zinc-900">
              <a href="#" className="hover:text-zinc-600">Twitter</a>
              <a href="#" className="hover:text-zinc-600">Github</a>
              <a href="#" className="hover:text-zinc-600">Discord</a>
            </div>
            {/* Curator Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCuratorSync}
              disabled={isSyncing}
              className="text-xs font-bold uppercase tracking-widest border-zinc-200 text-zinc-400 hover:text-zinc-900 hover:border-zinc-900"
            >
              <RefreshCw className={`w-3 h-3 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? "SYNCING..." : "INIT CURATOR PROTOCOL"}
            </Button>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-zinc-100 text-xs font-medium text-zinc-400 flex justify-between uppercase tracking-widest">
          <span>© 2026 Trakin Labs</span>
          <span>System Status: Online</span>
        </div>
      </footer>

      {/* Modals */}
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

    </main >
  );
}

// Extracted Component for Preview Logic
function ToolCardWithPreview({ tool, onClick }: { tool: Tool, onClick: () => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const webUrl = tool.platforms.find(p => p.type === 'web')?.url;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="cursor-pointer group relative"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.preview-toggle')) return;
        onClick();
      }}
    >
      <FlashlightCard className="h-[380px] flex flex-col justify-between p-6 hover:shadow-2xl transition-shadow duration-500 border-2 border-zinc-900 rounded-[2rem]">
        <div className={`transition-opacity duration-300 ${showPreview ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex justify-between items-start mb-6">
            <span className="px-3 py-1 rounded-full border border-zinc-200 text-[9px] font-bold uppercase tracking-widest bg-zinc-50/50">
              {tool.pricing}
            </span>
            {tool.featured && (
              <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <h3 className="text-3xl font-bold tracking-tighter mb-3">{tool.name}</h3>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed line-clamp-3">
            {tool.description}
          </p>
        </div>

        {showPreview && webUrl && (
          <div className="absolute inset-4 bg-white rounded-[1.5rem] border border-zinc-200 overflow-hidden shadow-inner z-20 flex flex-col">
            <div className="h-8 bg-zinc-100 flex items-center justify-between px-3 border-b border-zinc-200">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="text-[8px] uppercase tracking-widest text-zinc-400 truncate max-w-[100px]">
                {webUrl.replace('https://', '')}
              </div>
              <a href={webUrl} target="_blank" className="text-[8px] font-bold uppercase tracking-widest text-zinc-900 hover:text-blue-600">
                [ Open ]
              </a>
            </div>

            <div className="relative flex-grow w-full bg-zinc-50">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-0">
                <p className="text-xs font-bold text-zinc-400 mb-2">PREVIEW LOADING...</p>
                <p className="text-[10px] text-zinc-300 max-w-[150px] leading-tight">
                  If blank, {tool.name} blocks embedded previews. Use the [OPEN] button.
                </p>
              </div>

              <iframe
                src={webUrl}
                className="absolute inset-0 w-full h-full z-10"
                style={{ border: 'none' }}
                title={`${tool.name} Preview`}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-zinc-100 mt-auto z-30">
          <div className="flex gap-2">
            {tool.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {webUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPreview(!showPreview);
                }}
                className="preview-toggle w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 text-zinc-600 transition-colors"
                title="Toggle Live Preview"
              >
                {showPreview ? (
                  <div className="w-2.5 h-2.5 bg-zinc-900 rounded-[1px]" />
                ) : (
                  <Globe className="w-3.5 h-3.5" />
                )}
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <MoveUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </FlashlightCard >
    </motion.div >
  );
}

function ToolListItem({ tool, onClick }: { tool: Tool, onClick: () => void }) {
  const webUrl = tool.platforms.find(p => p.type === 'web')?.url;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={onClick}
      className="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-white border border-zinc-100 hover:border-zinc-900 rounded-3xl cursor-pointer transition-all hover:shadow-lg gap-4"
    >
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 font-bold text-xl uppercase">
          {tool.name.substring(0, 2)}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-bold tracking-tight">{tool.name}</h3>
            <span className="px-2 py-0.5 rounded-full border border-zinc-200 text-[9px] font-bold uppercase tracking-widest bg-zinc-50">
              {tool.pricing}
            </span>
          </div>
          <p className="text-sm text-zinc-500 font-medium max-w-xl line-clamp-1">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between w-full md:w-auto gap-4 md:pl-0 pl-[4.5rem]">
        <div className="flex gap-2">
          {tool.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              #{tag}
            </span>
          ))}
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-50 text-zinc-900 border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
          <MoveUpRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}
