
/* PORTFÓLIO ANA LAURA - SUPABASE */

const SUPABASE_URL = "https://alzebirqbhxecbqgcihu.supabase.co";

const SUPABASE_KEY = "sb_publishable_4UpuzVQxnsT4__guSriaNg_Nt6PVNM3";

let supabaseApp = null;

// CONEXÃO
if (window.supabase) {
    supabaseApp = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
}

// LOGIN
async function fazerLogin(email, senha) {

    if (!supabaseApp) {
        throw new Error("Biblioteca do Supabase não carregada.");
    }

    const { data, error } = await supabaseApp.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) {
        throw new Error(error.message);
    }

    // VERIFICAR ADMINISTRADOR
    const autorizado = data.user.app_metadata?.role === "admin";

    if (!autorizado) {
        await supabaseApp.auth.signOut();

        throw new Error(
            "E-mail e senha aceitos, mas falta autorização de administrador no Supabase."
        );
    }

    return data;
}

// VERIFICAR ACESSO
async function verificarAdministrador() {

    if (!supabaseApp) return false;

    const { data, error } = await supabaseApp.auth.getUser();

    if (error || !data.user) return false;

    return data.user.app_metadata?.role === "admin";
}

// SAIR
async function fazerLogout() {

    if (!supabaseApp) return;

    await supabaseApp.auth.signOut();

    window.location.href = "login.html";
}

// DISPONIBILIZAR FUNÇÕES
window.supabaseApp = {
    client: supabaseApp,
    fazerLogin,
    verificarAdministrador,
    fazerLogout
};





