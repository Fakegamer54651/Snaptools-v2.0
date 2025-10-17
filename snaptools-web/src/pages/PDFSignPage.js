import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";
import { Canvas, IText, FabricImage } from "fabric";
import "./styles/pdfsign.css";

export default function PDFSignPage() {
  const [fileName, setFileName] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [canvases, setCanvases] = useState([]);
  const [activeTool, setActiveTool] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    const url = URL.createObjectURL(file);
    setFileName(file.name);
    setPdfUrl(url);
  }

  useEffect(() => {
    if (!pdfUrl) return;
    renderPdf();
  }, [pdfUrl]);

  async function renderPdf() {
    containerRef.current.innerHTML = "";
    const pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise;
    setNumPages(pdf.numPages);

    const tempCanvases = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.25 });
      
      // Step 1: Create a temporary canvas to render PDF
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;
      
      // Render PDF to temporary canvas
      await page.render({ canvasContext: tempCtx, viewport }).promise;
      
      // Step 2: Create the main canvas for Fabric.js
      const mainCanvas = document.createElement("canvas");
      mainCanvas.classList.add("pdf-canvas");
      mainCanvas.width = viewport.width;
      mainCanvas.height = viewport.height;
      
      // Container wrapper for this page
      const wrapper = document.createElement("div");
      wrapper.classList.add("page-wrapper");
      wrapper.appendChild(mainCanvas);
      containerRef.current.appendChild(wrapper);

      // Step 3: Initialize Fabric on the main canvas
      const fabricCanvas = new Canvas(mainCanvas, {
        selection: true,
        preserveObjectStacking: true,
        renderOnAddRemove: true,
      });

      // Step 4: Set the PDF as the background image using Fabric v6 API
      const pdfDataUrl = tempCanvas.toDataURL("image/png");
      const bgImage = await FabricImage.fromURL(pdfDataUrl);
      fabricCanvas.set('backgroundImage', bgImage);
      fabricCanvas.requestRenderAll();

      // Delete on 'Delete' or 'Backspace' key
      const keyHandler = (evt) => {
        if (evt.key === "Delete" || evt.key === "Backspace") {
          const activeObj = fabricCanvas.getActiveObject();
          if (activeObj) fabricCanvas.remove(activeObj);
        }
      };
      document.addEventListener("keydown", keyHandler);

      tempCanvases.push(fabricCanvas);
    }

    setCanvases(tempCanvases);
  }

  function handleTool(tool) {
    setActiveTool(tool);
    canvases.forEach((c) => {
      c.discardActiveObject();
      c.requestRenderAll();
    });

    if (!canvases.length) return;
    const activeCanvas = canvases[0]; // apply to first page for MVP
    let obj;

    const centerX = activeCanvas.getWidth() / 2;
    const centerY = activeCanvas.getHeight() / 2;

    if (tool === "sign") {
      obj = new IText("Sign Here", {
        left: centerX - 50,
        top: centerY - 10,
        fontSize: 18,
        fill: "#333",
        fontFamily: "Arial",
        selectable: true,
      });
    } else if (tool === "date") {
      const today = new Date().toLocaleDateString();
      obj = new IText(today, {
        left: centerX - 40,
        top: centerY - 10,
        fontSize: 16,
        fill: "#333",
        fontFamily: "Arial",
      });
    } else if (tool === "text") {
      obj = new IText("Enter text", {
        left: centerX - 40,
        top: centerY - 10,
        fontSize: 16,
        fill: "#333",
        fontFamily: "Arial",
      });
    }

    if (obj) {
      activeCanvas.add(obj);
      activeCanvas.setActiveObject(obj);
      activeCanvas.requestRenderAll();
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>PDF Sign Tool</h1>

      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="pdf-input"
          style={{
            display: "inline-block",
            padding: "8px 14px",
            border: "1px solid #ccc",
            borderRadius: 6,
            cursor: "pointer",
            marginRight: 12,
          }}
        >
          Choose PDF
        </label>
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <button
          onClick={() => handleTool("sign")}
          style={btnStyle(activeTool === "sign")}
        >
          ✍️ Sign
        </button>
        <button
          onClick={() => handleTool("date")}
          style={btnStyle(activeTool === "date")}
        >
          📅 Date
        </button>
        <button
          onClick={() => handleTool("text")}
          style={btnStyle(activeTool === "text")}
        >
          🅣 Text
        </button>
      </div>

      <div
        ref={containerRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          background: "#f7f7f7",
          padding: "24px 0",
        }}
      ></div>
    </div>
  );
}

function btnStyle(active) {
  return {
    padding: "8px 12px",
    marginRight: 8,
    borderRadius: 6,
    border: "1px solid #ccc",
    background: active ? "#eee" : "white",
    cursor: "pointer",
  };
}
