"use client";

import { useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState(false);

  const removeFormatting = (text: string): string => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    
    // Extract ALL text content - this removes ALL formatting:
    // - HTML tags (including lists, bullets, etc.)
    // - Text colors, highlights, font sizes
    // - Bold, italic, underline, etc.
    // - Everything except the actual text content
    let plainText = tempDiv.textContent || tempDiv.innerText || "";
    
    // Normalize whitespace - replace multiple spaces/newlines with single space
    // This removes line breaks, bullet points, and all formatting
    plainText = plainText
      .replace(/\s+/g, " ") // All whitespace (spaces, tabs, newlines) to single space
      .trim();
    
    return plainText;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    
    // Automatically remove formatting as user types/pastes
    if (newText) {
      const plainText = removeFormatting(newText);
      setOutputText(plainText);
    } else {
      setOutputText("");
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text/html") || e.clipboardData.getData("text/plain");
    setInputText(pastedText);
    
    if (pastedText) {
      const plainText = removeFormatting(pastedText);
      setOutputText(plainText);
    } else {
      setOutputText("");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Remove Formatting
          </h1>
          <p className="text-gray-600 mb-6">
            Paste your formatted text below and get clean, plain text that you can copy back to your email.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
                Paste your formatted text here:
              </label>
              <textarea
                id="input"
                value={inputText}
                onChange={handleInputChange}
                onPaste={handlePaste}
                placeholder="Paste your formatted text here..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="output" className="block text-sm font-medium text-gray-700">
                  Plain text output:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!outputText}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                id="output"
                value={outputText}
                readOnly
                placeholder="Plain text will appear here..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg bg-gray-50 resize-y font-mono text-sm"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Just paste directly into the input box - it will automatically remove ALL formatting including text sizes, colors, highlights, fonts, bullet points, and everything else. Only the plain text remains.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
