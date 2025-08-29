import { useCallback, useEffect, useMemo, useState } from "react";

type RGB = { r: number; g: number; b: number };

function randomHex(): string {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0").toUpperCase();
}
function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function rgbToString({ r, g, b }: RGB) {
  return `rgb(${r}, ${g}, ${b})`;
}
// Perceived luminance (WCAG-ish) para escolher cor do texto
function isDark(rgb: RGB): boolean {
  const L = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return L < 0.6; // limiar simples
}

export default function App() {
  const [hex, setHex] = useState<string>(randomHex());
  const [history, setHistory] = useState<string[]>([]);

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const textDark = useMemo(() => !isDark(rgb), [rgb]); // se fundo for escuro, texto claro; caso contrário, escuro

  const pushHistory = useCallback((c: string) => {
    setHistory((prev) => [c, ...prev.filter((x) => x !== c)].slice(0, 12));
  }, []);

  const generate = useCallback(() => {
    const c = randomHex();
    setHex(c);
    pushHistory(c);
  }, [pushHistory]);

  useEffect(() => {
    // inicia com 6 cores no histórico
    const seed = Array.from({ length: 6 }, () => randomHex());
    setHistory(seed);
  }, []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`Copiado: ${text}`);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      alert(`Copiado: ${text}`);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <div className="title">🎨 Gerador de Cores</div>
        <div className="btns">
          <button onClick={generate}>Gerar cor</button>
          <button className="secondary" onClick={() => { setHex("#000000"); pushHistory("#000000"); }}>Reset</button>
        </div>
      </div>

      <div className="color-card">
        <div className="swatch" style={{ background: hex, color: textDark ? "#0b1220" : "#e5e7eb" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 800 }}>{hex}</div>
            <div className="code" style={{ opacity: 0.85 }}>{rgbToString(rgb)}</div>
            <div className="tip">Clique em copiar para usar no seu CSS</div>
          </div>
        </div>
        <div className="meta">
          <div className="item">
            <div className="code">HEX: {hex}</div>
            <button className="copy" onClick={() => copy(hex)}>Copiar</button>
          </div>
          <div className="item">
            <div className="code">RGB: {rgbToString(rgb)}</div>
            <button className="copy" onClick={() => copy(rgbToString(rgb))}>Copiar</button>
          </div>
        </div>
      </div>

      <div className="tip">Histórico (clique para aplicar):</div>
      <div className="grid">
        {history.map((c) => (
          <button key={c} className="hist" style={{ background: c }} onClick={() => setHex(c)} title={c} />
        ))}
      </div>
    </div>
  );
}
