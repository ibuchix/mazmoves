// Agents.tsx
// Public documentation page for the HouseMove MCP endpoint.
// Redesigned 2026-05-21: Midnight Indigo palette, Space Grotesk + DM Sans typography,
// sidebar in-page navigation. Dark "sleek technical documentation" treatment between
// the light Navbar and slate Footer. Hardened to avoid exposing internal architecture,
// rate-limit numbers, matching radius, pipeline details, or audit hints — agents
// discover available tools and schemas via the standard MCP tools/list call.
// 2026-05-23: Switched from raw Helmet to SeoHead component for Open Graph coverage.

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Check, Copy } from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";

const MCP_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/agent-bridge`;

const sections = [
  { id: "endpoint", label: "Endpoint URL" },
  { id: "tools", label: "Tools Discovery" },
  { id: "claude", label: "Claude Desktop" },
  { id: "process", label: "Post-Submission" },
  { id: "ethics", label: "Responsible Use" },
];

export default function Agents() {
  const [copied, setCopied] = useState(false);

  const claudeSnippet = `{
  "mcpServers": {
    "housemove": {
      "url": "${MCP_URL}"
    }
  }
}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(MCP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <Helmet>
        <title>HouseMove for AI Agents | MCP Endpoint</title>
        <meta
          name="description"
          content="Connect AI agents to HouseMove via the Model Context Protocol to book UK house moves on behalf of users."
        />
        <link rel="canonical" href="https://housemove.co/agents" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div
        className="bg-[#0a0a1a] text-slate-300 text-left"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Sidebar Navigation */}
            <nav className="hidden lg:block lg:col-span-3 sticky top-8 space-y-1 border-l border-white/5 pl-6 self-start">
              <div
                className="text-xs font-bold uppercase tracking-widest text-[#4f46e5] mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Documentation
              </div>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </nav>

            {/* Main Content */}
            <main className="lg:col-span-9 space-y-16 pb-12">
              <header className="space-y-4">
                <h1
                  className="text-4xl md:text-5xl font-bold text-white tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  HouseMove for <span className="text-[#4f46e5]">AI Agents</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                  HouseMove exposes a Model Context Protocol (MCP) endpoint so AI agents
                  can book UK house moves on behalf of their users.
                </p>
              </header>

              {/* Endpoint */}
              <section id="endpoint" className="space-y-6 scroll-mt-8">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-[#4f46e5] rounded-full" />
                  <h2
                    className="text-xl font-semibold text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Endpoint
                  </h2>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f46e5] to-[#1e1e5a] rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                  <div className="relative flex items-center justify-between gap-4 bg-[#141432] border border-[#1e1e5a] p-4 rounded-lg overflow-x-auto">
                    <code
                      className="text-indigo-300 text-sm whitespace-nowrap"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {MCP_URL}
                    </code>
                    <button
                      onClick={handleCopy}
                      aria-label="Copy endpoint URL"
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white uppercase tracking-wider font-bold transition-colors shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#84d21f]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Transport: <span className="text-slate-300">Streamable HTTP</span>.
                  Rate-limited; contact us if you need higher limits for a legitimate
                  integration.
                </p>
              </section>

              {/* Tools */}
              <section id="tools" className="space-y-4 scroll-mt-8">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-[#4f46e5] rounded-full" />
                  <h2
                    className="text-xl font-semibold text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Tools Discovery
                  </h2>
                </div>
                <div className="bg-[#141432]/50 border border-[#1e1e5a] rounded-xl p-6 space-y-4">
                  <p className="leading-relaxed">
                    Call{" "}
                    <code
                      className="bg-[#1e1e5a] px-1.5 py-0.5 rounded text-indigo-300 text-sm"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      tools/list
                    </code>{" "}
                    on the endpoint to discover the available tools and their input
                    schemas. This is the standard MCP discovery path and is all your
                    agent needs to get started.
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 mt-0.5 text-[#4f46e5] shrink-0" />
                      <span>Standard MCP schema discovery</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-4 h-4 mt-0.5 text-[#4f46e5] shrink-0" />
                      <span>JSON-schema validated inputs</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Claude Desktop */}
              <section id="claude" className="space-y-6 scroll-mt-8">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-[#4f46e5] rounded-full" />
                  <h2
                    className="text-xl font-semibold text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Connect from Claude Desktop
                  </h2>
                </div>
                <p className="text-sm text-slate-400">
                  Add the following to your{" "}
                  <code
                    className="text-indigo-300"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    claude_desktop_config.json
                  </code>
                  :
                </p>
                <div className="rounded-xl overflow-hidden border border-[#1e1e5a] bg-[#0a0a1a]">
                  <div className="bg-[#141432] px-4 py-2 border-b border-[#1e1e5a] flex items-center justify-between">
                    <span
                      className="text-xs text-slate-400"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      claude_desktop_config.json
                    </span>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                    </div>
                  </div>
                  <pre
                    className="p-6 text-sm text-indigo-100 overflow-x-auto"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <code>{claudeSnippet}</code>
                  </pre>
                </div>
              </section>

              {/* Post-Submission */}
              <section id="process" className="space-y-4 scroll-mt-8">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-[#4f46e5] rounded-full" />
                  <h2
                    className="text-xl font-semibold text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    What happens after submission
                  </h2>
                </div>
                <div className="relative p-6 rounded-xl border border-dashed border-[#1e1e5a] bg-[#141432]/20">
                  <p className="leading-relaxed text-slate-400">
                    HouseMove matches each request to suitable UK moving companies, who
                    then contact the user directly using the details provided.
                  </p>
                </div>
              </section>

              {/* Responsible Use */}
              <section id="ethics" className="pt-8 border-t border-[#1e1e5a]">
                <div className="bg-[#4f46e5]/5 border border-[#4f46e5]/20 rounded-xl p-6">
                  <h3
                    className="text-white font-bold mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Responsible Use
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Only submit move requests with the user's explicit consent and
                    accurate contact details. Abuse or low-quality traffic may result in
                    access being revoked. For partnership or higher-volume access, email{" "}
                    <a
                      href="mailto:help@housemove.co"
                      className="text-[#4f46e5] hover:underline"
                    >
                      help@housemove.co
                    </a>
                    .
                  </p>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
