
/* =====================================
   PORTFÓLIO ANA LAURA
   CONEXÃO COM SUPABASE
===================================== */

const SUPABASE_URL = "https://alzebirqbhxecbqgcihu.supabase.co";

const SUPABASE_KEY = "sb_publishable_4UpuzVQxnsT4__guSriaNg_Nt6PVNM3";

// Inicializar Supabase
let supabaseApp = null;

try {

    if (!window.supabase) {
        throw new Error("Biblioteca do Supabase não carregada.");
    }

    supabaseApp = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    console.log("Supabase inicializado!");

} catch (erro) {
    console.error("Erro na conexão:", erro);
}

// Fazer login
async function fazerLogin(email, senha) {

    if (!supabaseApp) {
        throw new Error("Não foi possível conectar ao Supabase.");
    }

    const { data, error } = await supabaseApp.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) {
        throw new Error("Erro no login: " + error.message);
    }

    // Verificar autorização administrativa
    const autorizado =
        data.user.app_metadata?.role === "admin";

    if (!autorizado) {

        await supabaseApp.auth.signOut();

        throw new Error(
            "Login realizado, mas sua conta não possui autorização de administrador."
        );
    }

    return data;
}

// Verificar administrador
async function verificarAdministrador() {

    if (!supabaseApp) {
        return false;
    }

    const { data, error } = await supabaseApp.auth.getUser();

    if (error || !data.user) {
        return false;
    }

    return data.user.app_metadata?.role === "admin";
}

// Sair do painel
async function fazerLogout() {

    if (!supabaseApp) {
        throw new Error("Supabase não conectado.");
    }

    const { error } = await supabaseApp.auth.signOut();

    if (error) {
        throw error;
    }

    window.location.href = "login.html";
}

// Disponibilizar funções
window.supabaseApp = {
    client: supabaseApp,
    fazerLogin,
    verificarAdministrador,
    fazerLogout
};




