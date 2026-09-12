import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { files, projectId, projectName = "portfolio-site" } = await req.json();

    if (!files || typeof files !== "object") {
      throw new Error("Missing files payload");
    }

    if (!process.env.VERCEL_API_TOKEN) {
      throw new Error(
        "Missing VERCEL_API_TOKEN. Add your Vercel token to .env.local to enable deployment."
      );
    }

    const formattedFiles = Object.entries(files).map(([file, data]) => {
      if (typeof data !== "string") {
        throw new Error(`File content for ${file} must be a string`);
      }

      return {
        file: file.startsWith("/") ? file.slice(1) : file,
        data: Buffer.from(data, "utf8").toString("base64"),
        encoding: "base64",
      };
    });

    const fileNames = Object.keys(files).map((file) => file.replace(/^\//, ""));
    const htmlFile = fileNames.includes("public/index.html")
      ? files["/public/index.html"]
      : files["/index.html"];

    if (htmlFile && !fileNames.includes("index.html")) {
      formattedFiles.push({
        file: "index.html",
        data: Buffer.from(htmlFile, "utf8").toString("base64"),
        encoding: "base64",
      });
    }

    if (!fileNames.includes("package.json")) {
      formattedFiles.push({
        file: "package.json",
        data: Buffer.from(
          JSON.stringify({
            scripts: { build: "vite build" },
            dependencies: { "@vitejs/plugin-react": "latest", vite: "latest", react: "latest", "react-dom": "latest" },
            devDependencies: {},
          }),
          "utf8",
        ).toString("base64"),
        encoding: "base64",
      });
    }

    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: String(projectName).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "portfolio-site",
        files: formattedFiles,
        projectSettings: {
          framework: "vite",
        },
      }),
    });

    const deploymentData = await response.json();

    if (!response.ok) {
      throw new Error(deploymentData.error?.message || "Failed to deploy");
    }

    const url = `https://${deploymentData.url}`;

    if (typeof projectId === "string") {
      await fetch(new URL(`/api/projects/${projectId}`, req.url), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", cookie: req.headers.get("cookie") || "" },
        body: JSON.stringify({
          deploy_url: url,
          deploy_status: "ready",
          deployment_id: deploymentData.id,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}