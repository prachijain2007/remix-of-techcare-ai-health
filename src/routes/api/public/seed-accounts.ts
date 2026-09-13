import { createFileRoute } from "@tanstack/react-router";

const ACCOUNTS = [
  { email: "doctor1@techcare.ai", password: "Pass@123", name: "Dr. Anita Rao", role: "doctor" },
  { email: "doctor2@techcare.ai", password: "Pass@456", name: "Dr. Vikram Shah", role: "doctor" },
  { email: "doctor3@techcare.ai", password: "Pass@789", name: "Dr. Meera Nair", role: "doctor" },
  { email: "patient1@techcare.ai", password: "Patient@123", name: "Patient One", role: "patient" },
  { email: "patient2@techcare.ai", password: "Patient@456", name: "Patient Two", role: "patient" },
  { email: "patient3@techcare.ai", password: "Patient@789", name: "Patient Three", role: "patient" },
];

export const Route = createFileRoute("/api/public/seed-accounts")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const results: string[] = [];
        const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
        for (const acct of ACCOUNTS) {
          let user = list?.users.find((u) => u.email === acct.email) ?? null;
          if (!user) {
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
              email: acct.email,
              password: acct.password,
              email_confirm: true,
              user_metadata: { full_name: acct.name },
            });
            if (error) {
              results.push(`${acct.email}: ${error.message}`);
              continue;
            }
            user = data.user;
          }
          if (!user) continue;
          await supabaseAdmin
            .from("user_roles")
            .upsert({ user_id: user.id, role: acct.role as "doctor" | "patient" }, { onConflict: "user_id,role" });
          await supabaseAdmin
            .from("profiles")
            .upsert({ user_id: user.id, full_name: acct.name, email: acct.email }, { onConflict: "user_id" });
          results.push(`${acct.email}: ok`);
        }
        return Response.json({ results });
      },
    },
  },
});
