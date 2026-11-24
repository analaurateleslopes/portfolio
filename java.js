/* ==========================================
   PORTFÓLIO ANA LAURA
   CONEXÃO E GERENCIAMENTO SUPABASE
========================================== */

const SUPABASE_URL = "https://alzebirqbhxecbqgcihu.supabase.co";
const SUPABASE_KEY = "sb_publishable_4UpuzVQxnsT4__guSriaNg_Nt6PVNM3";

// Número sem espaços para funcionar corretamente no link wa.me
const MEU_WHATSAPP = "5533999855969";

let supabaseApp = null;

// ==========================================
// 1. CONEXÃO COM SUPABASE
// ==========================================

if (window.supabase) {
    supabaseApp = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
}

// ==========================================
// 2. LOGIN
// ==========================================

async function fazerLogin(email, senha) {
    if (!supabaseApp) {
        throw new Error("Biblioteca do Supabase não carregada.");
    }

    const { data, error } = await supabaseApp.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) throw new Error(error.message);

    const autorizado = data.user.app_metadata?.role === "admin";

    if (!autorizado) {
        await supabaseApp.auth.signOut();
        throw new Error("Você não possui autorização de administrador.");
    }

    return data;
}

// ==========================================
// 3. VERIFICAR ADMINISTRADOR
// ==========================================

async function verificarAdministrador() {
    if (!supabaseApp) return false;

    const { data, error } = await supabaseApp.auth.getUser();

    if (error || !data.user) return false;

    return data.user.app_metadata?.role === "admin";
}

// ==========================================
// 4. SAIR DA CONTA
// ==========================================

async function fazerLogout() {
    if (!supabaseApp) return;

    await supabaseApp.auth.signOut();
    window.location.href = "login.html";
}

// ==========================================
// 5. LISTAR PROJETOS
// ==========================================

async function listarProjetos() {
    if (!supabaseApp) {
        throw new Error("Não foi possível conectar ao Supabase.");
    }

    const { data, error } = await supabaseApp
        .from("projetos")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data;
}

// ==========================================
// 6. CADASTRAR PROJETO
// ==========================================

async function cadastrarProjeto(projeto) {
    if (!(await verificarAdministrador())) {
        throw new Error("Acesso não autorizado.");
    }

    const { data, error } = await supabaseApp
        .from("projetos")
        .insert([{
            titulo: projeto.titulo,
            descricao: projeto.descricao,
            imagem: projeto.imagem || null,
            link: projeto.link || null,
            categoria: projeto.categoria || null
        }])
        .select();

    if (error) throw new Error(error.message);

    return data;
}

// ==========================================
// 7. EDITAR PROJETO
// ==========================================

async function atualizarProjeto(id, projeto) {
    if (!(await verificarAdministrador())) {
        throw new Error("Acesso não autorizado.");
    }

    const { data, error } = await supabaseApp
        .from("projetos")
        .update({
            titulo: projeto.titulo,
            descricao: projeto.descricao,
            imagem: projeto.imagem || null,
            link: projeto.link || null,
            categoria: projeto.categoria || null
        })
        .eq("id", id)
        .select();

    if (error) throw new Error(error.message);

    return data;
}

// ==========================================
// 8. EXCLUIR PROJETO
// ==========================================

async function excluirProjeto(id) {
    if (!(await verificarAdministrador())) {
        throw new Error("Acesso não autorizado.");
    }

    const { error } = await supabaseApp
        .from("projetos")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);

    return true;
}

// ==========================================
// 9. GERENCIAR MENSAGENS (LEADS)
// ==========================================

async function enviarLead(dados) {
    if (!supabaseApp) {
        throw new Error("Conexão com o Supabase não encontrada.");
    }

    const { data, error } = await supabaseApp
        .from("leads")
        .insert([dados])
        .select();

    if (error) throw new Error(error.message);

    return data;
}

async function listarLeads() {
    if (!(await verificarAdministrador())) {
        throw new Error("Acesso não autorizado.");
    }

    const { data, error } = await supabaseApp
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data;
}

async function excluirLead(id) {
    if (!(await verificarAdministrador())) {
        throw new Error("Acesso não autorizado.");
    }

    const { error } = await supabaseApp
        .from("leads")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);

    return true;
}

// ==========================================
// 10. DISPONIBILIZAR FUNÇÕES
// ==========================================

window.supabaseApp = {
    client: supabaseApp,

    fazerLogin,
    verificarAdministrador,
    fazerLogout,

    listarProjetos,
    cadastrarProjeto,
    atualizarProjeto,
    excluirProjeto,

    enviarLead,
    listarLeads,
    excluirLead
};

// ==========================================
// 11. FORMULÁRIO DE CONTATO + WHATSAPP
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("formContato");

    if (!formulario) return;

    formulario.addEventListener("submit", async function (event) {
        event.preventDefault();

        const retorno = document.getElementById("retornoContato");
        const botao = formulario.querySelector('button[type="submit"]');

        botao.disabled = true;
        botao.textContent = "Enviando...";

        try {
            const dados = {
                nome: document.getElementById("nome").value.trim(),
                email: document.getElementById("email").value.trim(),
                wttszap: document.getElementById("whatsapp").value.trim(),
                assunto: document.getElementById("assunto").value.trim(),
                mensagem: document.getElementById("mensagem").value.trim(),
                "aceitou privacidade": document.getElementById("privacidade").checked
            };

            if (!dados.nome || !dados.email || !dados.mensagem) {
                throw new Error("Preencha todos os campos obrigatórios.");
            }

            if (!dados["aceitou privacidade"]) {
                throw new Error("É necessário aceitar a política de privacidade.");
            }

            await enviarLead(dados);

            const mensagemFormatada = `Olá Ana Laura! Vim pelo seu portfólio.\n\n*Nome:* ${dados.nome}\n*Assunto:* ${dados.assunto}\n*Mensagem:* ${dados.mensagem}`;
            const linkWhatsApp = `https://wa.me/${MEU_WHATSAPP}?text=${encodeURIComponent(mensagemFormatada)}`;

            retorno.textContent = "Mensagem salva! Abrindo o WhatsApp...";
            formulario.reset();

            window.open(linkWhatsApp, "_blank");

        } catch (erro) {
            console.error("Erro ao enviar contato:", erro);
            retorno.textContent = erro.message || "Não foi possível enviar sua mensagem.";
        } finally {
            botao.disabled = false;
            botao.textContent = "Enviar mensagem";
        }
    });
});
