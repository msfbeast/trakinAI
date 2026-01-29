
import { promises as fs } from 'fs';
import path from 'path';
import { supabase } from './supabase';

export type Platform = 'github' | 'huggingface' | 'web' | 'other';

export interface Tool {
  id: string;
  name: string;
  description: string;
  tags: string[];
  pricing: 'Free' | 'Freemium' | 'Paid';
  platforms: {
    type: Platform;
    url: string;
  }[];
  image?: string;
  featured?: boolean;
  created_at?: string; // Optional because local JSON doesn't always have it
}

const DB_PATH = path.join(process.cwd(), 'lib/db.json');

export async function getTools(): Promise<Tool[]> {
  // 1. Try Supabase
  if (supabase) {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as Tool[];
    }
    // If error (e.g., table doesn't exist yet but env key is there), log and fall back
    console.warn("Supabase Fetch Error (falling back to local):", error.message);
  }

  // 2. Fallback to Local JSON
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read tools DB:", error);
    return [];
  }
}

export async function saveTools(newTools: Tool[]) {
  // 1. Try Supabase
  if (supabase) {
    const { error } = await supabase
      .from('tools')
      .upsert(newTools, { onConflict: 'id' });

    if (error) {
      console.error("Supabase Save Error:", error.message);
      // Fallback allowed? Maybe we should throw here to alert the user.
      // But for "Curator", let's dual-write if possible or just fallback.
    } else {
      console.log("Saved to Supabase");
      return; // Success
    }
  }

  // 2. Fallback to Local JSON (Dual Write or Primary if Supabase missing)
  try {
    // Note: saveTools usually writes the WHOLE list in the JSON implementation.
    // Ensure the caller is passing the full list if we are using JSON file overwrite.
    // But for Supabase upsert, we might only pass new ones.
    // The current Curator usage passes the *merged* list.
    // So writing to file is safe.
    await fs.writeFile(DB_PATH, JSON.stringify(newTools, null, 2));
    console.log("Saved to local JSON");
  } catch (error) {
    console.error("Failed to save to local DB:", error);
  }
}

// Keep a helper for categories
export const categories = async () => {
  const t = await getTools();
  return Array.from(new Set(t.flatMap(tool => tool.tags)));
}
