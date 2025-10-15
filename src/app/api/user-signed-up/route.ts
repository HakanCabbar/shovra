import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body;
  const userId = body.user.id;

  await supabase.from("user_roles").insert({ userId, roleId: "3519238b-0ff7-4aff-9989-5bf3c57a3aa2" });

  res.status(200).json({ status: "ok" });
}
