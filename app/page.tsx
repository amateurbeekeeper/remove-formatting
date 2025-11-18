"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [detectedFormatting, setDetectedFormatting] = useState<string[]>([]);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const removeFormatting = (text: string): { plainText: string; formatting: string[] } => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    
    const detected: Set<string> = new Set();
    
    // Detect formatting elements
    const checkElement = (element: Element) => {
      // Text styling
      if (element.tagName === "B" || element.tagName === "STRONG" || element.getAttribute("style")?.includes("font-weight")) {
        detected.add("Bold");
      }
      if (element.tagName === "I" || element.tagName === "EM" || element.getAttribute("style")?.includes("font-style: italic")) {
        detected.add("Italic");
      }
      if (element.tagName === "U" || element.getAttribute("style")?.includes("text-decoration: underline")) {
        detected.add("Underline");
      }
      if (element.tagName === "S" || element.tagName === "STRIKE" || element.getAttribute("style")?.includes("text-decoration: line-through")) {
        detected.add("Strikethrough");
      }
      
      // Colors
      const style = element.getAttribute("style") || "";
      if (style.match(/color:\s*[^;]+/i)) {
        detected.add("Text color");
      }
      if (style.match(/background-color:\s*[^;]+/i) || style.match(/background:\s*[^;]+/i)) {
        detected.add("Background color/Highlight");
      }
      
      // Fonts
      if (style.match(/font-size:\s*[^;]+/i)) {
        detected.add("Font size");
      }
      if (style.match(/font-family:\s*[^;]+/i)) {
        detected.add("Font family");
      }
      
      // Lists
      if (element.tagName === "UL" || element.querySelector("ul")) {
        detected.add("Bullet points");
      }
      if (element.tagName === "OL" || element.querySelector("ol")) {
        detected.add("Numbered list");
      }
      
      // Links
      if (element.tagName === "A" || element.querySelector("a")) {
        detected.add("Links");
      }
      
      // Headers
      if (element.tagName.match(/^H[1-6]$/)) {
        detected.add("Headers");
      }
      
      // Check inline styles for common formatting
      if (style) {
        if (style.includes("text-align")) detected.add("Text alignment");
        if (style.includes("line-height")) detected.add("Line height");
        if (style.includes("letter-spacing")) detected.add("Letter spacing");
        if (style.includes("text-transform")) detected.add("Text transform");
      }
      
      // Recursively check children
      Array.from(element.children).forEach(child => checkElement(child));
    };
    
    // Check all elements in the document
    Array.from(tempDiv.children).forEach(child => checkElement(child));
    // Also check the root element itself
    checkElement(tempDiv);
    
    // Extract ALL text content - this removes ALL formatting
    let plainText = tempDiv.textContent || tempDiv.innerText || "";
    
    // Normalize whitespace - replace multiple spaces/newlines with single space
    plainText = plainText
      .replace(/\s+/g, " ") // All whitespace (spaces, tabs, newlines) to single space
      .trim();
    
    // If we detected formatting, add it; otherwise check if it's just plain text
    const formattingArray = Array.from(detected).sort();
    if (formattingArray.length === 0 && text.trim() && text !== plainText) {
      // If text changed but we didn't detect specific formatting, it might be HTML structure
      if (text.includes("<") || text.includes("&nbsp;") || text.includes("\n\n")) {
        formattingArray.push("HTML/Structure formatting");
      }
    }
    
    return { plainText, formatting: formattingArray };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    
    // Automatically remove formatting as user types/pastes
    if (newText) {
      const { plainText, formatting } = removeFormatting(newText);
      setOutputText(plainText);
      setDetectedFormatting(formatting);
    } else {
      setOutputText("");
      setDetectedFormatting([]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text/html") || e.clipboardData.getData("text/plain");
    setInputText(pastedText);
    
    if (pastedText) {
      const { plainText, formatting } = removeFormatting(pastedText);
      setOutputText(plainText);
      setDetectedFormatting(formatting);
      // Focus and select output textarea after paste
      setTimeout(() => {
        if (outputRef.current) {
          outputRef.current.focus();
          outputRef.current.select();
        }
      }, 10);
    } else {
      setOutputText("");
      setDetectedFormatting([]);
    }
  };

  const handleOutputClick = () => {
    if (outputRef.current && outputText) {
      outputRef.current.select();
    }
  };

  const handleOutputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Cmd/Ctrl+C to copy
    if ((e.metaKey || e.ctrlKey) && e.key === "c" && outputText) {
      handleCopy();
    }
    // Handle Cmd/Ctrl+A to select all
    if ((e.metaKey || e.ctrlKey) && e.key === "a") {
      e.preventDefault();
      if (outputRef.current) {
        outputRef.current.select();
      }
    }
  };

  const getStats = (text: string) => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { chars, words };
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
    setDetectedFormatting([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4 md:p-6 lg:p-8" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col min-h-0">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 lg:p-8 flex-1 flex flex-col min-h-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Remove Formatting
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 md:mb-6">
            Paste your formatted text below and get clean, plain text that you can copy back to your email.
          </p>

          <div className="space-y-3 sm:space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-1 sm:mb-2 flex-shrink-0">
                <label htmlFor="input" className="block text-xs sm:text-sm font-medium text-gray-700">
                  Paste your formatted text here:
                </label>
                {inputText && (
                  <span className="text-xs text-gray-500">
                    {getStats(inputText).chars} chars • {getStats(inputText).words} words
                  </span>
                )}
              </div>
              <textarea
                id="input"
                value={inputText}
                onChange={handleInputChange}
                onPaste={handlePaste}
                placeholder="Paste your formatted text here..."
                className="w-full flex-1 min-h-[150px] sm:min-h-[180px] md:min-h-[200px] p-2 sm:p-3 md:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-xs sm:text-sm"
                style={{ height: '100%' }}
              />
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-1 sm:mb-2 flex-shrink-0 flex-wrap gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <label htmlFor="output" className="block text-xs sm:text-sm font-medium text-gray-700">
                    Plain text output:
                  </label>
                  {outputText && (
                    <span className="text-xs text-gray-500">
                      {getStats(outputText).chars} chars • {getStats(outputText).words} words
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!outputText}
                    className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm font-medium"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                id="output"
                ref={outputRef}
                value={outputText}
                readOnly
                onClick={handleOutputClick}
                onKeyDown={handleOutputKeyDown}
                placeholder="Plain text will appear here..."
                className="w-full flex-1 min-h-[150px] sm:min-h-[180px] md:min-h-[200px] p-2 sm:p-3 md:p-4 border border-gray-300 rounded-lg bg-gray-50 resize-y font-mono text-xs sm:text-sm cursor-text"
                style={{ height: '100%' }}
              />
            </div>
          </div>

          {detectedFormatting.length > 0 && (
            <div className="mt-3 sm:mt-4 md:mt-6 p-3 sm:p-4 bg-green-50 rounded-lg border-2 border-green-300 shadow-sm">
              <p className="text-sm sm:text-base font-semibold text-green-800 mb-2 sm:mb-3">
                ✓ Formatting Removed:
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {detectedFormatting.map((format, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-xs sm:text-sm font-medium border border-green-200"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex-shrink-0 mt-3 sm:mt-4 md:mt-6">
            <div className="p-2 sm:p-3 md:p-4 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800 mb-1 sm:mb-2">
                <strong>Tip:</strong> Just paste directly into the input box - it will automatically remove ALL formatting including text sizes, colors, highlights, fonts, bullet points, and everything else. Only the plain text remains.
              </p>
              <p className="text-xs text-blue-700">
                <strong>Keyboard shortcuts:</strong> Click the output box to select all text, or use Cmd/Ctrl+C to copy, Cmd/Ctrl+A to select all.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
