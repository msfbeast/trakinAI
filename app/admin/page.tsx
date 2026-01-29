"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tool } from "@/lib/data";
import { Trash2, Plus, Lock, Search, ExternalLink, Zap, Sparkles, RefreshCw, Link as LinkIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { FlashlightCard } from "@/components/ui/FlashlightCard";

// Explicit type matches the Tool interface
type PricingType = "Free" | "Freemium" | "Paid";

export default function AdminPage() {
    // Auth State
    const [secret, setSecret] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Data State
    const [tools, setTools] = useState<Tool[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("");

    // Form State
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [newTags, setNewTags] = useState("");
    const [newPricing, setNewPricing] = useState<PricingType>("Free");
    const [autoFillUrl, setAutoFillUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const supabase = createClient();

    const fetchTools = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from("tools")
            .select("*")
            .order("created_at", { ascending: false });

        if (data) setTools(data as Tool[]);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTools();
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple client-side gate; real security is on the API
        if (secret.length > 5) setIsAuthenticated(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newUrl) return;

        const newTool: Tool = {
            id: uuidv4(),
            name: newName,
            description: newDesc,
            tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
            pricing: newPricing,
            platforms: [{ type: "web", url: newUrl }],
            featured: false,
        };

        const res = await fetch("/api/tools/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-secret": secret
            },
            body: JSON.stringify(newTool)
        });

        if (res.ok) {
            alert("Tool Deployed Successfully");
            setNewName("");
            setNewDesc("");
            setNewUrl("");
            setNewTags("");
            fetchTools();
        } else {
            alert("Deploy Failed. Check Secret.");
        }
    };

    const handleAutoFill = async () => {
        if (!autoFillUrl) return;
        setIsAnalyzing(true);

        try {
            const res = await fetch("/api/tools/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: autoFillUrl })
            });

            if (res.ok) {
                const data = await res.json();
                const tool = data.tool;

                setNewName(tool.name);
                setNewDesc(tool.description);
                setNewUrl(tool.platforms[0]?.url || autoFillUrl);
                setNewTags(tool.tags.join(", "));
                setNewPricing(tool.pricing);
                setAutoFillUrl("");
            } else {
                const error = await res.text();
                alert(`Auto-fill failed: ${error}`);
            }
        } catch (error) {
            alert(`Auto-fill error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleEnrich = async (toolId: string) => {
        const tool = tools.find(t => t.id === toolId);
        if (!tool || !tool.platforms[0]?.url) return;

        setIsAnalyzing(true);
        try {
            const res = await fetch("/api/tools/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: tool.platforms[0].url })
            });

            if (res.ok) {
                const data = await res.json();
                const enrichedTool = { ...tool, ...data.tool, id: tool.id };

                // Update in Supabase
                const { error } = await supabase
                    .from("tools")
                    .update(enrichedTool)
                    .eq("id", toolId);

                if (!error) {
                    alert("Tool enriched successfully!");
                    fetchTools();
                } else {
                    alert(`Failed to update tool: ${error.message}`);
                }
            } else {
                alert("Enrichment failed");
            }
        } catch (error) {
            alert(`Enrichment error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsAnalyzing(false);
        }
    };


    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;

        const res = await fetch(`/api/tools/delete?id=${id}`, {
            method: "DELETE",
            headers: { "x-admin-secret": secret }
        });

        if (res.ok) {
            setTools(tools.filter(t => t.id !== id));
        } else {
            alert("Delete Failed. Unauthorized.");
        }
    };


    const filteredTools = tools.filter(t =>
        t.name.toLowerCase().includes(filter.toLowerCase()) ||
        t.description.toLowerCase().includes(filter.toLowerCase())
    );

    // No-op handlers for Header props (since we are in Admin mode)
    const noop = () => { };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4 selection:bg-zinc-900 selection:text-white">
                <FlashlightCard className="w-full max-w-sm bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-zinc-900/20">
                            <Lock className="w-8 h-8" />
                        </div>
                    </div>
                    <h1 className="text-center text-3xl font-black tracking-tighter mb-2 text-zinc-900">ADMIN ACCESS</h1>
                    <p className="text-center text-xs font-bold text-zinc-400 mb-8 uppercase tracking-widest">Protocol Verification Required</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            placeholder="ENTER SECRET KEY"
                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all font-bold text-center tracking-widest placeholder:text-zinc-300"
                        />
                        <Button type="submit" className="w-full h-14 rounded-xl text-sm font-black bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10 uppercase tracking-widest">
                            Authenticate
                        </Button>
                    </form>
                </FlashlightCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
            <Header
                user={null}
                profile={null}
                onOpenArchitect={noop}
                onOpenDeconstructor={noop}
                onOpenVault={noop}
                onOpenAuth={noop}
                showFilters={false}
                setShowFilters={noop}
                setSearch={noop}
                categories={[]}
            />

            <main className="pt-32 pb-24 px-6 lg:px-12 max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* LEFT: CREATE TOOL FORM */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="sticky top-32">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-zinc-900/20">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter text-zinc-900 leading-none">DEPLOY</h2>
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1">Add New Tool Resource</p>
                            </div>
                        </div>

                        <FlashlightCard className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <Zap className="w-32 h-32" />
                            </div>

                            {/* Auto-Fill from URL */}
                            <div className="relative z-10 mb-6 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl border border-violet-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4 text-violet-600" />
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-violet-600">Auto-Fill from URL</label>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        value={autoFillUrl}
                                        onChange={e => setAutoFillUrl(e.target.value)}
                                        className="flex-1 bg-white border border-violet-200 p-3 rounded-xl text-zinc-900 font-mono text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-violet-300"
                                        placeholder="https://example.com"
                                        disabled={isAnalyzing}
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAutoFill}
                                        disabled={!autoFillUrl || isAnalyzing}
                                        className="px-4 h-12 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 shadow-lg shadow-violet-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-violet-600 mt-2 font-medium">Paste any AI tool URL to auto-generate details</p>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-zinc-400">Tool Name</label>
                                    <input
                                        value={newName} onChange={e => setNewName(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-xl text-zinc-900 font-bold text-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-300"
                                        placeholder="e.g. Gemini 2.0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-zinc-400">Description</label>
                                    <textarea
                                        value={newDesc} onChange={e => setNewDesc(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-xl text-zinc-900 font-medium outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all h-32 resize-none leading-relaxed placeholder:text-zinc-300"
                                        placeholder="Enter a comprehensive description..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-zinc-400">Target URL</label>
                                    <input
                                        value={newUrl} onChange={e => setNewUrl(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-xl text-zinc-900 font-mono text-sm outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-300"
                                        placeholder="https://"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-zinc-400">Tags</label>
                                        <input
                                            value={newTags} onChange={e => setNewTags(e.target.value)}
                                            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-xl text-zinc-900 font-bold text-sm outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-300"
                                            placeholder="AI, 3D..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-zinc-400">Pricing</label>
                                        <select
                                            value={newPricing} onChange={e => setNewPricing(e.target.value as PricingType)}
                                            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-xl text-zinc-900 font-bold text-sm outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all appearance-none cursor-pointer hover:bg-zinc-100"
                                        >
                                            <option value="Free">Free</option>
                                            <option value="Freemium">Freemium</option>
                                            <option value="Paid">Paid</option>
                                        </select>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-16 bg-zinc-900 text-white text-sm font-black rounded-xl mt-4 hover:bg-zinc-800 shadow-xl shadow-zinc-900/20 tracking-widest uppercase transition-transform active:scale-95">
                                    Deploy Asset
                                </Button>
                            </form>
                        </FlashlightCard>
                    </div>
                </div>

                {/* RIGHT: INVENTORY LIST (Matches ToolGrid List View) */}
                <div className="lg:col-span-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        <div>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-zinc-900 mb-4">
                                INVENTORY
                            </h2>
                            <p className="text-zinc-500 font-medium text-lg">
                                {tools.length} assets in database
                            </p>
                        </div>

                        <div className="relative group w-full md:w-auto">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                            <input
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                placeholder="Search assets..."
                                className="w-full md:w-80 bg-zinc-100 border-transparent rounded-full pl-12 pr-6 py-3 text-sm font-bold focus:bg-white focus:border-zinc-200 focus:ring-4 focus:ring-zinc-100 outline-none transition-all placeholder:text-zinc-400"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {isLoading ? (
                            <div className="p-12 text-center text-zinc-400 animate-pulse font-black tracking-widest uppercase text-sm border-2 border-dashed border-zinc-100 rounded-[2rem]">
                                Syncing Database...
                            </div>
                        ) : filteredTools.map(tool => (
                            <div
                                key={tool.id}
                                className="group flex items-center justify-between p-6 bg-white border border-zinc-100 rounded-[2rem] hover:border-zinc-900 transition-all shadow-sm hover:shadow-xl hover:shadow-zinc-200/50"
                            >
                                <div className="flex items-center gap-6 flex-1 min-w-0">
                                    <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0 text-2xl font-black text-zinc-300 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                                        {/* Icon Fallback */}
                                        {tool.name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-black text-zinc-900 tracking-tight truncate">{tool.name}</h3>
                                            <div className="flex gap-1 shrink-0">
                                                {tool.pricing === 'Free' && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-wider rounded-full">Free</span>}
                                                {tool.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[9px] font-black uppercase tracking-wider rounded-full border border-zinc-200">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                            <a href={tool.platforms[0]?.url} target="_blank" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                                <ExternalLink className="w-3 h-3" />
                                                {new URL(tool.platforms[0]?.url || 'http://localhost').hostname}
                                            </a>
                                            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                            <span>{tool.created_at ? new Date(tool.created_at).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>


                                <button
                                    onClick={() => handleDelete(tool.id)}
                                    className="ml-2 w-12 h-12 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all hover:rotate-12 hover:scale-110 shadow-sm shrink-0"
                                    title="Delete Tool"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleEnrich(tool.id)}
                                    disabled={isAnalyzing}
                                    className="ml-2 w-12 h-12 flex items-center justify-center rounded-full bg-violet-50 text-violet-600 hover:bg-violet-500 hover:text-white transition-all hover:scale-110 shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Enrich Tool"
                                >
                                    {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                </button>

                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer isSyncing={false} onSync={() => { }} />
        </div>
    );
}
