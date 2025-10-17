import { useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";
import { Canvas, Textbox } from "fabric";
import "./styles/pdfsign.css";

export default function PDFSignPage() {
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const [fabricCanvases, setFabricCanvases] = useState([]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    containerRef.current.innerHTML = ""; // Reset container
    const newFabricCanvases = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });

      // Create page wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "page-wrapper";

      // Create and render PDF canvas (bottom layer)
      const pdfCanvas = document.createElement("canvas");
      pdfCanvas.className = "pdf-canvas";
      pdfCanvas.width = viewport.width;
      pdfCanvas.height = viewport.height;
      wrapper.appendChild(pdfCanvas);

      const ctx = pdfCanvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Create Fabric overlay canvas (top layer)
      const fabricCanvas = document.createElement("canvas");
      fabricCanvas.className = "fabric-canvas";
      fabricCanvas.width = viewport.width;
      fabricCanvas.height = viewport.height;
      wrapper.appendChild(fabricCanvas);

      containerRef.current.appendChild(wrapper);

      // Initialize Fabric.js on the overlay canvas
      const fCanvas = new Canvas(fabricCanvas, {
        selection: true,
        preserveObjectStacking: true,
      });

      newFabricCanvases.push(fCanvas);
    }

    // Enable cross-page dragging
    newFabricCanvases.forEach((fc, index) => {
      fc.on("object:moving", (e) => {
        const obj = e.target;
        const bottomLimit = fc.height;
        const topLimit = 0;

        // Moving down to next page
        if (obj.top > bottomLimit && newFabricCanvases[index + 1]) {
          fc.remove(obj);
          obj.top = 10;
          newFabricCanvases[index + 1].add(obj);
          newFabricCanvases[index + 1].setActiveObject(obj);
        }

        // Moving up to previous page
        if (obj.top < topLimit && newFabricCanvases[index - 1]) {
          fc.remove(obj);
          obj.top = newFabricCanvases[index - 1].height - 50;
          newFabricCanvases[index - 1].add(obj);
          newFabricCanvases[index - 1].setActiveObject(obj);
        }
      });
    });

    // Delete on 'Delete' or 'Backspace' key
    const keyHandler = (evt) => {
      if (evt.key === "Delete" || evt.key === "Backspace") {
        newFabricCanvases.forEach((fc) => {
          const activeObj = fc.getActiveObject();
          if (activeObj) fc.remove(activeObj);
        });
      }
    };
    document.addEventListener("keydown", keyHandler);

    setFabricCanvases(newFabricCanvases);
  };

  const addText = () => {
    if (!fabricCanvases.length) return;
    const activeCanvas = fabricCanvases[0];
    const text = new Textbox("Enter text", {
      left: activeCanvas.width / 2 - 50,
      top: activeCanvas.height / 2,
      fontSize: 20,
      fill: "#000",
      selectable: true,
      fontFamily: "Arial",
    });
    activeCanvas.add(text);
    activeCanvas.setActiveObject(text);
    activeCanvas.requestRenderAll();
  };

  const addDate = () => {
    if (!fabricCanvases.length) return;
    const activeCanvas = fabricCanvases[0];
    const today = new Date().toLocaleDateString();
    const date = new Textbox(today, {
      left: activeCanvas.width / 2 - 50,
      top: activeCanvas.height / 2 + 40,
      fontSize: 18,
      fill: "#000",
      selectable: true,
      fontFamily: "Arial",
    });
    activeCanvas.add(date);
    activeCanvas.setActiveObject(date);
    activeCanvas.requestRenderAll();
  };

  const addSign = () => {
    if (!fabricCanvases.length) return;
    const activeCanvas = fabricCanvases[0];
    const sign = new Textbox("✍️ Sign Here", {
      left: activeCanvas.width / 2 - 60,
      top: activeCanvas.height / 2 + 80,
      fontSize: 22,
      fill: "#000",
      selectable: true,
      fontStyle: "italic",
      fontFamily: "Arial",
    });
    activeCanvas.add(sign);
    activeCanvas.setActiveObject(sign);
    activeCanvas.requestRenderAll();
  };

  return (
    <div className="pdf-sign-page">
      {/* Sticky Toolbar */}
      <div className="sticky-toolbar">
        <button
          className="toolbar-btn toolbar-btn-primary"
          onClick={() => fileInputRef.current.click()}
        >
          📁 Upload PDF
        </button>
        <button
          className="toolbar-btn"
          onClick={addText}
        >
          🅣 Add Text
        </button>
        <button
          className="toolbar-btn"
          onClick={addDate}
        >
          📅 Add Date
        </button>
        <button
          className="toolbar-btn"
          onClick={addSign}
        >
          ✍️ Add Sign
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleUpload}
        style={{ display: "none" }}
      />

      {/* PDF Container */}
      <div
        ref={containerRef}
        className="pdf-container"
      ></div>
    </div>
  );
}
