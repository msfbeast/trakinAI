
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Tool } from "@/lib/data";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    try {
        const secret = req.headers.get("x-admin-secret");
        if (secret !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const newTool: Tool = body; // Validation optional here for speed

        // 1. Insert into Supabase
        const { data, error } = await supabase
            .from("tools")
            .insert([newTool])
            .select();

        if (error) {
            console.error("Supabase Insert Error:", error);
            // Fallback? If Supabase fails, we usually fail.
            // But for now let's return error.
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, tool: data ? data[0] : newTool });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
