import os
from pypdf import PdfReader

pdf_path = os.path.join("research_lab", "uploads", "McIntyre_Quantum Mechanics_2012_QM.pdf.pdf")
output_path = os.path.join("research_lab", "uploads", "extracted_text.txt")

try:
    reader = PdfReader(pdf_path)
    text = ""
    # Read first 50 pages to get a good overview without overwhelming memory/context
    # Adjust range as needed
    for i in range(min(50, len(reader.pages))):
        page = reader.pages[i]
        text += page.extract_text() + "\n\n"
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Successfully extracted {len(text)} characters to {output_path}")

except Exception as e:
    print(f"Error extracting text: {e}")
