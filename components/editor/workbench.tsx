"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import * as Babel from "@babel/standalone";
import Editor from "@monaco-editor/react";
import {
  Sparkles,
  Rocket,
  Save,
  FilePlus2,
  Trash2,
  Eye,
  Code2,
  Loader2,
  ExternalLink,
  CheckCircle2,
  CircleAlert,
  CloudUpload,
  Smartphone,
  Monitor,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";

/* ---------- Types ---------- */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface WorkbenchProps {
  projectId: string;
  projectName: string;
  initialFiles: Record<string, string>;
}

type DeployState = "idle" | "building" | "ready" | "error";
type PreviewMode = "desktop" | "mobile";

/* ---------- File icon helper ---------- */

function fileIcon(path: string): string {
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".js") || path.endsWith(".jsx")) return "js";
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return "ts";
  if (path.endsWith(".json")) return "json";
  return "file";
}

/* ---------- Local preview: renders React + HTML files in a shadow DOM ---------- */

function LocalPreview({
  files,
  mode,
  refreshKey,
}: {
  files: Record<string, string>;
  mode: PreviewMode;
  refreshKey: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const rootRef = useRef<Root | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const shadowRoot = shadowRootRef.current ?? container.attachShadow({ mode: "open" });
    shadowRootRef.current = shadowRoot;
    setPreviewError(null);

    const reactEntry =
      files["/App.js"] || files["/App.jsx"] || files["/App.tsx"];
    const htmlEntry = files["/index.html"] || files["/public/index.html"];
    const styles = files["/styles.css"] || files["/App.css"] || "";

    if (htmlEntry && !reactEntry) {
      // Static HTML preview
      rootRef.current?.render(null);
      rootRef.current = null;
      shadowRoot.replaceChildren();
      const style = document.createElement("style");
      style.textContent = styles;
      shadowRoot.appendChild(style);
      const mount = document.createElement("div");
      mount.style.height = "100%";
      mount.style.overflow = "auto";
      mount.style.background = "white";
      mount.style.color = "black";
      mount.style.fontSize = "14px";
      shadowRoot.appendChild(mount);

      // Inject the HTML body content into the mount div
      const bodyMatch = htmlEntry.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const bodyContent = bodyMatch ? bodyMatch[1] : htmlEntry;

      // Extract and remove script tags for safety in preview
      const cleanedContent = bodyContent.replace(
        /<script[\s\S]*?<\/script>/gi,
        "",
      );
      mount.innerHTML = cleanedContent;
      return;
    }

    if (!reactEntry) {
      shadowRoot.textContent =
        "Preview requires an App.js, App.jsx, App.tsx, or index.html entry file.";
      return;
    }

    try {
      const transformed = Babel.transform(reactEntry, {
        presets: ["react", "env"],
        plugins: ["transform-modules-commonjs"],
      });
      if (!transformed?.code)
        throw new Error("The preview code could not be transformed.");

      const module = { exports: {} as { default?: React.ComponentType } };
      const requireModule = (name: string) => {
        if (name === "react") return React;
        if (name === "react/jsx-runtime" || name === "react/jsx-dev-runtime") {
          const jsx = (
            type: React.ElementType,
            props: Record<string, unknown>,
            key?: string,
          ) => React.createElement(type, { ...props, key });
          const jsxs = (
            type: React.ElementType,
            props: Record<string, unknown>,
            key?: string,
          ) => {
            const children = Array.isArray(props.children)
              ? props.children.map((child, index) =>
                  React.isValidElement(child) && child.key == null
                    ? React.cloneElement(child, { key: `preview-${index}` })
                    : child,
                )
              : props.children;
            return React.createElement(type, { ...props, children, key });
          };
          return { jsx, jsxs, jsxDEV: jsxs, Fragment: React.Fragment };
        }
        if (name === "react-dom/client") return { createRoot };
        throw new Error(`Preview dependency not available: ${name}`);
      };

      new Function("require", "module", "exports", transformed.code)(
        requireModule,
        module,
        module.exports,
      );

      const App = module.exports.default;
      if (!App)
        throw new Error("The preview entry must export a default React component.");

      rootRef.current?.render(null);
      rootRef.current = null;
      shadowRoot.replaceChildren();
      const style = document.createElement("style");
      style.textContent = styles;
      shadowRoot.appendChild(style);
      const mount = document.createElement("div");
      mount.style.height = "100%";
      mount.style.overflow = "auto";
      mount.style.background = "white";
      mount.style.color = "black";
      mount.style.fontSize = "14px";
      shadowRoot.appendChild(mount);
      rootRef.current = createRoot(mount);
      rootRef.current.render(React.createElement(App));
    } catch (previewError) {
      rootRef.current?.render(null);
      rootRef.current = null;
      const msg =
        previewError instanceof Error
          ? previewError.message
          : "Unable to render this preview.";
      setPreviewError(msg);
      shadowRoot.replaceChildren();
      const errorDiv = document.createElement("div");
      errorDiv.style.cssText =
        "padding:24px;font-family:monospace;font-size:13px;color:#ef4444;background:#1a1a2e;height:100%;overflow:auto;white-space:pre-wrap;";
      errorDiv.textContent = `Preview Error\n\n${msg}`;
      shadowRoot.appendChild(errorDiv);
    }

    return () => {
      rootRef.current?.render(null);
      rootRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, refreshKey]);

  return (
    <div
      className="flex h-full items-stretch justify-center overflow-hidden bg-zinc-900 p-2"
      style={{ padding: mode === "mobile" ? "12px" : "0" }}
    >
      <div
        ref={containerRef}
        className="h-full overflow-auto bg-white text-sm text-zinc-900 transition-all"
        style={{
          width: mode === "mobile" ? "375px" : "100%",
          borderRadius: mode === "mobile" ? "20px" : "0",
          border: mode === "mobile" ? "8px solid #1a1a2e" : "none",
          maxWidth: "100%",
        }}
      />
    </div>
  );
}

/* ---------- Main Workbench component ---------- */

export function Workbench({ projectId, projectName, initialFiles }: WorkbenchProps) {
  const [activeFile, setActiveFile] = useState<string>(
    initialFiles["/App.js"]
      ? "/App.js"
      : initialFiles["/index.html"]
        ? "/index.html"
        : Object.keys(initialFiles)[0] || "/App.js",
  );
  const [files, setFiles] = useState<Record<string, string>>(initialFiles);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deployState, setDeployState] = useState<DeployState>("idle");
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [refreshKey, setRefreshKey] = useState(0);
  const [rightTab, setRightTab] = useState<"chat" | "preview">("chat");
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save debounce
  const scheduleAutoSave = useCallback(() => {
    setUnsavedChanges(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      handleSave(true);
    }, 3000);
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined || !activeFile) return;
    setFiles((prev) => ({ ...prev, [activeFile]: value }));
    scheduleAutoSave();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const nextMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: prompt.trim() },
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          currentFiles: files,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.files) {
        throw new Error(data?.error || "Failed to generate project files.");
      }

      const nextFiles = Object.fromEntries(
        data.files.map((item: { path: string; content: string }) => {
          const normalizedPath = item.path.startsWith("/")
            ? item.path
            : `/${item.path}`;
          return [normalizedPath, item.content];
        }),
      );

      setFiles((prev) => ({ ...prev, ...nextFiles }));
      setMessages((prev) => [
        ...prev,
        { role: "user", content: prompt.trim() },
        {
          role: "assistant",
          content: data.explanation || "Updated the project files.",
        },
      ]);

      const firstUpdatedPath = Object.keys(nextFiles)[0];
      if (firstUpdatedPath) setActiveFile(firstUpdatedPath);
      setPrompt("");
      setRefreshKey((k) => k + 1);
      scheduleAutoSave();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the site.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (auto = false) => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to save project.");
      setSavedAt(
        new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      );
      setUnsavedChanges(false);
      if (!auto) toast.success("Project saved");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project.");
      if (!auto) toast.error("Failed to save project");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployState("building");
    setError(null);

    try {
      const saved = await handleSave();
      if (!saved) {
        setDeployState("error");
        return;
      }

      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, projectId, projectName }),
      });
      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Deployment failed.");
      }

      setDeployUrl(data.url);
      setDeployState("ready");
      toast.success("Deployed successfully!", {
        description: "Your site is live.",
        action: {
          label: "Visit",
          onClick: () =>
            window.open(data.url, "_blank", "noopener,noreferrer"),
        },
      });
    } catch (err) {
      setDeployState("error");
      setError(err instanceof Error ? err.message : "Deployment failed.");
      toast.error("Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleAddFile = () => {
    let name = newFileName.trim();
    if (!name) return;
    if (!name.startsWith("/")) name = `/${name}`;
    if (files[name]) {
      toast.error("File already exists");
      return;
    }
    setFiles((prev) => ({ ...prev, [name]: "" }));
    setActiveFile(name);
    setShowNewFile(false);
    setNewFileName("");
    scheduleAutoSave();
  };

  const handleDeleteFile = (path: string) => {
    if (Object.keys(files).length <= 1) {
      toast.error("Cannot delete the last file");
      return;
    }
    setFiles((prev) => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
    if (activeFile === path) {
      const remaining = Object.keys(files).filter((k) => k !== path);
      setActiveFile(remaining[0] || "/App.js");
    }
    scheduleAutoSave();
  };

  const handleRefreshPreview = () => {
    setRefreshKey((k) => k + 1);
  };

  const getLanguage = (path: string): string => {
    if (path.endsWith(".css")) return "css";
    if (path.endsWith(".html")) return "html";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
    return "javascript";
  };

  const deployBadge = () => {
    switch (deployState) {
      case "building":
        return (
          <span className="flex items-center gap-1.5 rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-400">
            <CloudUpload className="size-3 animate-pulse" />
            Deploying...
          </span>
        );
      case "ready":
        return (
          <span className="flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="size-3" />
            Live
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1.5 rounded-md bg-red-500/15 px-2.5 py-1 text-xs font-medium text-red-400">
            <CircleAlert className="size-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-zinc-950 text-white">
      {/* Toolbar */}
      <header className="flex h-12 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-200">{projectName}</span>
          {deployBadge()}
          {unsavedChanges && (
            <span className="text-xs text-amber-400/70">Unsaved changes</span>
          )}
          {savedAt && !unsavedChanges && (
            <span className="text-xs text-zinc-500">Saved at {savedAt}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Save
          </button>
          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeploying ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Rocket className="size-3.5" />
            )}
            Deploy
          </button>
          {deployState === "ready" && deployUrl && (
            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-emerald-600/40 px-3 py-1.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-600/10"
            >
              <ExternalLink className="size-3.5" />
              Visit
            </a>
          )}
        </div>
      </header>

      <div className="grid flex-1 grid-cols-12 overflow-hidden">
        {/* File Explorer */}
        <aside className="col-span-2 border-r border-zinc-800 bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Files
            </p>
            <button
              onClick={() => setShowNewFile(!showNewFile)}
              className="text-zinc-500 transition hover:text-zinc-200"
              title="New file"
            >
              <FilePlus2 className="size-3.5" />
            </button>
          </div>

          {showNewFile && (
            <div className="border-b border-zinc-800 p-2">
              <input
                autoFocus
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddFile();
                  if (e.key === "Escape") {
                    setShowNewFile(false);
                    setNewFileName("");
                  }
                }}
                placeholder="filename.js"
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:outline-none"
              />
            </div>
          )}

          <div className="flex flex-col gap-0.5 p-2">
            {Object.keys(files).map((filePath) => (
              <div
                key={filePath}
                className={`group flex items-center gap-1.5 rounded px-2 py-1.5 text-sm transition ${
                  activeFile === filePath
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <button
                  onClick={() => setActiveFile(filePath)}
                  className="flex flex-1 items-center gap-1.5 text-left"
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      fileIcon(filePath) === "css"
                        ? "bg-blue-400"
                        : fileIcon(filePath) === "html"
                          ? "bg-orange-400"
                          : fileIcon(filePath) === "ts"
                            ? "bg-cyan-400"
                            : "bg-yellow-400"
                    }`}
                  />
                  {filePath.replace(/^\//, "")}
                </button>
                <button
                  onClick={() => handleDeleteFile(filePath)}
                  className="opacity-0 transition group-hover:opacity-100"
                  title="Delete file"
                >
                  <Trash2 className="size-3 text-zinc-500 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Monaco Editor */}
        <main className="col-span-5 border-r border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-zinc-400">
            <span className="font-mono">{activeFile}</span>
            <Code2 className="size-3.5 text-zinc-600" />
          </div>
          <div className="h-[calc(100%-36px)]">
            <Editor
              height="100%"
              theme="vs-dark"
              path={activeFile}
              defaultLanguage={getLanguage(activeFile)}
              language={getLanguage(activeFile)}
              value={files[activeFile] || ""}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                smoothScrolling: true,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </main>

        {/* Right Panel: AI Chat + Preview */}
        <section className="col-span-5 flex flex-col bg-zinc-900">
          {/* Tab Switcher */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-1.5">
            <div className="flex gap-1">
              <button
                onClick={() => setRightTab("chat")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  rightTab === "chat"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Sparkles className="size-3.5" />
                AI Builder
              </button>
              <button
                onClick={() => setRightTab("preview")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  rightTab === "preview"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Eye className="size-3.5" />
                Preview
              </button>
            </div>
            {rightTab === "preview" && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`rounded p-1 transition ${
                    previewMode === "desktop"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="Desktop view"
                >
                  <Monitor className="size-3.5" />
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`rounded p-1 transition ${
                    previewMode === "mobile"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="Mobile view"
                >
                  <Smartphone className="size-3.5" />
                </button>
                <button
                  onClick={handleRefreshPreview}
                  className="rounded p-1 text-zinc-500 transition hover:text-zinc-300"
                  title="Refresh preview"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {rightTab === "chat" ? (
            /* AI Chat Panel */
            <div className="flex flex-1 flex-col gap-3 p-3 overflow-hidden">
              <div className="flex min-h-0 flex-1 flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15">
                        <Sparkles className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-300">
                          AI-powered builder
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Describe what you want to build and I&apos;ll generate
                          or update the files for you.
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={`${message.role}-${index}`}
                        className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                          message.role === "user"
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "bg-zinc-800 text-zinc-200"
                        }`}
                      >
                        {message.content}
                      </div>
                    ))
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button
                      onClick={() => setError(null)}
                      className="shrink-0 text-red-300/70 hover:text-red-200"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder="e.g. Build a portfolio landing page with a dark theme, hero section, projects grid, and a contact form..."
                  className="w-full resize-none bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                />
                <div className="mt-2 flex items-center justify-end">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3.5" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Preview Panel */
            <div className="flex-1 overflow-hidden">
              <LocalPreview
                files={files}
                mode={previewMode}
                refreshKey={refreshKey}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
