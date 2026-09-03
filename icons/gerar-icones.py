"""Gera os ícones PNG do PWA (192x192 e 512x512).

Uso: python3 icons/gerar-icones.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

DESTINO = Path(__file__).resolve().parent

FUNDO = (5, 7, 13, 255)
CIANO = (0, 207, 255, 255)
CIANO_SUAVE = (0, 255, 255, 140)


def gerar(tamanho: int) -> Image.Image:
    escala = 4
    lado = tamanho * escala

    imagem = Image.new("RGBA", (lado, lado), FUNDO)
    desenho = ImageDraw.Draw(imagem)

    centro = lado / 2
    espessura = max(2, int(lado * 0.035))

    # Losango central (símbolo ◈ da marca).
    raio = lado * 0.17
    desenho.polygon(
        [
            (centro, centro - raio),
            (centro + raio, centro),
            (centro, centro + raio),
            (centro - raio, centro),
        ],
        outline=CIANO,
        width=espessura,
    )

    raio_interno = raio * 0.45
    desenho.polygon(
        [
            (centro, centro - raio_interno),
            (centro + raio_interno, centro),
            (centro, centro + raio_interno),
            (centro - raio_interno, centro),
        ],
        fill=CIANO,
    )

    # Ondas NFC.
    for indice in range(1, 4):
        raio_onda = raio + lado * 0.075 * indice
        caixa = [
            centro - raio_onda,
            centro - raio_onda,
            centro + raio_onda,
            centro + raio_onda,
        ]
        desenho.arc(caixa, start=-55, end=55, fill=CIANO_SUAVE, width=espessura)
        desenho.arc(caixa, start=125, end=235, fill=CIANO_SUAVE, width=espessura)

    return imagem.resize((tamanho, tamanho), Image.LANCZOS)


def main() -> None:
    for tamanho in (192, 512):
        caminho = DESTINO / f"icon-{tamanho}.png"
        gerar(tamanho).save(caminho)
        print(f"gerado: {caminho}")


if __name__ == "__main__":
    main()
