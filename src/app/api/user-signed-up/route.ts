import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = body.record?.id;

  if (!userId) {
    console.error("userId bulunamadı:", body);
    return new Response(JSON.stringify({ status: "error", message: "userId not found" }), {
      status: 400,
    });
  }

const id = randomUUID();

const { error } = await supabase
  .from("userRoles")
  .insert({
    id,
    userId,
    roleId: "3519238b-0ff7-4aff-9989-5bf3c57a3aa2",
  });
  if (error) {
    console.error("Supabase insert hatası:", error);
    return new Response(JSON.stringify({ status: "error", error }), { status: 500 });
  }

  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
