import { supabase } from "./supabase.js";


// =====================================================
// ELEMENTOS
// =====================================================

const loading =
    document.getElementById("loading");

const tagContent =
    document.getElementById("tagContent");

const errorBox =
    document.getElementById("error");

const statusElement =
    document.getElementById("status");

const tagName =
    document.getElementById("tagName");

const tagDescription =
    document.getElementById("tagDescription");

const tagId =
    document.getElementById("tagId");

const createdAt =
    document.getElementById("createdAt");

const updatedAt =
    document.getElementById("updatedAt");


// =====================================================
// PEGAR ID DA URL
// =====================================================

function pegarIdDaURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");

}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHTML(texto) {

    return String(texto || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(data) {

    if (!data) {
        return "-";
    }

    const dataObj =
        new Date(data);

    if (
        Number.isNaN(
            dataObj.getTime()
        )
    ) {
        return "-";
    }

    return dataObj.toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

}


// =====================================================
// MOSTRAR ERRO
// =====================================================

function mostrarErro() {

    loading.classList.add(
        "hidden"
    );

    tagContent.classList.add(
        "hidden"
    );

    errorBox.classList.remove(
        "hidden"
    );

}


// =====================================================
// MOSTRAR TAG
// =====================================================

function mostrarTag(tag) {

    loading.classList.add(
        "hidden"
    );

    errorBox.classList.add(
        "hidden"
    );

    tagContent.classList.remove(
        "hidden"
    );


    const nome =
        tag.nome ||
        "Tag NFC";


    const descricao =
        tag.descricao ||
        "Esta é uma tag NFC da NFC Wallet.";


    tagName.textContent =
        nome;


    tagDescription.textContent =
        descricao;


    tagId.textContent =
        tag.tag_id ||
        "-";


    createdAt.textContent =
        formatarData(
            tag.criada_em
        );


    updatedAt.textContent =
        formatarData(
            tag.atualizada_em ||
            tag.criada_em
        );


    document.title =
        `NFC Wallet | ${nome}`;

    document.getElementById("publicContact")?.remove();
    if (tag.contato_publico) {
        const rawContact = tag.contato_publico.trim();
        const href = rawContact.includes("@")
            ? `mailto:${rawContact}`
            : rawContact;
        if (!/^(mailto:|https?:\/\/)/i.test(href)) return;
        const contact = document.createElement("a");
        contact.id = "publicContact";
        contact.className = "button";
        contact.href = href;
        contact.textContent = "Entrar em contato";
        tagDescription.after(contact);
    }

    document.documentElement.style.setProperty(
        "--cyan",
        /^#[0-9a-f]{6}$/i.test(tag.cor_publica || "")
            ? tag.cor_publica
            : "#00ffff"
    );

    if (tag.modo_perdida) {
        statusElement.classList.add("private");
        statusElement.lastElementChild.textContent = "ITEM PERDIDO";
        tagDescription.textContent = tag.mensagem_perdida ||
            "Este item foi marcado como perdido. Entre em contato com o proprietário.";
    }

}


// =====================================================
// BUSCAR TAG
// =====================================================

async function carregarTag() {

    const id =
        pegarIdDaURL();


    if (!id) {

        console.warn(
            "Nenhum ID de tag foi informado."
        );

        mostrarErro();

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabase
                .from("tags_nfc")
                .select(`
                    id,
                    nome,
                    tag_id,
                    descricao,
                    publica,
                    criada_em,
                    atualizada_em,
                    cor_publica,
                    modo_perdida,
                    mensagem_perdida,
                    contato_publico
                `)
                .eq(
                    "id",
                    id
                )
                .eq(
                    "publica",
                    true
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Erro ao buscar tag:",
                error
            );

            mostrarErro();

            return;
        }


        if (!data) {

            mostrarErro();

            return;
        }

        await supabase.from("acessos_publicos").insert({
            tag_id: data.id,
            origem: new URLSearchParams(window.location.search).get("origem") || "link"
        });


        mostrarTag(data);

    } catch (erro) {

        console.error(
            "Erro inesperado:",
            erro
        );

        mostrarErro();

    }

}


// =====================================================
// SERVICE WORKER
// =====================================================

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("./sw.js")
                .then(
                    registration => {

                        console.log(
                            "Service Worker registrado:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    error => {

                        console.error(
                            "Erro no Service Worker:",
                            error
                        );

                    }
                );

        }
    );

}


// =====================================================
// INICIALIZAR
// =====================================================

carregarTag();
