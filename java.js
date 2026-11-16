
/* =========================================
   PORTFÓLIO ANA LAURA
   CONEXÃO E AUTENTICAÇÃO SUPABASE
========================================= */

// 1. CONFIGURAÇÃO DO SUPABASE

const SUPABASE_URL = "https://alzebirqbhxecbqgcihu.supabase.co";

const SUPABASE_KEY = "sb_publishable_4UpuzVQxnsT4__guSriaNg_Nt6PVNM3";

// 2. INICIALIZAR CONEXÃO

let supabaseApp = null;

if (window.supabase) {
    supabaseApp = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    console.log("Supabase conectado com sucesso!");
} else {
    console.error("A biblioteca do Supabase não foi carregada.");
}

// 3. FAZER LOGIN

async function fazerLogin(email, senha) {

    if (!supabaseApp) {
        throw new Error("Não foi possível conectar ao Supabase.");
    }

    const { data, error } = await supabaseApp.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) {
        throw new Error("E-mail ou senha incorretos.");
    }

    // Conferir se é administrador
    const autorizado = await verificarAdministrador();

    if (!autorizado) {
        await supabaseApp.auth.signOut();

        throw new Error(
            "Sua conta não possui autorização de administrador."
        );
    }

    return data;
}

// 4. VERIFICAR ADMINISTRADOR

async function verificarAdministrador() {

    if (!supabaseApp) {
        return false;
    }

    const { data, error } = await supabaseApp.auth.getUser();

    if (error || !data.user) {
        return false;
    }

    // Verificar a função administrativa
    return data.user.app_metadata?.role === "admin";
}

// 5. FAZER LOGOUT

async function fazerLogout() {

    if (!supabaseApp) {
        throw new Error("Supabase não está conectado.");
    }

    const { error } = await supabaseApp.auth.signOut();

    if (error) {
        throw error;
    }

    window.location.href = "login.html";
}

// 6. DISPONIBILIZAR FUNÇÕES

window.supabaseApp = {
    client: supabaseApp,
    fazerLogin,
    verificarAdministrador,
    fazerLogout
};

// 7. ATUALIZAR ANO DO RODAPÉ

document.addEventListener("DOMContentLoaded", function () {

    const rodape = document.querySelector("footer p");

    if (rodape) {
        rodape.textContent =
            `© ${new Date().getFullYear()} Ana Laura Lopes. Todos os direitos reservados.`;
    }

});



