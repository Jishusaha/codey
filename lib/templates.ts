import type { ProjectFiles, ProjectTemplate } from './types'

export interface TemplateDef {
  id: ProjectTemplate
  name: string
  description: string
  entry: string
  files: ProjectFiles
}

const reactApp = `export default function App() {
  const projects = [
    { title: "Weather App", tag: "React · API", desc: "A clean forecast app using a public weather API." },
    { title: "Task Board", tag: "TypeScript", desc: "Drag-and-drop kanban board with local persistence." },
    { title: "Portfolio v1", tag: "HTML · CSS", desc: "My very first website, where it all started." },
  ];

  return (
    <main className="page">
      <header className="hero">
        <span className="badge">Available for internships</span>
        <h1>Hi, I'm Jordan Rivera</h1>
        <p className="lead">
          A computer science student who loves turning ideas into clean,
          fast, and accessible web experiences.
        </p>
        <div className="cta">
          <a className="btn primary" href="#work">View my work</a>
          <a className="btn ghost" href="#contact">Get in touch</a>
        </div>
      </header>

      <section id="work" className="section">
        <h2>Selected work</h2>
        <div className="grid">
          {projects.map((p) => (
            <article className="card" key={p.title}>
              <span className="tag">{p.tag}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="section contact">
        <h2>Let's build something</h2>
        <p>Reach me at <a href="mailto:hello@example.com">hello@example.com</a></p>
      </section>
    </main>
  );
}
`

const reactStyles = `* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0f1117;
  --card: #171a23;
  --text: #e8eaf0;
  --muted: #9aa0b4;
  --accent: #6366f1;
  --border: #262a37;
}
body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); }
.page { max-width: 880px; margin: 0 auto; padding: 64px 24px; }
.hero { text-align: center; padding: 48px 0 72px; }
.badge {
  display: inline-block; font-size: 13px; color: var(--accent);
  border: 1px solid var(--border); border-radius: 999px; padding: 6px 14px; margin-bottom: 24px;
}
h1 { font-size: 48px; letter-spacing: -0.02em; margin-bottom: 16px; }
.lead { color: var(--muted); font-size: 19px; line-height: 1.6; max-width: 520px; margin: 0 auto 32px; }
.cta { display: flex; gap: 12px; justify-content: center; }
.btn { text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: 600; font-size: 15px; }
.btn.primary { background: var(--accent); color: white; }
.btn.ghost { border: 1px solid var(--border); color: var(--text); }
.section { padding: 40px 0; }
h2 { font-size: 28px; margin-bottom: 24px; letter-spacing: -0.01em; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; }
.tag { font-size: 12px; color: var(--accent); font-weight: 600; }
.card h3 { margin: 10px 0 8px; font-size: 18px; }
.card p { color: var(--muted); font-size: 14px; line-height: 1.6; }
.contact a { color: var(--accent); }
.contact p { color: var(--muted); font-size: 17px; }
`

const reactIndex = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`

const reactHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`

const staticHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Portfolio</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="page">
      <header class="hero">
        <span class="badge">Student · Web Developer</span>
        <h1>Hi, I'm Jordan Rivera</h1>
        <p class="lead">I build clean, fast websites and I'm learning something new every day.</p>
        <a class="btn" href="#work">View my work</a>
      </header>
      <section id="work" class="section">
        <h2>Projects</h2>
        <div class="grid">
          <article class="card"><h3>Weather App</h3><p>Forecasts from a public API.</p></article>
          <article class="card"><h3>Task Board</h3><p>A drag-and-drop kanban.</p></article>
          <article class="card"><h3>Portfolio v1</h3><p>Where it all started.</p></article>
        </div>
      </section>
    </main>
    <script src="script.js"></script>
  </body>
</html>
`

const staticStyles = `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #0f1117; color: #e8eaf0; }
.page { max-width: 820px; margin: 0 auto; padding: 64px 24px; }
.hero { text-align: center; padding: 48px 0; }
.badge { color: #6366f1; border: 1px solid #262a37; border-radius: 999px; padding: 6px 14px; font-size: 13px; }
h1 { font-size: 46px; margin: 22px 0 14px; letter-spacing: -0.02em; }
.lead { color: #9aa0b4; font-size: 18px; max-width: 480px; margin: 0 auto 28px; line-height: 1.6; }
.btn { display: inline-block; background: #6366f1; color: #fff; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: 600; }
.section { padding: 36px 0; }
h2 { font-size: 26px; margin-bottom: 20px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.card { background: #171a23; border: 1px solid #262a37; border-radius: 14px; padding: 20px; }
.card h3 { margin-bottom: 8px; }
.card p { color: #9aa0b4; font-size: 14px; }
`

const staticScript = `console.log("Portfolio loaded. Edit script.js to add interactivity!");
`

export const TEMPLATES: Record<ProjectTemplate, TemplateDef> = {
  react: {
    id: 'react',
    name: 'React',
    description: 'A component-based portfolio built with React.',
    entry: '/App.js',
    files: {
      '/App.js': reactApp,
      '/styles.css': reactStyles,
      '/index.js': reactIndex,
      '/public/index.html': reactHtml,
    },
  },
  static: {
    id: 'static',
    name: 'Static HTML',
    description: 'A plain HTML, CSS & JS site — no build step.',
    entry: '/index.html',
    files: {
      '/index.html': staticHtml,
      '/styles.css': staticStyles,
      '/script.js': staticScript,
    },
  },
}

export function getTemplate(id: ProjectTemplate): TemplateDef {
  return TEMPLATES[id] ?? TEMPLATES.react
}
