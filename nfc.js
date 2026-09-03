// A Web NFC não expõe o UID físico de forma confiável; use o conteúdo NDEF.
export function getNdefIdentifier(event) {
    const record = event.message?.records?.find(item =>
        ["text", "url", "absolute-url"].includes(item.recordType)
    );

    if (!record?.data)
        return null;

    const bytes = new Uint8Array(record.data.buffer, record.data.byteOffset, record.data.byteLength);
    const payload = record.recordType === "text"
        ? bytes.slice(1 + (bytes[0] & 0x3f))
        : bytes;
    const value = new TextDecoder(record.encoding || "utf-8").decode(payload).trim();

    return value || null;
}
