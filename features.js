import { supabase } from "./supabase.js";

let currentTag = null;
const management = document.getElementById("tagManagement");
const importInput = document.getElementById("importInput");
const tagManager = document.querySelector(".tag-manager");

management.insertAdjacentHTML("beforeend", `
  <button id="writeNfcBtn" class="secondary-btn" type="button">Gravar NFC</button>
  <button id="qrBtn" class="secondary-btn" type="button">QR Code</button>
  <button id="profileBtn" class="secondary-btn" type="button">Perfil público</button>
  <button id="lostBtn" class="secondary-btn" type="button">Modo perdido</button>
  <button id="archiveBtn" class="secondary-btn" type="button">Arquivar</button>
  <button id="analyticsBtn" class="secondary-btn" type="button">Analytics</button>
`);

tagManager.querySelector(".section-title").insertAdjacentHTML("beforeend", `
  <div class="backup-actions">
    <button id="exportBtn" class="secondary-btn small-btn" type="button">Backup</button>
    <button id="importBtn" class="secondary-btn small-btn" type="button">Importar</button>
  </div>
`);

document.addEventListener("tagchange", event => {
  currentTag = event.detail;
  document.getElementById("lostBtn").textContent = currentTag.modo_perdida
    ? "Desativar perdido" : "Modo perdido";
});

function toast(message, error = false) {
  const element = document.getElementById("toast");
  document.getElementById("toastMessage").textContent = message;
  document.getElementById("toastIcon").textContent = error ? "!" : "✓";
  element.classList.add("show");
  setTimeout(() => element.classList.remove("show"), 3000);
}

async function user() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function publicUrl(tag, origin = "link") {
  return new URL(`tag.html?id=${encodeURIComponent(tag.id)}&origem=${origin}`, location.href).href;
}

async function updateCurrent(changes) {
  const owner = await user();
  if (!owner || !currentTag) return null;
  const { data, error } = await supabase.from("tags_nfc")
    .update(changes).eq("id", currentTag.id).eq("usuario_id", owner.id).select().single();
  if (error) throw error;
  currentTag = data;
  document.dispatchEvent(new CustomEvent("tagchange", { detail: data }));
  return data;
}

document.getElementById("writeNfcBtn").addEventListener("click", async () => {
  if (!currentTag) return;
  if (!("NDEFReader" in window)) return toast("Este navegador não suporta escrita NFC.", true);
  try {
    await new NDEFReader().write({ records: [{ recordType: "text", data: currentTag.tag_id }] });
    toast("Tag gravada com seu identificador NFC.");
  } catch (error) {
    toast(error.message || "Não foi possível gravar a tag.", true);
  }
});

document.getElementById("qrBtn").addEventListener("click", () => {
  if (!currentTag) return;
  const url = publicUrl(currentTag, "qr");
  const image = `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(url)}`;
  window.open(image, "_blank", "noopener,noreferrer");
  toast("QR Code aberto em uma nova aba.");
});

document.getElementById("profileBtn").addEventListener("click", async () => {
  if (!currentTag) return;
  const color = prompt("Cor do perfil público (hex):", currentTag.cor_publica || "#00cfff");
  if (color === null) return;
  if (!/^#[0-9a-f]{6}$/i.test(color)) return toast("Use uma cor como #00cfff.", true);
  const contact = prompt("Contato público (opcional):", currentTag.contato_publico || "");
  if (contact === null) return;
  try {
    await updateCurrent({ cor_publica: color, contato_publico: contact.trim() || null });
    toast("Perfil público atualizado.");
  } catch (error) { toast("Não foi possível salvar o perfil.", true); }
});

document.getElementById("lostBtn").addEventListener("click", async () => {
  if (!currentTag) return;
  const enabled = !currentTag.modo_perdida;
  const message = enabled ? prompt("Mensagem para quem encontrar o item:", currentTag.mensagem_perdida || "Entre em contato com o proprietário.") : null;
  if (enabled && message === null) return;
  try {
    await updateCurrent({ modo_perdida: enabled, mensagem_perdida: enabled ? message.trim() : null });
    toast(enabled ? "Modo perdido ativado." : "Modo perdido desativado.");
  } catch (error) { toast("Não foi possível atualizar a tag.", true); }
});

document.getElementById("archiveBtn").addEventListener("click", async () => {
  if (!currentTag || !confirm(`Arquivar "${currentTag.nome}"?`)) return;
  try {
    await updateCurrent({ arquivada: true });
    toast("Tag arquivada. Atualize a página para recarregar a lista.");
  } catch (error) { toast("Não foi possível arquivar a tag.", true); }
});

document.getElementById("analyticsBtn").addEventListener("click", async () => {
  if (!currentTag) return;
  const since = new Date(); since.setDate(since.getDate() - 30);
  const { data, error } = await supabase.from("acessos_publicos")
    .select("origem, acessado_em").eq("tag_id", currentTag.id).gte("acessado_em", since.toISOString());
  if (error) return toast("Não foi possível carregar os acessos.", true);
  const byOrigin = (data || []).reduce((total, item) => ({ ...total, [item.origem]: (total[item.origem] || 0) + 1 }), {});
  alert(`Últimos 30 dias\nTotal: ${(data || []).length}\nLink: ${byOrigin.link || 0}\nQR: ${byOrigin.qr || 0}\nNFC: ${byOrigin.nfc || 0}`);
});

document.getElementById("exportBtn").addEventListener("click", async () => {
  const owner = await user(); if (!owner) return;
  const { data, error } = await supabase.from("tags_nfc").select("nome,tag_id,descricao,publica,cor_publica,contato_publico,modo_perdida,mensagem_perdida,arquivada").eq("usuario_id", owner.id);
  if (error) return toast("Não foi possível criar o backup.", true);
  const blob = new Blob([JSON.stringify({ version: 1, tags: data }, null, 2)], { type: "application/json" });
  const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "nfc-wallet-backup.json" });
  link.click(); URL.revokeObjectURL(link.href);
});

document.getElementById("importBtn").addEventListener("click", () => importInput.click());
importInput.addEventListener("change", async () => {
  const file = importInput.files[0]; importInput.value = "";
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    if (!Array.isArray(backup.tags) || backup.tags.some(tag => !tag.nome || !tag.tag_id)) throw new Error("invalid");
    const owner = await user(); if (!owner) return;
    const tags = backup.tags.map(({ id, usuario_id, criada_em, atualizada_em, ...tag }) => ({ ...tag, usuario_id: owner.id }));
    const { error } = await supabase.from("tags_nfc").upsert(tags, { onConflict: "usuario_id,tag_id" });
    if (error) throw error;
    toast(`${tags.length} tag(s) importada(s). Atualize a página para ver a lista.`);
  } catch (error) { toast("Arquivo de backup inválido ou incompatível.", true); }
});
