import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0b1220 0%, #0f172a 60%, #0b1220 100%)", color: "#e2e8f0" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "16px 24px",
          borderBottom: "1px solid rgba(51, 65, 85, 0.6)",
          background: "rgba(11, 18, 32, 0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h4 style={{ margin: 0, color: "#f8fafc", letterSpacing: 0.2 }}>EmulatorJS</h4>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/upload" style={{ padding: "8px 14px", borderRadius: 10, background: "#1677ff", color: "#fff", fontWeight: 600, textDecoration: "none" }}>
              开始上传
            </Link>
            <Link href="/game" style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #334155", color: "#e2e8f0", fontWeight: 600, textDecoration: "none" }}>
              直接进入
            </Link>
          </div>
        </div>
      </header>
      <div style={{ maxWidth: 960, width: "100%", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 32, margin: "0 auto", padding: "128px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
          <p
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(22, 119, 255, 0.18)",
              color: "#bae6ff",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            SSR Landing · EmulatorJS
          </p>
          <h1 style={{ fontSize: 44, lineHeight: 1.1, margin: "0 0 16px" }}>
            在线启动你的经典游戏
          </h1>
          <p style={{ fontSize: 18, color: "#cbd5e1", marginBottom: 24 }}>
            选择 ROM 即可在浏览器内运行，无需安装。支持多种经典主机核心。
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
            <Link
              href="/upload"
              style={{
                padding: "12px 20px",
                borderRadius: 10,
                background: "#1677ff",
                color: "#ffffff",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(22, 119, 255, 0.35)",
              }}
            >
              开始上传
            </Link>
            <Link
              href="/game"
              style={{
                padding: "12px 20px",
                borderRadius: 10,
                border: "1px solid #334155",
                color: "#e2e8f0",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              已上传？前往游戏
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { title: "即开即玩", desc: "上传 ROM 后直接在浏览器运行。" },
              { title: "多平台核心", desc: "覆盖常见 8/16/32 位主机与掌机。" },
              { title: "无插件", desc: "纯前端体验，无需额外安装。" },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              >
                <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#e2e8f0" }}>{item.title}</p>
                <p style={{ margin: 0, color: "#cbd5e1", fontSize: 14 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.45)",
          }}
        >
          <div
            style={{
              background: "#0b1220",
              borderRadius: 12,
              padding: 16,
              border: "1px dashed rgba(148, 163, 184, 0.35)",
              color: "#cbd5e1",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            <h3 style={{ margin: "0 0 10px", color: "#e2e8f0" }}>流程</h3>
            <ol style={{ paddingLeft: 20, margin: 0, display: "grid", gap: 8 }}>
              <li>点击开始上传，选择本地 ROM 文件。</li>
              <li>完成选择后进入游戏页并自动加载核心。</li>
              <li>开始游戏，随时可返回重新选择 ROM。</li>
            </ol>
          </div>
          <div
            style={{
              marginTop: 16,
              background: "#0f172a",
              borderRadius: 12,
              padding: 16,
              border: "1px solid rgba(148, 163, 184, 0.25)",
              color: "#94a3b8",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            提示：首次使用先上传 ROM，若需更换可在游戏页点击返回。
          </div>
        </div>
      </div>
    </main>
  );
}
