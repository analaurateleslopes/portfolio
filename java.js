
/* ==========================================
   PORTFÓLIO ANA LAURA
   CONEXÃO E GERENCIAMENTO SUPABASE
========================================== */

const SUPABASE_URL = "https://alzebirqbhxecbqgcihu.supabase.co";

const SUPABASE_KEY = "sb_publishable_4UpuzVQxnsT4__guSriaNg_Nt6PVNM3";

const MEU_WHATSAPP = "5533999855969";

const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// LOGIN
async function fazerLogin(email, senha) {
    const { data, error } = await client.auth.signInWithPassword({
        email,
        password: senha
    });

    if (error) throw error;

    return data;
}

// VERIFICAR ADMINISTRADOR
async function verificarAdministrador() {
    const { data, error } = await client.auth.getUser();

    if (error || !data.user) return false;

    return data.user.app_metadata?.role === "admin";
}

// SAIR
async function fazerLogout() {
    await client.auth.signOut();
    window.location.href = "login.html";
}

// LISTAR PROJETOS
async function listarProjetos() {
    const { data, error } = await client
        .from("projetos")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

// CADASTRAR PROJETO
async function cadastrarProjeto(projeto) {
    if (!(await verificarAdministrador())) {
        throw new Error("Acesso não autorizado.");
    }

    const { data, error } = await client
        .from("projetos")
        .insert([projeto])
        .select();

    if (error) throw error;
    return data;
}

// EDITAR PROJETO
async function atualizarProjeto(id, projeto) {
    if (!(await verificarAdministrador())) {
        throw new Error("Acesso não autorizado.");
    }

    const { data, error } = await client
        .from("projetos")
        .update(projeto)
        .eq("id", id)
        .select();

    if (error) throw error;
    return data;
}

// EXCLUIR PROJETO
async function excluirProjeto(id) {
    if (!(await verificarAdministrador())) {
        throw new Error("Acesso não autorizado.");
    }

    const { error } = await client
        .from("projetos")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

// ENVIAR MENSAGEM
async function enviarLead(dados) {
    const { data, error } = await client
        .from("leads")
        .insert([dados])
        .select();

    if (error) throw error;
    return data;
}

// LISTAR MENSAGENS
async function listarLeads() {
    if (!(await verificarAdministrador())) {
        throw new Error("Acesso não autorizado.");
    }

    const { data, error } = await client
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

// EXCLUIR MENSAGEM
async function excluirLead(id) {
    if (!(await verificarAdministrador())) {
        throw new Error("Acesso não autorizado.");
    }

    const { error } = await client
        .from("leads")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

// DISPONIBILIZAR FUNÇÕES
window.supabaseApp = {
    client,
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

// FORMULÁRIO DE CONTATO
document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("formContato");

    if (!formulario) return;

    formulario.addEventListener("submit", async function (event) {

        event.preventDefault();

        const retorno = document.getElementById("retornoContato");
        const botao = formulario.querySelector('button[type="submit"]');

        botao.disabled = true;

        try {
            const dados = {
                nome: document.getElementById("nome").value.trim(),
                email: document.getElementById("email").value.trim(),
                whatsapp: document.getElementById("whatsapp").value.trim(),
                assunto: document.getElementById("assunto").value.trim(),
                mensagem: document.getElementById("mensagem").value.trim(),
                aceitou_privacidade: document.getElementById("privacidade").checked
            };

            if (!dados.nome || !dados.email || !dados.mensagem) {
                throw new Error("Preencha os campos obrigatórios.");
            }

            if (!dados.aceitou_privacidade) {
                throw new Error("Aceite a política de privacidade.");
            }

            await enviarLead(dados);

            if (retorno) {
                retorno.textContent = "Mensagem enviada com sucesso!";
            }

            const texto = `Olá Ana Laura! Vim pelo seu portfólio.

Nome: ${dados.nome}
Assunto: ${dados.assunto}
Mensagem: ${dados.mensagem}`;

            formulario.reset();

            window.open(
                `https://wa.me/${MEU_WHATSAPP}?text=${encodeURIComponent(texto)}`,
                "_blank"
            );

        } catch (erro) {
            if (retorno) {
                retorno.textContent = erro.message;
            }
        } finally {
            botao.disabled = false;
        }

    });

});
