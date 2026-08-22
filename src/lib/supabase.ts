import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Usa createBrowserClient (não createClient) para que a sessão seja
// armazenada em cookies em vez de localStorage. Isso é essencial para
// que o middleware (que roda no servidor) consiga ler a sessão do
// usuário e proteger as rotas /admin corretamente.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
