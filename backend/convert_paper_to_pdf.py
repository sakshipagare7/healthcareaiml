import os
import re
import subprocess
import markdown

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD_FILE = os.path.join(PROJECT_DIR, "RESEARCH_PAPER.md")
HTML_FILE = os.path.join(PROJECT_DIR, "RESEARCH_PAPER.html")
PDF_FILE = os.path.join(PROJECT_DIR, "RESEARCH_PAPER.pdf")

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(EDGE_PATH):
    EDGE_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def format_clean_math_html(text: str) -> str:
    """
    Convert raw LaTeX equations ($$...$$ and $...$) into cleanly formatted,
    human-readable academic equation boxes with proper fractions and clear typography.
    Avoids coded/symbolic TeX artifacts in the final PDF.
    """
    # Replace block equations
    def block_replacer(match):
        content = match.group(1).strip()
        
        # Format fraction expressions like \frac{A}{B}
        frac_pattern = r'\\frac\{([^{}]+)\}\{([^{}]+)\}'
        while re.search(frac_pattern, content):
            content = re.sub(
                frac_pattern,
                r'<span class="frac"><span class="num">\1</span><span class="den">\2</span></span>',
                content
            )

        # Clean common TeX symbols into readable academic text
        cleanups = [
            (r'\\text\{([^}]+)\}', r'<span class="txt">\1</span>'),
            (r'\\sum_\{([^}]+)\}\^\{([^}]+)\}', r'<span class="sum">&Sigma;<sub>\1</sub><sup>\2</sup></span>'),
            (r'\\sum', r'&Sigma;'),
            (r'\\int_\{0\}\^\{1\}', r'&int;<sub>0</sub><sup>1</sup>'),
            (r'\\ge', r'&ge;'),
            (r'\\le', r'&le;'),
            (r'\\times', r'&times;'),
            (r'\\quad', r'&nbsp;&nbsp;&nbsp;&nbsp;'),
            (r'\\implies', r'&rArr;'),
            (r'\\Delta', r'&Delta;'),
            (r'\\mid', r'|'),
            (r'\\mathcal\{D\}', r'Dataset'),
            (r'\\mathbf\{x\}', r'x'),
            (r'\\left\(', r'('),
            (r'\\right\)', r')'),
            (r'\^2', r'<sup>2</sup>'),
            (r'_b', r'<sub>b</sub>'),
            (r'_j', r'<sub>j</sub>'),
            (r'_k', r'<sub>k</sub>'),
            (r'_t', r'<sub>t</sub>'),
            (r'_i', r'<sub>i</sub>'),
            (r'\\\\', r'<br/>'),
        ]
        for pattern, replacement in cleanups:
            content = re.sub(pattern, replacement, content)

        return f'<div class="eq-box"><div class="eq-content">{content}</div></div>'

    # Apply to $$...$$ blocks
    text = re.sub(r'\$\$([\s\S]*?)\$\$', block_replacer, text)

    # Inline math cleanups like $\ge 140$ or $80/20$
    def inline_replacer(match):
        content = match.group(1).strip()
        content = (
            content.replace(r'\ge', '&ge;')
            .replace(r'\le', '&le;')
            .replace(r'\Delta', '&Delta;')
            .replace(r'\times', '&times;')
            .replace(r'\text{', '')
            .replace('}', '')
        )
        return f'<span class="inline-math">{content}</span>'

    text = re.sub(r'\$([^$\n]+)\$', inline_replacer, text)
    return text

def build_pdf():
    print(f"Reading {MD_FILE}...")
    with open(MD_FILE, "r", encoding="utf-8") as f:
        md_text = f.read()

    # Pre-process math into clean, readable HTML structures
    processed_md = format_clean_math_html(md_text)

    # Convert markdown to HTML
    html_body = markdown.markdown(
        processed_md,
        extensions=["tables", "fenced_code", "attr_list", "nl2br"]
    )

    # Full HTML document with strict IEEE styling and clean formula rendering
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AI-Powered Preventive Healthcare and Emergency Response System - Research Paper</title>
<style>
  @page {{
    size: A4;
    margin: 18mm 16mm 20mm 16mm;
    @bottom-right {{
      content: counter(page);
      font-size: 9pt;
      font-family: 'Times New Roman', Times, serif;
    }}
  }}

  body {{
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: 10pt;
    line-height: 1.35;
    color: #111;
    background: #fff;
    margin: 0;
    padding: 0;
    text-align: justify;
    text-justify: inter-word;
  }}

  h1:first-of-type {{
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    line-height: 1.25;
    margin-top: 0;
    margin-bottom: 14pt;
    color: #0B2545;
  }}

  p {{
    margin-top: 0;
    margin-bottom: 6pt;
  }}

  strong {{
    font-weight: bold;
  }}

  em {{
    font-style: italic;
  }}

  hr {{
    border: none;
    border-top: 0.8pt solid #333;
    margin: 12pt 0;
  }}

  h2 {{
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
    margin-top: 14pt;
    margin-bottom: 4pt;
    border-bottom: 0.5pt solid #0B2545;
    padding-bottom: 2pt;
    color: #0B2545;
    page-break-after: avoid;
  }}

  h3 {{
    font-size: 10pt;
    font-weight: bold;
    font-style: italic;
    margin-top: 9pt;
    margin-bottom: 3pt;
    color: #1a1a1a;
    page-break-after: avoid;
  }}

  h4 {{
    font-size: 9.5pt;
    font-weight: bold;
    margin-top: 7pt;
    margin-bottom: 2pt;
    page-break-after: avoid;
  }}

  ul, ol {{
    margin-top: 2pt;
    margin-bottom: 6pt;
    padding-left: 18pt;
  }}

  li {{
    margin-bottom: 2pt;
  }}

  /* Academic Formula Styling (Clean, Legible, No Raw Symbols) */
  .eq-box {{
    background-color: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 3.5px solid #0B2545;
    border-radius: 4px;
    padding: 7pt 12pt;
    margin: 8pt 0;
    page-break-inside: avoid;
    text-align: center;
  }}

  .eq-content {{
    font-family: 'Cambria Math', 'Times New Roman', serif;
    font-size: 10.5pt;
    color: #000;
    line-height: 1.6;
    display: inline-block;
  }}

  .inline-math {{
    font-family: 'Cambria Math', 'Times New Roman', serif;
    font-style: italic;
    color: #000;
  }}

  .frac {{
    display: inline-flex;
    flex-direction: column;
    vertical-align: middle;
    text-align: center;
    margin: 0 4px;
    line-height: 1.1;
  }}

  .num {{
    border-bottom: 1.2px solid #222;
    padding: 0 4px 2px 4px;
    font-size: 9.5pt;
  }}

  .den {{
    padding: 2px 4px 0 4px;
    font-size: 9.5pt;
  }}

  .txt {{
    font-family: 'Times New Roman', Times, serif;
    font-style: normal;
    font-weight: normal;
  }}

  .sum {{
    font-size: 13pt;
    vertical-align: -1px;
    margin-right: 2px;
  }}

  /* Tables */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 10pt 0 12pt 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
  }}

  th, td {{
    border: 0.5pt solid #555;
    padding: 4.5pt 6pt;
    text-align: left;
  }}

  th {{
    background-color: #f0f4f8;
    color: #0B2545;
    font-weight: bold;
    text-align: center;
  }}

  pre {{
    background-color: #f8fafc;
    border: 0.5pt solid #cbd5e1;
    border-radius: 4pt;
    padding: 6pt 8pt;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 8pt;
    line-height: 1.25;
    overflow-x: auto;
    margin: 6pt 0;
    page-break-inside: avoid;
  }}

  code {{
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 8.5pt;
    background-color: #f1f5f9;
    padding: 1pt 3pt;
    border-radius: 2pt;
  }}
</style>
</head>
<body>
{html_body}
</body>
</html>
"""

    with open(HTML_FILE, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Saved styled HTML to {HTML_FILE}")

    print(f"Invoking browser print-to-pdf via {EDGE_PATH}...")
    cmd = [
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        "--allow-file-access-from-files",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={PDF_FILE}",
        HTML_FILE
    ]
    subprocess.run(cmd, check=True)

    if os.path.exists(PDF_FILE) and os.path.getsize(PDF_FILE) > 0:
        print(f"[SUCCESS] High-quality PDF generated: {PDF_FILE} ({os.path.getsize(PDF_FILE)} bytes)")
        import shutil
        desktop_dir = r"C:\Users\HP\Desktop"
        # Always write updated version
        dest_updated = os.path.join(desktop_dir, "aiml paper (updated).pdf")
        shutil.copyfile(PDF_FILE, dest_updated)
        print(f"[SUCCESS] Copied to Desktop: {dest_updated}")

        # Also attempt to update aiml paper.pdf if not locked
        dest_main = os.path.join(desktop_dir, "aiml paper.pdf")
        try:
            shutil.copyfile(PDF_FILE, dest_main)
            print(f"[SUCCESS] Copied to Desktop: {dest_main}")
        except Exception as e:
            print(f"[NOTE] 'aiml paper.pdf' is currently locked by a viewer. 'aiml paper (updated).pdf' was created successfully.")
    else:
        print("[ERROR] PDF generation failed or produced empty file.")

if __name__ == "__main__":
    build_pdf()
