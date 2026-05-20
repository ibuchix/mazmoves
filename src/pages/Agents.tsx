// Agents.tsx
// Public documentation page describing the HouseMove MCP endpoint for AI agents.
// Pure docs — no interactive UI, no auth. Linked from the footer.

import { Helmet } from "react-helmet-async";

const MCP_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/mcp-server`;

export default function Agents() {
  const claudeSnippet = `{
  "mcpServers": {
    "housemove": {
      "url": "${MCP_URL}"
    }
  }
}`;

  return (
    <>
      <Helmet>
        <title>HouseMove for AI Agents | MCP Endpoint</title>
        <meta
          name="description"
          content="Connect AI agents to HouseMove via the Model Context Protocol to book UK house moves on behalf of users."
        />
        <link rel="canonical" href="https://housemove.co/agents" />
      </Helmet>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-roboto text-[#333]">
        <h1 className="font-montserrat font-bold text-3xl sm:text-4xl text-brand-navy mb-4">
          HouseMove for AI Agents
        </h1>
        <p className="text-lg mb-8">
          HouseMove exposes a Model Context Protocol (MCP) endpoint so AI agents can
          book UK house moves on behalf of their users. The matching, geocoding, and
          notification pipeline is identical to the human form.
        </p>

        <section className="mb-10">
          <h2 className="font-montserrat font-bold text-2xl text-brand-navy mb-3">Endpoint</h2>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm">
            <code>{MCP_URL}</code>
          </pre>
          <p className="mt-3 text-sm text-slate-600">
            Transport: <strong>Streamable HTTP</strong>. No API key required in v1.
            Limits: 2 submissions and 30 tool calls per IP per 24 hours.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-montserrat font-bold text-2xl text-brand-navy mb-3">Tools</h2>
          <ul className="space-y-4">
            <li>
              <strong className="text-brand-royal">get_required_fields</strong> — returns
              the JSON schema your agent must fill before submitting. Call it once at
              the start of a session so you know what to collect from the user.
            </li>
            <li>
              <strong className="text-brand-royal">submit_move_request</strong> — submits
              a move request. We geocode the addresses, insert the request, and notify
              nearby moving companies. Returns a request id.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-montserrat font-bold text-2xl text-brand-navy mb-3">
            Connect from Claude Desktop
          </h2>
          <p className="mb-3 text-sm">
            Add the following to your <code>claude_desktop_config.json</code>:
          </p>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm">
            <code>{claudeSnippet}</code>
          </pre>
        </section>

        <section className="mb-10">
          <h2 className="font-montserrat font-bold text-2xl text-brand-navy mb-3">
            What happens after submission
          </h2>
          <p>
            Once a request is submitted, HouseMove finds moving companies within a 25-mile
            radius of either the pickup or delivery address and notifies them. Companies
            then contact the user directly using the phone and email provided.
          </p>
        </section>

        <section>
          <h2 className="font-montserrat font-bold text-2xl text-brand-navy mb-3">
            Responsible use
          </h2>
          <p>
            Only submit move requests with the user's explicit consent and accurate
            contact details. Submissions are tagged so HouseMove staff can audit agent
            traffic and revoke access if abuse is detected.
          </p>
        </section>
      </main>
    </>
  );
}
