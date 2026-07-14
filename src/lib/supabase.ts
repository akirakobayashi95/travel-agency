import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// Supabase client singletons.
// - Server (service_role): dành cho API routes, bỏ qua RLS, thực thi RPC.
// - Browser (anon): dành cho client component (nếu cần fetch public data).
// Không hardcode key; luôn lấy từ env (đã khai báo trên Netlify).
//
// Quan trọng: client được khởi tạo LAZY (tại lấn gọi đầu tiên), không phải
// ở import time. Điều này tránh Next.js báo "supabaseUrl is required"
// khi collect page data ở build (env chưa có lúc build).
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function createServerClient(): SupabaseClient {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY (env)",
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Lazy singleton (cache trên global để tái sử dụng connection).
const globalForSupabase = globalThis as unknown as {
  supabaseServer: SupabaseClient | undefined;
};

export const supabaseServer: SupabaseClient = new Proxy(
  {} as SupabaseClient,
  {
    get(_t, prop, receiver) {
      if (!globalForSupabase.supabaseServer) {
        globalForSupabase.supabaseServer = createServerClient();
      }
      const client = globalForSupabase.supabaseServer;
      const value = Reflect.get(client as object, prop, receiver);
      return typeof value === "function" ? value.bind(client) : value;
    },
  },
) as SupabaseClient;

// ----- Browser client (dùng trong client component) -----
export function getBrowserSupabase(): SupabaseClient {
  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY (env)",
    );
  }
  return createClient(supabaseUrl, anonKey);
}