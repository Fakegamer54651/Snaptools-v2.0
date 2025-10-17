import { useRef, useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";
import * as fabric from "fabric";
import { Canvas, Textbox, FabricImage } from "fabric";
import { PDFDocument } from "pdf-lib";
import "./styles/pdfsign.css";

export default function PDFSignPage() {
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const [fabricCanvases, setFabricCanvases] = useState([]);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placementWarning, setPlacementWarning] = useState(false);

  // Dropdown & modals
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);
  const [showDrawModal, setShowDrawModal] = useState(false);

  // Signature storage
  const [savedSigns, setSavedSigns] = useState([]);
  const [tempSignName, setTempSignName] = useState("");
  const [activeFont, setActiveFont] = useState("cursive");

  // Draw sign refs
  const drawCanvasRef = useRef(null);
  const drawCtxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  // Load saved signatures
  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("snaptoolsSavedSigns") || "[]");
    setSavedSigns(local);
  }, []);

  const saveSignsToLocal = (list) => {
    localStorage.setItem("snaptoolsSavedSigns", JSON.stringify(list));
    setSavedSigns(list);
  };

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

    // =============================
    // FIX 1️⃣: Disable default backspace delete
    // =============================
    window.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        const activeCanvas = newFabricCanvases.find((fc) => fc.getActiveObject());
        if (!activeCanvas) return;
        const obj = activeCanvas.getActiveObject();

        // If we're editing text, allow normal typing
        if (obj && obj.isEditing) return;

        // Prevent deleting the entire object by mistake
        e.preventDefault();
        return false;
      }
    });

    // =============================
    // FIX 2️⃣: Add small floating delete button for selected objects
    // =============================
    newFabricCanvases.forEach((fc) => {
      let deleteBtn = document.createElement("button");
      deleteBtn.innerText = "×";
      deleteBtn.style.position = "absolute";
      deleteBtn.style.display = "none";
      deleteBtn.style.background = "#d00";
      deleteBtn.style.color = "#fff";
      deleteBtn.style.border = "none";
      deleteBtn.style.borderRadius = "50%";
      deleteBtn.style.width = "22px";
      deleteBtn.style.height = "22px";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.style.fontSize = "16px";
      deleteBtn.style.lineHeight = "18px";
      deleteBtn.style.textAlign = "center";
      deleteBtn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)";
      deleteBtn.style.zIndex = "100";
      fc.wrapperEl.appendChild(deleteBtn);

      // Position and show delete button when object is selected
      fc.on("selection:created", (e) => {
        const obj = e.selected[0];
        if (!obj) return;
        const bound = obj.getBoundingRect();
        deleteBtn.style.left = `${bound.left + bound.width - 10}px`;
        deleteBtn.style.top = `${bound.top - 10}px`;
        deleteBtn.style.display = "flex";
      });

      fc.on("selection:updated", (e) => {
        const obj = e.selected[0];
        if (!obj) return;
        const bound = obj.getBoundingRect();
        deleteBtn.style.left = `${bound.left + bound.width - 10}px`;
        deleteBtn.style.top = `${bound.top - 10}px`;
        deleteBtn.style.display = "flex";
      });

      fc.on("object:modified", (e) => {
        const obj = e.target;
        if (!obj) return;
        const bound = obj.getBoundingRect();
        deleteBtn.style.left = `${bound.left + bound.width - 10}px`;
        deleteBtn.style.top = `${bound.top - 10}px`;
      });

      fc.on("selection:cleared", () => {
        deleteBtn.style.display = "none";
      });

      deleteBtn.onclick = () => {
        const obj = fc.getActiveObject();
        if (obj) {
          fc.remove(obj);
          fc.discardActiveObject();
          fc.requestRenderAll();
          deleteBtn.style.display = "none";
        }
      };
    });

    setFabricCanvases(newFabricCanvases);
  };

  // Utility function for interactive placement (click-to-place) - Multi-page aware
  const startPlacementMode = (object) => {
    // ⛔ Prevent multiple placements at once
    if (isPlacing) {
      console.log("⚠️ Wait — place the current item before adding another");
      setPlacementWarning(true);
      setTimeout(() => setPlacementWarning(false), 2000);
      return;
    }

    setIsPlacing(true);
    object.selectable = false; // temporarily disable selection while following
    let activeCanvas = null;

    // 🔍 Detect which canvas user hovers on
    const detectCanvas = (e) => {
      const targetCanvas = fabricCanvases.find((fc) => {
        const rect = fc.upperCanvasEl.getBoundingClientRect();
        return (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );
      });
      return targetCanvas;
    };

    const handleMouseMove = (e) => {
      const fc = detectCanvas(e);
      if (!fc) return;

      if (!activeCanvas) {
        activeCanvas = fc;
        fc.add(object);
      }

      const rect = fc.upperCanvasEl.getBoundingClientRect();
      const pointer = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      object.set({
        left: pointer.x - object.width / 2,
        top: pointer.y - object.height / 2,
      });
      object.setCoords();
      fc.requestRenderAll();
    };

    const handleClick = (e) => {
      const fc = detectCanvas(e);
      if (fc && activeCanvas === fc) {
        object.selectable = true;
        fc.setActiveObject(object);
        fc.requestRenderAll();
        setIsPlacing(false); // ✅ placement finished, unlock
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mousedown", handleClick);
      }
    };

    // Listen globally while placing
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleClick);
  };

  // Add Text (click-to-place)
  const addText = () => {
    if (!fabricCanvases.length) return;
    const text = new Textbox("Enter text", {
      fontSize: 20,
      fill: "#000",
      selectable: true,
      editable: true,
      fontFamily: "Arial",
    });
    startPlacementMode(text);
  };

  // Add Date (click-to-place)
  const addDate = () => {
    if (!fabricCanvases.length) return;
    const today = new Date().toLocaleDateString();
    const date = new Textbox(today, {
        fontSize: 18,
      fill: "#000",
      selectable: true,
      editable: false,
        fontFamily: "Arial",
    });
    startPlacementMode(date);
  };

  // ===========================
  // CREATE FONT SIGN
  // ===========================
  const handleSaveFontSign = () => {
    if (!tempSignName.trim()) return;
    const newSign = {
      id: Date.now(),
      type: "font",
      name: tempSignName,
      fontFamily: activeFont,
    };
    const updated = [newSign, ...savedSigns].slice(0, 3);
    saveSignsToLocal(updated);
    setTempSignName("");
    setShowFontModal(false);
  };

  const handleAddFontSign = (sign) => {
    if (!fabricCanvases.length) return;
    const text = new fabric.Text(sign.name, {
      fontFamily: sign.fontFamily,
      fontSize: 36,
      fill: "#000",
      fontStyle: "italic",
      textAlign: "left",
      originX: "left",
      originY: "top",
      splitByGrapheme: false,
        selectable: true,
      });
    // Prevent line wrapping
    text.set({ width: text.width + 10 });
    
    // Scale down if too wide for page
    if (text.width > 700) {
      const scaleFactor = 700 / text.width;
      text.scale(scaleFactor);
    }
    
    startPlacementMode(text);
  };

  // ===========================
  // DRAW SIGN
  // ===========================
  const initDrawCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    drawCtxRef.current = ctx;
  };

  const startDraw = (e) => {
    setDrawing(true);
    const rect = drawCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = drawCtxRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing) return;
    const rect = drawCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = drawCtxRef.current;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const clearDrawCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    drawCtxRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawSign = () => {
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Get image data to find bounds of actual drawing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;
    
    // Find bounding box of drawn pixels
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const alpha = pixels[index + 3];
        
        if (alpha > 0) { // If pixel is not transparent
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    // Add small padding
    const padding = 10;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width, maxX + padding);
    maxY = Math.min(canvas.height, maxY + padding);
    
    // Create cropped canvas
    const croppedWidth = maxX - minX;
    const croppedHeight = maxY - minY;
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = croppedWidth;
    croppedCanvas.height = croppedHeight;
    const croppedCtx = croppedCanvas.getContext("2d");
    
    // Draw cropped region
    croppedCtx.drawImage(
      canvas,
      minX, minY, croppedWidth, croppedHeight,
      0, 0, croppedWidth, croppedHeight
    );
    
    const dataURL = croppedCanvas.toDataURL("image/png");
    const newSign = { id: Date.now(), type: "drawn", imageData: dataURL };
    const updated = [newSign, ...savedSigns].slice(0, 3);
    saveSignsToLocal(updated);
    setShowDrawModal(false);
  };

  const handleAddDrawnSign = (sign) => {
    if (!fabricCanvases.length) return;
    FabricImage.fromURL(sign.imageData).then((img) => {
      img.scale(0.6); // 40% smaller for better proportions
      startPlacementMode(img);
    });
  };

  const handleSave = async () => {
    if (!fabricCanvases.length) {
      alert("Please upload a PDF first.");
      return;
    }

    const fileInput = fileInputRef.current.files[0];
    if (!fileInput) {
      alert("Please upload a PDF first.");
      return;
    }

    const existingPdfBytes = await fileInput.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const fCanvas = fabricCanvases[i];

      if (!fCanvas) continue;

      // Export this Fabric canvas as an image
      const dataUrl = fCanvas.toDataURL({
        format: "png",
        multiplier: 2,
      });

      const pngImage = await pdfDoc.embedPng(dataUrl);

      const { width, height } = page.getSize();

      // Draw the image (annotations) on top of PDF page
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Signed_SnapTools.pdf";
    a.click();
    URL.revokeObjectURL(url);
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

        {/* SIGN DROPDOWN */}
        <div className="sign-dropdown-wrapper">
          <button
            className="toolbar-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            ✍️ Sign ↓
          </button>

          {dropdownOpen && (
            <div className="sign-dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  setShowFontModal(true);
                  setDropdownOpen(false);
                }}
              >
                ✍️ Create new sign
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  setShowDrawModal(true);
                  setDropdownOpen(false);
                  setTimeout(initDrawCanvas, 50);
                }}
              >
                🖊️ Draw your sign
              </button>
              <div className="dropdown-divider" />
              {savedSigns.length === 0 && (
                <div className="dropdown-empty">
                  No saved signs yet
                </div>
              )}
              {savedSigns.map((sign) => (
                <button
                  key={sign.id}
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (sign.type === "font") handleAddFontSign(sign);
                    else handleAddDrawnSign(sign);
                  }}
                >
                  {sign.type === "font" ? (
                    <span style={{ fontFamily: sign.fontFamily, fontStyle: "italic" }}>
                      {sign.name}
                    </span>
                  ) : (
                    <img
                      src={sign.imageData}
                      alt="Sign"
                      className="dropdown-sign-thumb"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="toolbar-btn toolbar-btn-success"
          onClick={handleSave}
        >
          💾 Save Signed PDF
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

      {/* FONT SIGN MODAL */}
      {showFontModal && (
        <div className="signature-modal-overlay">
          <div className="signature-modal">
            <h2 className="signature-modal-title">Create Signature</h2>
            <input
              type="text"
              placeholder="Enter your name"
              className="signature-modal-input"
              value={tempSignName}
              onChange={(e) => setTempSignName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSaveFontSign()}
            />
            <div className="signature-font-preview">
              {["cursive", "serif", "monospace", "fantasy"].map((f) => (
                <div
                  key={f}
                  className={`font-option ${activeFont === f ? "font-option-active" : ""}`}
                  style={{ fontFamily: f }}
                  onClick={() => setActiveFont(f)}
                >
                  {tempSignName || "Preview"}
                </div>
              ))}
            </div>
            <div className="signature-modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowFontModal(false);
                  setTempSignName("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveFontSign}
                disabled={!tempSignName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAW SIGN MODAL */}
      {showDrawModal && (
        <div className="signature-modal-overlay">
          <div className="signature-modal draw-modal">
            <h2 className="signature-modal-title">Draw Your Signature</h2>
            <canvas
              ref={drawCanvasRef}
              width={600}
              height={250}
              className="draw-canvas"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
            ></canvas>
            <div className="draw-modal-actions">
              <div>
                <button
                  className="btn-cancel"
                  onClick={clearDrawCanvas}
                >
                  Clear
                </button>
              </div>
              <div className="signature-modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowDrawModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-save"
                  onClick={saveDrawSign}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placement Warning Toast */}
      {placementWarning && (
        <div className="placement-warning-toast">
          ⚠️ Please finish placing the current item first
        </div>
      )}
    </div>
  );
}
