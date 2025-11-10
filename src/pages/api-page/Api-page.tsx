import React, { useMemo, useState } from "react";
import { Copy, Code, Check, AlertTriangle, Info, Shield, Activity, List, ChevronDown } from "lucide-react";
import AuthApi from "../../components/AuthApi";

const ENDPOINTS = [
  {
    id: "generate-video",
    method: "POST",
    path: "/app/generate-video",
    auth: "optional",
    desc: "Kick off video generation using Sora-2. Optionally attach an image for reference.",
    body: [
      { name: "prompt", type: "string", required: true, note: "Max 2000 chars." },
      { name: "apiKey", type: "string", required: true, note: "OpenAI API key; if omitted, server env OPENAI_API_KEY is used. (Not recommended on public servers)" },
      { name: "duration", type: "number", required: false, def: 4, note: "Seconds (4–12)." },
      { name: "platform", type: "string", required: false, def: "TikTok", note: "Metadata only." },
      { name: "size", type: "string", required: false, def: "720x1280", note: "e.g., 720x1280, 1280x720" },
      { name: "model", type: "string", required: false, def: "sora-2", note: "Model name forwarded to OpenAI." },
      { name: "image", type: "file", required: false, note: "Optional image file (multipart/form-data)." },
    ],
    responses: [
      { code: 200, body: { id: "string", status: "queued|in_progress|completed|failed",progress:0, url:'', statusUrl: "/app/video-status/:id" } },
      { code: 400, body: { error: "Prompt too long / invalid duration" } },
      { code: 401, body: { error: "API key missing" } },
      { code: 500, body: { error: "Video generation failed", details: "string" } },
    ],
    tags: ["video", "create"],
  },
  {
    id: "video-status",
    method: "GET",
    path: "/app/video-status/:id",
    auth: "required",
    desc: "Retrieve the latest status for a video job. Returns a direct URL once completed.",
    headers: [{ name: "Authorization", value: "Bearer <YOUR_OPENAI_API_KEY>" }],
    responses: [
      { code: 200, body: { id: "string", status: "queued|in_progress|completed|failed", progress: "0-100", url: "string|null", statusUrl: "/app/download-video/:id" } },
      { code: 401, body: { error: "Unauthorized: Missing or invalid token" } },
      { code: 500, body: { error: "Failed to retrieve status", details: "string" } },
    ],
    tags: ["video", "status"],
  },
  {
    id: "download-video",
    method: "GET",
    path: "/app/download-video/:id",
    auth: "required",
    desc: "Downloads finished video (and audio if available) to server storage and returns served paths.",
    headers: [{ name: "Authorization", value: "Bearer <YOUR_OPENAI_API_KEY>" }],
    responses: [
      { code: 200, body: { message: "Video and audio downloaded successfully", id: "string", status: "completed", progress: "100", url: "upload/${id}.mp4" } },
      { code: 400, body: { error: "Video not ready", status: "string", progress: "number" } },
      { code: 401, body: { error: "Unauthorized: Missing or invalid token" } },
      { code: 500, body: { error: "Download failed", details: "string" } },
    ],
    tags: ["video", "download"],
  },
  {
    id: "get-video",
    method: "GET",
    path: "/app/videos/:id",
    auth: "required",
    desc: "Proxy to OpenAI Videos API for a single video resource.",
    headers: [{ name: "Authorization", value: "Bearer <YOUR_OPENAI_API_KEY>" }],
    responses: [
      { code: 200, body: { data: ["OpenAI video object"] } },
      { code: 401, body: { error: "Unauthorized" } },
      { code: 500, body: { error: "Failed to fetch video" } },
    ],
    tags: ["video", "retrieve"],
  },
  {
    id: "list-videos",
    method: "GET",
    path: "/app/videos",
    auth: "required",
    desc: "Lists videos from OpenAI via the server SDK.",
    headers: [{ name: "Authorization", value: "Bearer <YOUR_OPENAI_API_KEY>" }],
    responses: [
      { code: 200, body: { data: ["OpenAI video objects"] } },
      { code: 401, body: { error: "Unauthorized" } },
      { code: 500, body: { error: "Failed to fetch videos" } },
    ],
    tags: ["video", "list"],
  },
  {
    id: "health",
    method: "GET",
    path: "/app/health",
    auth: "none",
    desc: "Health check for uptime monitors.",
    responses: [
      { code: 200, body: { status: "ok", timestamp: "ISO string", activeJobs: "number", uptime: "seconds" } },
    ],
    tags: ["ops"],
  },
  {
    id: "jobs",
    method: "GET",
    path: "/app/jobs",
    auth: "none",
    desc: "Returns in-memory job tracker state (ephemeral).",
    responses: [
      { code: 200, body: { jobs: [{ id: "string", createdAt: "ms", status: "string", videoUrl: "string" }] } },
    ],
    tags: ["ops"],
  },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="whitespace-pre-wrap rounded-2xl bg-zinc-950 text-zinc-100 p-4 text-sm overflow-x-auto border border-zinc-800">
        {code}
      </pre>
      <button
        className="absolute top-2 right-2 rounded-xl shadow bg-zinc-200 hover:bg-zinc-300 p-2 transition-colors"
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs bg-zinc-100 text-zinc-900 border border-zinc-200 ">
      {children}
    </span>
  );
}

function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode; variant?: string; className?: string }) {
  const baseClass = "inline-flex items-center rounded-xl px-2 py-1 text-xs font-medium";
  const variantClass = variant === "secondary" 
    ? "bg-zinc-200 text-zinc-900 "
    : variant === "outline"
    ? "border border-zinc-300  bg-transparent"
    : "bg-zinc-900 text-zinc-100 ";
  
  return <span className={`${baseClass} ${variantClass} ${className}`}>{children}</span>;
}

function EndpointCard({ ep, baseUrl, sampleKey }: any) {
  const [activeTab, setActiveTab] = useState("curl");
  const [expandExamples, setExpandExamples] = useState(false);
  const [expandResponses, setExpandResponses] = useState(false);
  const exampleId = "vid_123456789";

  const curl = useMemo(() => {
    const url = `${baseUrl}${ep.path.replace(":id", exampleId)}`;
    if (ep.method === "POST" && ep.id === "generate-video") {
      return `curl -X POST '${baseUrl}/app/generate-video' \\
  -H 'Accept: application/json' \\
  -F 'prompt=Golden hour city street, whimsical tone' \\
  -F 'duration=8' \\
  -F 'size=720x1280' \\
  -F 'model=sora-2' \\
  -F 'image=@reference.jpg' \\
  -F 'apiKey=${sampleKey}'`;
    }
    const authHeader = ep.auth === "required" ? `-H 'Authorization: Bearer ${sampleKey}' \\
` : "";
    return `curl -X ${ep.method} '${url}' \\
${authHeader}  -H 'Accept: application/json'`;
  }, [ep, baseUrl, sampleKey]);

  const fetchJs = useMemo(() => {
    const url = `${baseUrl}${ep.path.replace(":id", exampleId)}`;
    if (ep.method === "POST" && ep.id === "generate-video") {
      return `const form = new FormData();
form.append('prompt', 'Golden hour city street, whimsical tone');
form.append('duration', '8');
form.append('size', '720x1280');
form.append('model', 'sora-2');
// form.append('image', fileInput.files[0]); // optional
form.append('apiKey', '${sampleKey}');

const res = await fetch('${baseUrl}/app/generate-video', { method: 'POST', body: form });
const json = await res.json();
console.log(json);`;
    }
    const auth = ep.auth === "required" ? `headers: { Authorization: 'Bearer ${sampleKey}' },` : "";
    return `const res = await fetch('${url}', { method: '${ep.method}', ${auth} });
const json = await res.json();
console.log(json);`;
  }, [ep, baseUrl, sampleKey]);

  return (
    <div className="rounded-2xl border border-zinc-200  bg-white ">
      <div className="p-6 flex flex-row items-center justify-between gap-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-xl px-2 py-1 text-xs">
            {ep.method}
          </Badge>
          <h3 className="text-base font-semibold">{ep.path}</h3>
          <div className="hidden md:block">
            <Pill>
              {ep.auth === "required" ? <><Shield className="h-3 w-3"/> auth</> : <>public</>}
            </Pill>
          </div>
        </div>
        <div className="text-xs text-zinc-500">{ep.tags?.map((t:string)=>`#${t}`).join(" ")}</div>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-sm text-zinc-600 ">{ep.desc}</p>

        {ep.body && (
          <div>
            <div className="text-xs font-medium mb-2">Body (multipart/form-data or JSON where applicable)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ep.body.map((f:any) => (
                <div key={f.name} className="rounded-xl border p-2 text-xs bg-zinc-50  border-zinc-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono">{f.name}</span>
                    <span className="opacity-60">{f.type}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {f.required ? <Badge className="rounded-xl">required</Badge> : <Badge variant="outline" className="rounded-xl">optional</Badge>}
                    {f.def !== undefined && <Pill>default: {String(f.def)}</Pill>}
                  </div>
                  {f.note && <div className="mt-1 text-zinc-500">{f.note}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full border border-zinc-200 overflow-auto rounded-2xl">
          <button
            onClick={() => setExpandExamples(!expandExamples)}
            className="w-full p-4 flex items-center  cursor-pointer overflow-hidden justify-between text-sm font-medium hover:bg-zinc-50 transition-colors rounded-t-2xl"
          >
            <span className="flex items-center gap-2">
              <Code className="h-4 w-4"/>
              Examples
            </span>
            <span className={`transform transition-transform ${expandExamples ? 'rotate-180' : ''}`}><ChevronDown /></span>
          </button>
          {expandExamples && (
            <div className="w-full p-4 border-t border-zinc-200 ">
              <div className="w-full mb-4">
                <div className="w-full inline-flex rounded-xl bg-zinc-100  p-1">
                  <button
                    onClick={() => setActiveTab("curl")}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      activeTab === "curl" 
                        ? "bg-white  shadow" 
                        : "hover:bg-zinc-200"
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setActiveTab("fetch")}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      activeTab === "fetch" 
                        ? "bg-white  shadow" 
                        : "hover:bg-zinc-200 "
                    }`}
                  >
                    fetch()
                  </button>
                </div>
              </div>
              {activeTab === "curl" && <CodeBlock code={curl} />}
              {activeTab === "fetch" && <CodeBlock code={fetchJs} />}
            </div>
          )}
        </div>

        <div className="w-full border border-zinc-200 overflow-auto  rounded-2xl">
          <button
            onClick={() => setExpandResponses(!expandResponses)}
            className="w-full p-4 flex items-center cursor-pointer overflow-hidden justify-between text-sm font-medium hover:bg-zinc-50 transition-colors rounded-t-2xl"
          >
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4"/>
              Responses
            </span>
            <span className={`transform transition-transform ${expandResponses ? 'rotate-180' : ''}`}><ChevronDown /></span>
          </button>
          {expandResponses && (
            <div className="w-full p-4 border-t border-zinc-200 ">
              <div className="w-full grid gap-2">
                {ep.responses?.map((r:any, idx:number) => (
                  <div key={idx} className="w-full rounded-xl border p-3 bg-white border-zinc-200">
                    <div className="w-full flex items-center gap-2 text-sm font-medium">
                      <Badge className="rounded-xl">HTTP {r.code}</Badge>
                    </div>
                    <pre className="w-full mt-2 text-xs bg-zinc-50 text-wrap p-3 rounded-xl overflow-x-auto">{JSON.stringify(r.body, null, 2)}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const PollingSnippet = ({ baseUrl, sampleKey }: { baseUrl: string; sampleKey: string }) => {
  const code = `// Poll until completed or failed
async function pollStatus(id) {
  let done = false;
  while (!done) {
    const res = await fetch('${baseUrl}/app/video-status/' + id, {
      headers: { Authorization: 'Bearer ${sampleKey}' },
    });
    const j = await res.json();
    console.log('status', j.status, j.progress);
    if (j.status === 'completed') {
      console.log('download url:', j.url);
      done = true;
    } else if (j.status === 'failed') {
      throw new Error('Video generation failed');
    } else {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}`;
  return <CodeBlock code={code} />;
};

export default function SoraProxyAPIDocs() {
  const [baseUrl, setBaseUrl] = useState(
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:4000'
      : 'https://sora2.croudhive.com'
  );
  const [sampleKey, setSampleKey] = useState("sk-REPLACE_ME");
  const Auth = React.useContext(AuthApi);
  /* @ts-ignore*/
  const {dark,setDark,setRemove,remove,setTheme} = Auth;


  React.useEffect(()=>{
  setTheme('light')
  setDark(false)
  setRemove(true)
  document.body.style.backgroundColor = '#FFF7ED';
  document.body.style.color = 'black';
  
  },[]);

  return (
    <div className="mx-auto max-w-6xl p-3 md:p-10 space-y-8 md:pt-30 pt-30">
      <div className="opacity-0 animate-[fadeIn_0.4s_ease-in_forwards]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Sora2 Generator API</h1>
            <p className="mt-2 max-w-2xl">
              A lightweight wrapper around OpenAI Videos for generating and serving Sora-2 outputs. Includes status polling and on-server downloads.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="rounded-xl"><Activity className="h-3 w-3 mr-1"/>Stable</Badge>
              <Badge variant="secondary" className="rounded-xl">Updated: 9 Nov 2025</Badge>
              <Badge variant="outline" className="rounded-xl"><List className="h-3 w-3 mr-1"/>Express</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200  bg-white">
        <div className="p-6 border-b border-zinc-200">
          <h2 className="text-xl font-semibold">Quick Start</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-zinc-500">Base URL</label>
              <input 
                type="text"
                value={baseUrl} 
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-zinc-500">Sample API Key</label>
              <input 
                type="text"
                value={sampleKey} 
                onChange={(e) => setSampleKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
          </div>

          <div className="text-sm text-zinc-600">
            <p className="mb-2 flex items-center gap-2"><Shield className="h-4 w-4"/> Authentication</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-medium">/app/video-status</span>, <span className="font-medium">/app/download-video</span>, <span className="font-medium">/app/videos</span> require <span className="font-mono">Authorization: Bearer &lt;OPENAI_API_KEY&gt;</span>.</li>
              <li><span className="font-medium">/app/generate-video</span> can accept <span className="font-mono">apiKey</span> in the request body. Prefer server-side keys where possible.</li>
              <li>Static files are served under <span className="font-mono">/upload</span> after downloads.</li>
            </ul>
          </div>

          <div className="text-sm text-zinc-600 ">
            <p className="mb-2 flex items-center gap-2"><Info className="h-4 w-4"/> Node & Polyfills</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>For Node &lt; 18, the server auto-polyfills <span className="font-mono">fetch</span>, <span className="font-mono">FormData</span>, <span className="font-mono">Blob</span>, <span className="font-mono">Headers</span>, <span className="font-mono">Request/Response</span>, and <span className="font-mono">AbortController</span>.</li>
              <li>CORS origins are controlled via <span className="font-mono">ALLOWED_ORIGINS</span> env, defaulting to <span className="font-mono">http://localhost:5173</span> and <span className="font-mono">https://sora2.croudhive.com</span>.</li>
            </ul>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        {ENDPOINTS.map((ep) => (
          <div key={ep.id} className="opacity-0 animate-[fadeIn_0.25s_ease-in_forwards]">
            <EndpointCard ep={ep} baseUrl={baseUrl} sampleKey={sampleKey} />
          </div>
        ))}
      </section>

      <div className="rounded-2xl border border-zinc-200  bg-white ">
        <div className="p-6 border-b border-zinc-200 ">
          <h2 className="text-xl font-semibold">Polling example for client apps</h2>
        </div>
        <div className="p-6">
          <PollingSnippet baseUrl={baseUrl} sampleKey={sampleKey} />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200  bg-white ">
        <div className="p-6 border-b border-zinc-200 ">
          <h2 className="text-xl font-semibold">Common Errors & Troubleshooting</h2>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 mt-0.5"/><p><span className="font-medium">401 Unauthorized</span>: Ensure you include <span className="font-mono">Authorization: Bearer &lt;OPENAI_API_KEY&gt;</span> for protected routes. For <span className="font-mono">/app/generate-video</span>, include <span className="font-mono">apiKey</span> in body or configure <span className="font-mono">OPENAI_API_KEY</span> on the server.</p></div>
          <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 mt-0.5"/><p><span className="font-medium">400 Validation</span>: Prompt required; duration must be 2–20 seconds; prompt max 2000 chars.</p></div>
          <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 mt-0.5"/><p><span className="font-medium">CORS blocked</span>: Set <span className="font-mono">ALLOWED_ORIGINS</span> to include your frontend origin.</p></div>
          <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 mt-0.5"/><p><span className="font-medium">Downloads not appearing</span>: Remember that files are saved under <span className="font-mono">/upload</span> on the server. Verify write permissions and disk space.</p></div>
        </div>
      </div>

     
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}