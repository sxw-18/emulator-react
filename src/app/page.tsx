import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0b1220 0%, #0f172a 60%, #0b1220 100%)",
        color: "#e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 32,
        }}
      >
        <div>
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
            分成两个步骤：先上传，再进入游戏
          </h1>
          <p style={{ fontSize: 18, color: "#cbd5e1", marginBottom: 24 }}>
            首页使用 SSR 提供最快的首屏体验。点击开始上传进入 SPA 流程，完成文件选择后自动跳转到游戏页。
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
              { title: "SSR 首屏", desc: "首页纯服务器渲染，无客户端负担。" },
              { title: "SPA 上传", desc: "上传页与游戏页保持前端状态与速度。" },
              { title: "无刷新跳转", desc: "上传完成自动跳转到游戏页面。" },
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
              <li>访问上传页（SPA），选择 ROM 文件。</li>
              <li>上传完成自动跳转到游戏页（SPA）。</li>
              <li>游戏页加载 EmulatorJS 并启动模拟器。</li>
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
            提示：游戏页需要上传页的文件上下文，请先上传再进入游戏。
          </div>
        </div>
      </div>
    </main>
  );
}
