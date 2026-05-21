// Agents.tsx
// Public documentation page for the HouseMove MCP endpoint.
// Hardened to avoid exposing internal architecture, rate-limit numbers,
// matching radius, pipeline details, or audit hints. Agents discover
// available tools and schemas via the standard MCP tools/list call.

import { Helmet } from "react-helmet-async";

const MCP_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/agent-bridge`;

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
          book UK house moves on behalf of their users.
        </p>

        <section className="mb-10">
          <h2 className="font-montserrat font-bold text-2xl text-brand-navy mb-3">Endpoint</h2>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto text-sm">
            <code>{MCP_URL}</code>
          </pre>
          <p className="mt-3 text-sm text-slate-600">
            Transport: <strong>Streamable HTTP</strong>. Rate-limited; contact us if you
            need higher limits for a legitimate integration.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-montserrat font-bold text-2xl text-brand-navy mb-3">Tools</h2>
          <p>
            Call <code>tools/list</code> on the endpoint to discover the available
            tools and their input schemas. This is the standard MCP discovery path
            and is all your agent needs to get started.
          </p>
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
            HouseMove matches each request to suitable UK moving companies, who then
            contact the user directly using the details provided.
          </p>
        </section>

        <section>
          <h2 className="font-montserrat font-bold text-2xl text-brand-navy mb-3">
            Responsible use
          </h2>
          <p>
            Only submit move requests with the user's explicit consent and accurate
            contact details. Abuse or low-quality traffic may result in access being
            revoked. For partnership or higher-volume access, email{" "}
            <a className="text-brand-royal underline" href="mailto:help@housemove.co">
              help@housemove.co
            </a>
            .
          </p>
        </section>
      </main>
    </>
  );
}
