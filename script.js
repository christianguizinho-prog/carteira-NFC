import { supabase } from "./supabase.js";


// =====================================================
// ELEMENTOS
// =====================================================

const authScreen =
    document.getElementById("authScreen");

const app =
    document.getElementById("app");

const authForm =
    document.getElementById("authForm");

const authTitle =
    document.getElementById("authTitle");

const authDescription =
    document.getElementById("authDescription");

const nomeInput =
    document.getElementById("nomeInput");

const emailInput =
    document.getElementById("emailInput");

const passwordInput =
    document.getElementById("passwordInput");

const authBtn =
    document.getElementById("authBtn");

const toggleAuth =
    document.getElementById("toggleAuth");

const authMessage =
    document.getElementById("authMessage");

const logoutBtn =
    document.getElementById("logoutBtn");

const themeBtn =
    document.getElementById("themeBtn");

const userName =
    document.getElementById("userName");

const cardName =
    document.getElementById("cardName");

const cardId =
    document.getElementById("cardId");

const currentTagName =
    document.getElementById("currentTagName");

const currentTagId =
    document.getElementById("currentTagId");

const currentTagBox =
    document.getElementById("currentTagBox");

const tagVisibility =
    document.getElementById("tagVisibility");

const tagManagement =
    document.getElementById("tagManagement");

const togglePublicBtn =
    document.getElementById("togglePublicBtn");

const shareTagBtn =
    document.getElementById("shareTagBtn");

const refreshTag =
    document.getElementById("refreshTag");

const statusElement =
    document.getElementById("status");

const deviceElement =
    document.getElementById("device");

const readNfcBtn =
    document.getElementById("readNfcBtn");

const addBtn =
    document.getElementById("addBtn");

const historyList =
    document.getElementById("historyList");

const refreshHistory =
    document.getElementById("refreshHistory");

const modal =
    document.getElementById("modal");

const closeModal =
    document.getElementById("closeModal");

const saveBtn =
    document.getElementById("saveBtn");

const nameInput =
    document.getElementById("nameInput");

const tagIdInput =
    document.getElementById("tagIdInput");

const descricaoInput =
    document.getElementById("descricaoInput");

const toast =
    document.getElementById("toast");

const toastIcon =
    document.getElementById("toastIcon");

const toastMessage =
    document.getElementById("toastMessage");


// =====================================================
// ELEMENTOS - GERENCIAMENTO DE TAGS
// =====================================================

const openAddTagBtn =
    document.getElementById("openAddTagBtn");

const searchTagInput =
    document.getElementById("searchTagInput");

const tagManagerList =
    document.getElementById("tagManagerList");

const tagCount =
    document.getElementById("tagCount");


// =====================================================
// VARIÁVEIS
// =====================================================

let modoCadastro = false;

let usuarioAtual = null;

let tagAtual = null;

let todasAsTags = [];

let modoEdicao = false;

let toastTimer = null;

let leituraNfcAtiva = false;


// =====================================================
// TOAST
// =====================================================

function mostrarToast(
    mensagem,
    tipo = "success"
) {

    toastMessage.textContent =
        mensagem;

    toastIcon.textContent =
        tipo === "error"
            ? "!"
            : "✓";

    toastIcon.style.color =
        tipo === "error"
            ? "#ff526b"
            : "#00ff88";

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3000);
}


// =====================================================
// MENSAGEM DE LOGIN
// =====================================================

function mostrarMensagemAuth(
    mensagem,
    erro = true
) {

    authMessage.textContent =
        mensagem;

    authMessage.style.color =
        erro
            ? "#ff526b"
            : "#00ff88";
}


// =====================================================
// ALTERNAR LOGIN / CADASTRO
// =====================================================

toggleAuth.addEventListener(
    "click",
    () => {

        modoCadastro =
            !modoCadastro;


        if (modoCadastro) {

            authTitle.textContent =
                "Criar conta";

            authDescription.textContent =
                "Crie sua carteira NFC.";

            nomeInput.style.display =
                "block";

            nomeInput.required =
                true;

            passwordInput.autocomplete =
                "new-password";

            authBtn.textContent =
                "Cadastrar";

            toggleAuth.textContent =
                "Já tenho uma conta";

        } else {

            authTitle.textContent =
                "Entrar";

            authDescription.textContent =
                "Acesse sua carteira NFC.";

            nomeInput.style.display =
                "none";

            nomeInput.required =
                false;

            passwordInput.autocomplete =
                "current-password";

            authBtn.textContent =
                "Entrar";

            toggleAuth.textContent =
                "Criar uma conta";
        }


        mostrarMensagemAuth(
            "",
            false
        );

    }
);


// =====================================================
// LOGIN / CADASTRO
// =====================================================

authForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const email =
            emailInput.value.trim();

        const senha =
            passwordInput.value;


        if (!email || !senha) {

            mostrarMensagemAuth(
                "Preencha todos os campos."
            );

            return;
        }


        authBtn.disabled =
            true;


        authBtn.textContent =
            modoCadastro
                ? "Criando..."
                : "Entrando...";


        try {

            if (modoCadastro) {

                await cadastrar(
                    email,
                    senha
                );

            } else {

                await login(
                    email,
                    senha
                );

            }

        } finally {

            authBtn.disabled =
                false;

            authBtn.textContent =
                modoCadastro
                    ? "Cadastrar"
                    : "Entrar";
        }

    }
);


// =====================================================
// CADASTRAR
// =====================================================

async function cadastrar(
    email,
    senha
) {

    const nome =
        nomeInput.value.trim();


    if (!nome) {

        mostrarMensagemAuth(
            "Digite seu nome."
        );

        return;
    }


    if (senha.length < 6) {

        mostrarMensagemAuth(
            "A senha precisa ter pelo menos 6 caracteres."
        );

        return;
    }


    const {
        data,
        error
    } =
        await supabase.auth.signUp({

            email,

            password: senha,

            options: {

                data: {
                    nome
                }

            }

        });


    if (error) {

        console.error(error);

        mostrarMensagemAuth(
            traduzirErro(error.message)
        );

        return;
    }


    if (data.session) {

        usuarioAtual =
            data.user;

        mostrarToast(
            "Conta criada com sucesso!"
        );

        await iniciarAplicacao();

    } else {

        mostrarMensagemAuth(
            "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
            false
        );

    }

}


// =====================================================
// LOGIN
// =====================================================

async function login(
    email,
    senha
) {

    const {
        data,
        error
    } =
        await supabase.auth.signInWithPassword({

            email,

            password: senha

        });


    if (error) {

        console.error(error);

        mostrarMensagemAuth(
            traduzirErro(error.message)
        );

        return;
    }


    usuarioAtual =
        data.user;


    mostrarToast(
        "Login realizado!"
    );


    await iniciarAplicacao();

}


// =====================================================
// TRADUZIR ERROS
// =====================================================

function traduzirErro(
    erro
) {

    if (
        erro.includes(
            "Invalid login credentials"
        )
    ) {

        return "E-mail ou senha incorretos.";

    }


    if (
        erro.includes(
            "User already registered"
        )
    ) {

        return "Este e-mail já está cadastrado.";

    }


    if (
        erro.includes(
            "Password should be at least"
        )
    ) {

        return "A senha é muito curta.";

    }


    if (
        erro.includes(
            "Email not confirmed"
        )
    ) {

        return "Confirme seu e-mail antes de entrar.";

    }


    return erro;
}


// =====================================================
// INICIAR APLICAÇÃO
// =====================================================

async function iniciarAplicacao() {

    authScreen.style.display =
        "none";

    app.style.display =
        "block";


    await carregarPerfil();

    await carregarTags();

    await carregarHistorico();

    verificarNFC();

}


// =====================================================
// PERFIL
// =====================================================

async function carregarPerfil() {

    if (!usuarioAtual)
        return;


    const {
        data,
        error
    } =
        await supabase
            .from("perfis")
            .select("*")
            .eq(
                "id",
                usuarioAtual.id
            )
            .maybeSingle();


    if (error) {

        console.error(error);

        return;
    }


    if (!data) {

        const nome =
            usuarioAtual.user_metadata?.nome ||
            "Usuário NFC";


        const {
            data: novoPerfil,
            error: erroPerfil
        } =
            await supabase
                .from("perfis")
                .insert({

                    id:
                        usuarioAtual.id,

                    nome

                })
                .select()
                .single();


        if (erroPerfil) {

            console.error(
                erroPerfil
            );

            return;
        }


        atualizarNomePerfil(
            novoPerfil.nome
        );

        return;
    }


    atualizarNomePerfil(
        data.nome
    );

}


// =====================================================
// ATUALIZAR NOME
// =====================================================

function atualizarNomePerfil(
    nome
) {

    const nomeSeguro =
        nome || "Usuário NFC";


    userName.textContent =
        nomeSeguro;


    cardName.textContent =
        nomeSeguro.toUpperCase();

}


// =====================================================
// CARREGAR TAGS
// =====================================================

async function carregarTags() {

    if (!usuarioAtual)
        return;


    const {
        data,
        error
    } =
        await supabase
            .from("tags_nfc")
            .select("*")
            .eq(
                "usuario_id",
                usuarioAtual.id
            )
            .order(
                "criada_em",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        mostrarToast(
            "Erro ao carregar tags.",
            "error"
        );

        return;
    }


    todasAsTags =
        data || [];


    tagCount.textContent =
        todasAsTags.length;


    renderizarTags(
        todasAsTags
    );


    if (
        todasAsTags.length === 0
    ) {

        limparTagAtual(
            "Nenhuma tag cadastrada"
        );

        return;
    }


    /*
     * Se já existe uma tag selecionada,
     * tenta mantê-la.
     */

    if (tagAtual) {

        const tagAtualizada =
            todasAsTags.find(
                tag =>
                    tag.id ===
                    tagAtual.id
            );


        if (tagAtualizada) {

            mostrarTag(
                tagAtualizada
            );

            return;
        }

    }


    /*
     * Caso contrário, mostra a primeira.
     */

    mostrarTag(
        todasAsTags[0]
    );

}


// =====================================================
// RENDERIZAR TAGS
// =====================================================

function renderizarTags(
    tags
) {

    tagManagerList.innerHTML =
        "";


    if (
        !tags ||
        tags.length === 0
    ) {

        tagManagerList.innerHTML = `

            <div class="empty">

                <span>
                    ◈
                </span>

                <p>
                    Nenhuma tag encontrada.
                </p>

            </div>

        `;

        return;
    }


    tags.forEach(
        tag => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "tag-manager-item";


            const data =
                tag.criada_em
                    ? new Date(
                        tag.criada_em
                    )
                    : null;


            const dataTexto =
                data
                    ? data.toLocaleDateString(
                        "pt-BR"
                    )
                    : "Sem data";


            item.innerHTML = `

                <div class="tag-info">

                    <div class="tag-icon">
                        ◈
                    </div>

                    <div class="tag-details">

                        <strong>
                            ${escaparHTML(
                                tag.nome ||
                                "Tag NFC"
                            )}
                        </strong>

                        <small>
                            ${escaparHTML(
                                tag.tag_id ||
                                "ID desconhecido"
                            )}
                        </small>

                    </div>

                </div>


                <div class="tag-date">

                    Cadastrada em<br>

                    ${dataTexto}

                </div>


                <div class="tag-actions">

                    <button
                        class="tag-action edit"
                        data-id="${tag.id}"
                        title="Editar">

                        ✎

                    </button>


                    <button
                        class="tag-action delete"
                        data-id="${tag.id}"
                        title="Excluir">

                        ×

                    </button>

                </div>

            `;


            tagManagerList.appendChild(
                item
            );

        }
    );


    configurarAcoesTags();

}


// =====================================================
// MOSTRAR TAG
// =====================================================

function mostrarTag(tag) {

    if (!tag) {

        limparTagAtual();

        return;
    }


    tagAtual = tag;


    const id =
        tag.tag_id ||
        "ID-DESCONHECIDO";


    cardId.textContent =
        id.toUpperCase();


    currentTagName.textContent =
        tag.nome || "Tag NFC";


    currentTagId.textContent =
        id;


    // ==========================================
    // VISIBILIDADE
    // ==========================================

    if (tag.publica) {

        tagVisibility.textContent =
            "🌐 Pública";

        tagVisibility.classList.remove(
            "private"
        );

        tagVisibility.classList.add(
            "public"
        );

        togglePublicBtn.textContent =
            "🔒 Tornar privada";

    } else {

        tagVisibility.textContent =
            "🔒 Privada";

        tagVisibility.classList.remove(
            "public"
        );

        tagVisibility.classList.add(
            "private"
        );

        togglePublicBtn.textContent =
            "🌐 Tornar pública";
    }


    tagManagement.style.display =
        "flex";

}


// =====================================================
// LIMPAR TAG ATUAL
// =====================================================

function limparTagAtual(
    mensagem = "Nenhuma tag selecionada"
) {

    tagAtual = null;


    cardId.textContent =
        "NÃO CONECTADA";


    currentTagName.textContent =
        mensagem;


    currentTagId.textContent =
        "Faça uma leitura NFC.";


    tagVisibility.textContent =
        "🔒 Privada";


    tagVisibility.classList.remove(
        "public"
    );


    tagVisibility.classList.add(
        "private"
    );


    tagManagement.style.display =
        "none";

}


// =====================================================
// CONFIGURAR AÇÕES DAS TAGS
// =====================================================

function configurarAcoesTags() {

    const editButtons =
        document.querySelectorAll(
            ".tag-action.edit"
        );


    const deleteButtons =
        document.querySelectorAll(
            ".tag-action.delete"
        );


    editButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    editarTag(
                        button.dataset.id
                    );

                }
            );

        }
    );


    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    excluirTag(
                        button.dataset.id
                    );

                }
            );

        }
    );

}


// =====================================================
// EDITAR TAG
// =====================================================

async function editarTag(
    id
) {

    const tag =
        todasAsTags.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!tag)
        return;


    tagAtual =
        tag;


    modoEdicao =
        true;


    nameInput.value =
        tag.nome || "";


    tagIdInput.value =
        tag.tag_id || "";


    descricaoInput.value =
        tag.descricao || "";


    tagIdInput.disabled =
        true;


    modal.classList.add(
        "active"
    );


    nameInput.focus();

}


// =====================================================
// EXCLUIR TAG
// =====================================================

async function excluirTag(
    id
) {

    const tag =
        todasAsTags.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!tag)
        return;


    const confirmar =
        confirm(
            `Deseja realmente excluir a tag "${tag.nome}"?`
        );


    if (!confirmar)
        return;


    const {
        error
    } =
        await supabase
            .from("tags_nfc")
            .delete()
            .eq(
                "id",
                id
            )
            .eq(
                "usuario_id",
                usuarioAtual.id
            );


    if (error) {

        console.error(error);

        mostrarToast(
            "Não foi possível excluir a tag.",
            "error"
        );

        return;
    }


    if (
        tagAtual &&
        String(tagAtual.id) ===
        String(id)
    ) {

        limparTagAtual();

    }


    mostrarToast(
        "Tag excluída com sucesso!"
    );


    await carregarTags();

}


// =====================================================
// NOVA TAG MANUAL
// =====================================================

openAddTagBtn.addEventListener(
    "click",
    () => {

        modoEdicao =
            false;


        tagAtual =
            null;


        nameInput.value =
            "";


        tagIdInput.value =
            "";


        descricaoInput.value =
            "";


        tagIdInput.disabled =
            false;


        modal.classList.add(
            "active"
        );


        nameInput.focus();

    }
);


// =====================================================
// PESQUISAR TAGS
// =====================================================

searchTagInput.addEventListener(
    "input",
    () => {

        const termo =
            searchTagInput.value
                .trim()
                .toLowerCase();


        if (!termo) {

            renderizarTags(
                todasAsTags
            );

            return;
        }


        const filtradas =
            todasAsTags.filter(
                tag => {

                    const nome =
                        String(
                            tag.nome || ""
                        ).toLowerCase();


                    const id =
                        String(
                            tag.tag_id || ""
                        ).toLowerCase();


                    return (
                        nome.includes(
                            termo
                        )
                        ||
                        id.includes(
                            termo
                        )
                    );

                }
            );


        renderizarTags(
            filtradas
        );

    }
);


// =====================================================
// VERIFICAR NFC
// =====================================================

function verificarNFC() {

    if (
        "NDEFReader" in window
    ) {

        deviceElement.textContent =
            "NFC disponível";


        deviceElement.classList.add(
            "success"
        );

    } else {

        deviceElement.textContent =
            "NFC não disponível";

    }

}


// =====================================================
// LER NFC
// =====================================================

async function lerNFC() {

    if (leituraNfcAtiva) {

        mostrarToast(
            "Leitura já iniciada. Aproxime a tag NFC."
        );

        return;
    }


    if (!usuarioAtual) {

        mostrarToast(
            "Faça login primeiro.",
            "error"
        );

        return;
    }


    if (
        !("NDEFReader" in window)
    ) {

        statusElement.textContent =
            "NFC não suportado";


        mostrarToast(
            "Este navegador não suporta Web NFC.",
            "error"
        );

        return;
    }


    try {

        const ndef =
            new NDEFReader();


        statusElement.textContent =
            "Aproxime a tag NFC...";


        readNfcBtn.disabled =
            true;


        await ndef.scan();


        leituraNfcAtiva =
            true;


        readNfcBtn.disabled =
            false;


        ndef.onreading =
            async event => {

                const serialNumber =
                    event.serialNumber ||
                    "ID-DESCONHECIDO";


                cardId.textContent =
                    serialNumber.toUpperCase();


                statusElement.textContent =
                    "NFC conectado";


                mostrarToast(
                    "Tag NFC detectada!"
                );


                await processarTag(
                    serialNumber
                );

            };


        ndef.onreadingerror =
            () => {

                statusElement.textContent =
                    "Erro ao ler NFC";


                mostrarToast(
                    "Não foi possível ler a tag.",
                    "error"
                );

            };


    } catch (error) {

        console.error(error);


        statusElement.textContent =
            "Falha na leitura";


        mostrarToast(
            error.message ||
            "Falha ao iniciar NFC.",
            "error"
        );


        leituraNfcAtiva =
            false;


        readNfcBtn.disabled =
            false;

    }

}


// =====================================================
// BOTÃO LER NFC
// =====================================================

readNfcBtn.addEventListener(
    "click",
    lerNFC
);


// =====================================================
// PROCESSAR TAG
// =====================================================

async function processarTag(
    tagId
) {

    const {
        data: existente,
        error
    } =
        await supabase
            .from("tags_nfc")
            .select("*")
            .eq(
                "usuario_id",
                usuarioAtual.id
            )
            .eq(
                "tag_id",
                tagId
            )
            .maybeSingle();


    if (error) {

        console.error(error);

        mostrarToast(
            "Erro ao consultar a tag.",
            "error"
        );

        return;
    }


    let tag;


    if (existente) {

        tag =
            existente;

    } else {

        const {
            data,
            error: erroInsert
        } =
            await supabase
                .from("tags_nfc")
                .insert({

                    usuario_id:
                        usuarioAtual.id,

                    nome:
                        "Nova Tag NFC",

                    tag_id:
                        tagId

                })
                .select()
                .single();


        if (erroInsert) {

            console.error(
                erroInsert
            );


            mostrarToast(
                "Erro ao cadastrar tag.",
                "error"
            );

            return;
        }


        tag =
            data;


        mostrarToast(
            "Nova tag cadastrada!"
        );

    }


    mostrarTag(
        tag
    );


    await carregarTags();


    await registrarLeitura(
        tag
    );


    await carregarHistorico();

}


// =====================================================
// REGISTRAR LEITURA
// =====================================================

async function registrarLeitura(
    tag
) {

    const {
        error
    } =
        await supabase
            .from("leituras_nfc")
            .insert({

                usuario_id:
                    usuarioAtual.id,

                tag_id:
                    tag.id,

                dispositivo:
                    navigator.userAgent.substring(
                        0,
                        255
                    )

            });


    if (error) {

        console.error(error);


        mostrarToast(
            "Erro ao salvar leitura.",
            "error"
        );

        return;
    }


    mostrarToast(
        "Leitura salva no banco!"
    );

}


// =====================================================
// HISTÓRICO
// =====================================================

async function carregarHistorico() {

    if (!usuarioAtual)
        return;


    const {
        data,
        error
    } =
        await supabase
            .from("leituras_nfc")
            .select(`
                id,
                lida_em,
                dispositivo,
                tags_nfc (
                    id,
                    nome,
                    tag_id
                )
            `)
            .eq(
                "usuario_id",
                usuarioAtual.id
            )
            .order(
                "lida_em",
                {
                    ascending: false
                }
            )
            .limit(20);


    if (error) {

        console.error(error);

        return;
    }


    historyList.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

        historyList.innerHTML = `

            <div class="empty">

                <span>
                    ◌
                </span>

                <p>
                    Nenhuma tag NFC foi lida.
                </p>

            </div>

        `;

        return;
    }


    data.forEach(
        adicionarHistorico
    );

}


// =====================================================
// ADICIONAR HISTÓRICO VISUAL
// =====================================================

function adicionarHistorico(
    leitura
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "history-item";


    const data =
        new Date(
            leitura.lida_em
        );


    const dataTexto =
        data.toLocaleDateString(
            "pt-BR"
        );


    const horaTexto =
        data.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    const nome =
        leitura.tags_nfc?.nome ||
        "Tag NFC";


    const id =
        leitura.tags_nfc?.tag_id ||
        "ID desconhecido";


    item.innerHTML = `

        <div>

            <strong>
                ${escaparHTML(nome)}
            </strong>

            <small>
                ID:
                ${escaparHTML(id)}
            </small>

        </div>


        <div class="history-status">

            <small>

                ${dataTexto}
                às
                ${horaTexto}

            </small>


            <div class="success">
                ● Lida
            </div>

        </div>

    `;


    historyList.appendChild(
        item
    );

}


// =====================================================
// SEGURANÇA DO HTML
// =====================================================

function escaparHTML(
    texto
) {

    return String(texto)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// =====================================================
// ABRIR MODAL PARA TAG ATUAL
// =====================================================

addBtn.addEventListener(
    "click",
    () => {

        if (!tagAtual) {

            mostrarToast(
                "Leia uma tag NFC primeiro.",
                "error"
            );

            return;
        }


        modoEdicao =
            true;


        nameInput.value =
            tagAtual.nome || "";


        tagIdInput.value =
            tagAtual.tag_id || "";


        descricaoInput.value =
            tagAtual.descricao || "";


        tagIdInput.disabled =
            true;


        modal.classList.add(
            "active"
        );


        nameInput.focus();

    }
);


// =====================================================
// FECHAR MODAL
// =====================================================

closeModal.addEventListener(
    "click",
    fecharModal
);


modal.addEventListener(
    "click",
    event => {

        if (
            event.target === modal
        ) {

            fecharModal();

        }

    }
);


function fecharModal() {

    modal.classList.remove(
        "active"
    );


    nameInput.value =
        "";


    tagIdInput.value =
        "";


    descricaoInput.value =
        "";


    tagIdInput.disabled =
        false;


    modoEdicao =
        false;

}


// =====================================================
// SALVAR TAG
// =====================================================

saveBtn.addEventListener(
    "click",
    async () => {

        const nome =
            nameInput.value.trim();


        const tagId =
            tagIdInput.value.trim();


        const descricao =
            descricaoInput.value.trim();


        if (!nome) {

            mostrarToast(
                "Digite um nome para a tag.",
                "error"
            );

            return;
        }


        if (!usuarioAtual) {

            mostrarToast(
                "Usuário não autenticado.",
                "error"
            );

            return;
        }


        saveBtn.disabled =
            true;


        try {


            // =========================================
            // EDITAR TAG
            // =========================================

            if (modoEdicao) {

                if (!tagAtual) {

                    mostrarToast(
                        "Nenhuma tag selecionada.",
                        "error"
                    );

                    return;
                }


                const {
                    data,
                    error
                } =
                    await supabase
                        .from("tags_nfc")
                        .update({

                            nome,

                            descricao:
                                descricao || null,

                            atualizada_em:
                                new Date().toISOString()

                        })
                        .eq(
                            "id",
                            tagAtual.id
                        )
                        .eq(
                            "usuario_id",
                            usuarioAtual.id
                        )
                        .select()
                        .single();


                if (error) {

                    console.error(
                        error
                    );

                    mostrarToast(
                        "Erro ao atualizar tag.",
                        "error"
                    );

                    return;
                }


                tagAtual =
                    data;


                mostrarTag(
                    data
                );


                fecharModal();


                mostrarToast(
                    "Tag atualizada com sucesso!"
                );


                await carregarTags();


                return;
            }



            // =========================================
            // NOVA TAG MANUAL
            // =========================================

            if (!tagId) {

                mostrarToast(
                    "Digite o ID da tag NFC.",
                    "error"
                );

                return;
            }


            const {
                data,
                error
            } =
                await supabase
                    .from("tags_nfc")
                    .insert({

                        usuario_id:
                            usuarioAtual.id,

                        nome,

                        tag_id:
                            tagId,

                        descricao:
                            descricao || null

                    })
                    .select()
                    .single();


            if (error) {

                console.error(
                    error
                );


                if (
                    error.code ===
                    "23505"
                ) {

                    mostrarToast(
                        "Essa tag já está cadastrada.",
                        "error"
                    );

                } else {

                    mostrarToast(
                        "Erro ao cadastrar tag.",
                        "error"
                    );

                }

                return;
            }


            tagAtual =
                data;


            mostrarTag(
                data
            );


            fecharModal();


            mostrarToast(
                "Nova tag cadastrada!"
            );


            await carregarTags();


        } finally {

            saveBtn.disabled =
                false;

        }

    }
);


// =====================================================
// ATUALIZAR HISTÓRICO
// =====================================================

refreshHistory.addEventListener(
    "click",
    async () => {

        await carregarHistorico();


        mostrarToast(
            "Histórico atualizado."
        );

    }
);


// =====================================================
// LOGOUT
// =====================================================

logoutBtn.addEventListener(
    "click",
    async () => {

        const {
            error
        } =
            await supabase.auth.signOut();


        if (error) {

            console.error(error);


            mostrarToast(
                "Erro ao sair.",
                "error"
            );

            return;
        }


        usuarioAtual =
            null;


        tagAtual =
            null;


        todasAsTags =
            [];


        app.style.display =
            "none";


        authScreen.style.display =
            "grid";


        authForm.reset();


        mostrarToast(
            "Sessão encerrada."
        );

    }
);


// =====================================================
// TEMA
// =====================================================

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );


        const claro =
            document.body.classList.contains(
                "light"
            );


        themeBtn.textContent =
            claro
                ? "☀"
                : "☾";


        localStorage.setItem(
            "nfc-theme",
            claro
                ? "light"
                : "dark"
        );

    }
);


// =====================================================
// CARREGAR TEMA
// =====================================================

function carregarTema() {

    const tema =
        localStorage.getItem(
            "nfc-theme"
        );


    if (
        tema ===
        "light"
    ) {

        document.body.classList.add(
            "light"
        );


        themeBtn.textContent =
            "☀";

    }

}


// =====================================================
// VERIFICAR SESSÃO
// =====================================================

async function verificarSessao() {

    const {
        data,
        error
    } =
        await supabase.auth.getSession();


    if (error) {

        console.error(error);

        return;
    }


    if (data.session) {

        usuarioAtual =
            data.session.user;


        await iniciarAplicacao();

    } else {

        authScreen.style.display =
            "grid";


        app.style.display =
            "none";

    }

}


// =====================================================
// OBSERVAR MUDANÇAS DE AUTENTICAÇÃO
// =====================================================

supabase.auth.onAuthStateChange(
    async (
        event,
        session
    ) => {

        if (
            event ===
            "SIGNED_OUT"
        ) {

            usuarioAtual =
                null;


            tagAtual =
                null;


            todasAsTags =
                [];


            app.style.display =
                "none";


            authScreen.style.display =
                "grid";

        }

    }
);


async function alterarVisibilidadeTag() {

    if (!tagAtual) {

        mostrarToast(
            "Nenhuma tag selecionada.",
            "error"
        );

        return;
    }


    const novoEstado =
        !tagAtual.publica;


    togglePublicBtn.disabled =
        true;


    togglePublicBtn.textContent =
        "Atualizando...";


    const {
        data,
        error
    } =
        await supabase
            .from("tags_nfc")
            .update({

                publica:
                    novoEstado,

                atualizada_em:
                    new Date().toISOString()

            })
            .eq(
                "id",
                tagAtual.id
            )
            .eq(
                "usuario_id",
                usuarioAtual.id
            )
            .select()
            .single();


    togglePublicBtn.disabled =
        false;


    if (error) {

        console.error(error);

        mostrarToast(
            "Erro ao alterar visibilidade.",
            "error"
        );

        mostrarTag(tagAtual);

        return;
    }


    tagAtual =
        data;


    mostrarTag(data);


    if (data.publica) {

        mostrarToast(
            "Tag agora é pública!"
        );

    } else {

        mostrarToast(
            "Tag agora é privada."
        );

    }

}

async function compartilharTag() {

    if (!tagAtual) {

        mostrarToast(
            "Nenhuma tag selecionada.",
            "error"
        );

        return;
    }


    if (!tagAtual.publica) {

        mostrarToast(
            "Torne a tag pública antes de compartilhar.",
            "error"
        );

        return;
    }


    const url =
        new URL(
            "tag.html",
            window.location.href
        );


    url.searchParams.set(
        "id",
        tagAtual.id
    );


    const link =
        url.toString();


    // ==========================================
    // COMPARTILHAMENTO NATIVO
    // ==========================================

    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    `NFC Wallet - ${tagAtual.nome}`,

                text:
                    `Confira minha tag NFC: ${tagAtual.nome}`,

                url:
                    link

            });

            return;

        } catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {

                return;

            }

        }

    }


    // ==========================================
    // COPIAR LINK
    // ==========================================

    try {

        await navigator.clipboard.writeText(
            link
        );


        mostrarToast(
            "Link copiado!"
        );

    } catch (error) {

        console.error(error);


        window.prompt(
            "Copie o link da sua tag:",
            link
        );

    }

}

togglePublicBtn.addEventListener(
    "click",
    alterarVisibilidadeTag
);


shareTagBtn.addEventListener(
    "click",
    compartilharTag
);

refreshTag.addEventListener(
    "click",
    async () => {

        if (!tagAtual) {

            mostrarToast(
                "Nenhuma tag selecionada.",
                "error"
            );

            return;
        }


        const {
            data,
            error
        } =
            await supabase
                .from("tags_nfc")
                .select("*")
                .eq(
                    "id",
                    tagAtual.id
                )
                .eq(
                    "usuario_id",
                    usuarioAtual.id
                )
                .single();


        if (error) {

            console.error(error);

            mostrarToast(
                "Erro ao atualizar tag.",
                "error"
            );

            return;
        }


        mostrarTag(data);


        mostrarToast(
            "Tag atualizada."
        );

    }
);

// =====================================================
// INICIALIZAÇÃO
// =====================================================

carregarTema();

verificarSessao();