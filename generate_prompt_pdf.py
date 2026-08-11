from pathlib import Path

from weasyprint import HTML


workspace = Path(__file__).resolve().parent
prompt_md_path = workspace / "wisp_ms_master_prompt.md"
pdf_path = workspace / "WISP_MS_Claude_Master_Prompt.pdf"
html_path = workspace / "wisp_ms_master_prompt.html"

prompt_text = prompt_md_path.read_text(encoding="utf-8")

html_content = f"""
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WISP-MS Claude Master Prompt</title>
    <style>
      @page {{
        size: A4;
        margin: 22mm 18mm;
      }}

      :root {{
        --bg: #f8fafc;
        --panel: #ffffff;
        --ink: #0f172a;
        --muted: #475569;
        --line: #e2e8f0;
        --heading: #1d4ed8;
        --accent: #0f172a;
        --soft: #eff6ff;
        --soft-border: #bfdbfe;
      }}

      * {{ box-sizing: border-box; }}

      body {{
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background: var(--bg);
        color: var(--ink);
        font-size: 10.5pt;
        line-height: 1.5;
      }}

      .page {{
        padding: 0;
      }}

      .header {{
        background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
        color: white;
        padding: 22px 24px 18px;
        border-radius: 12px;
        margin-bottom: 18px;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.15);
      }}

      .header h1 {{
        margin: 0 0 6px;
        font-size: 20pt;
        font-weight: 700;
        letter-spacing: -0.04em;
      }}

      .header p {{
        margin: 0;
        color: #dbeafe;
        font-size: 10.2pt;
      }}

      .tag-row {{
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }}

      .tag {{
        display: inline-block;
        background: rgba(255,255,255,0.14);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 8.2pt;
        font-weight: 600;
        letter-spacing: 0.02em;
      }}

      .guide-box {{
        background: var(--soft);
        border-left: 4px solid var(--heading);
        border: 1px solid var(--soft-border);
        border-left-width: 4px;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 18px;
      }}

      .guide-box h3 {{
        margin: 0 0 6px;
        color: var(--heading);
        font-size: 11pt;
      }}

      .guide-box p, .guide-box ul {{
        margin: 0;
        color: #1e3a8a;
        font-size: 9.2pt;
      }}

      .guide-box ul {{
        padding-left: 18px;
        margin-top: 6px;
      }}

      h2 {{
        color: var(--ink);
        font-size: 14pt;
        margin: 22px 0 10px;
        padding-bottom: 6px;
        border-bottom: 2px solid var(--line);
      }}

      .prompt-card {{
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
      }}

      .prompt-header {{
        background: #f1f5f9;
        border-bottom: 1px solid var(--line);
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 8.5pt;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-weight: 700;
      }}

      .prompt-header .copy-note {{
        text-transform: none;
        letter-spacing: 0;
        font-style: italic;
        font-weight: 400;
      }}

      .prompt-body {{
        padding: 16px 18px 18px;
      }}

      pre {{
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 8.5pt;
        line-height: 1.46;
        color: var(--ink);
        background: transparent;
      }}

      .footer {{
        margin-top: 18px;
        padding-top: 10px;
        border-top: 1px solid var(--line);
        text-align: center;
        color: #64748b;
        font-size: 8.5pt;
      }}
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <h1>WISP-MS Claude Master Prompt</h1>
        <p>Full-Stack Code Generation Prompt for Next.js 14 and Supabase Digitization System</p>
        <div class="tag-row">
          <span class="tag">Next.js 14</span>
          <span class="tag">App Router</span>
          <span class="tag">Supabase</span>
          <span class="tag">Tailwind</span>
          <span class="tag">shadcn/ui</span>
          <span class="tag">TypeScript</span>
        </div>
      </div>

      <div class="guide-box">
        <h3>📌 Prompt Usage</h3>
        <p>This document contains the complete production-ready prompt for generating the WiFi Service Provider Management System using Next.js 14 and Supabase.</p>
        <ul>
          <li>Use the prompt block below as-is in Claude, Cursor, or a compatible AI coding agent.</li>
          <li>The prompt covers database design, RLS policies, app architecture, UX requirements, and migration tooling.</li>
        </ul>
      </div>

      <h2>Claude AI Master Prompt</h2>

      <div class="prompt-card">
        <div class="prompt-header">
          <div>Copyable Prompt Code</div>
          <div class="copy-note">Target: Claude 3.5 Sonnet / Claude 3 Opus / Cursor</div>
        </div>
        <div class="prompt-body">
          <pre>{prompt_text}</pre>
        </div>
      </div>

      <div class="footer">
        WiFi ISP Digitization &amp; Customer Management System — System Prompt Document v1.0
      </div>
    </div>
  </body>
</html>
"""

html_path.write_text(html_content, encoding="utf-8")
HTML(string=html_content).write_pdf(str(pdf_path))

print(f"Generated Markdown: {prompt_md_path}")
print(f"Generated HTML: {html_path}")
print(f"Generated PDF: {pdf_path}")
