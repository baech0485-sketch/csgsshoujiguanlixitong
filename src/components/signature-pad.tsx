"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type SignaturePadHandle = {
  readSignature: () => string;
};

type SignaturePadProps = {
  value: string;
  onChange: (value: string) => void;
};

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(function SignaturePad({
  value,
  onChange,
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const hasStrokeRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.lineWidth = 2.2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#163238";
    context.fillStyle = "#fffdfc";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (!value) {
      hasStrokeRef.current = false;
      return;
    }

    hasStrokeRef.current = true;
    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = value;
  }, [value]);

  useImperativeHandle(ref, () => ({
    readSignature() {
      const canvas = canvasRef.current;
      if (!canvas || !hasStrokeRef.current) {
        return "";
      }
      return canvas.toDataURL("image/png");
    },
  }), []);

  function getPoint(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function startDraw(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    drawingRef.current = true;
    hasStrokeRef.current = true;
    const point = getPoint(clientX, clientY);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineTo(point.x + 0.1, point.y + 0.1);
    context.stroke();
    onChange(canvas.toDataURL("image/png"));
  }

  function moveDraw(clientX: number, clientY: number) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const point = getPoint(clientX, clientY);
    context.lineTo(point.x, point.y);
    context.stroke();
    onChange(canvas.toDataURL("image/png"));
  }

  function endDraw() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#fffdfc";
    context.fillRect(0, 0, canvas.width, canvas.height);
    hasStrokeRef.current = false;
    onChange("");
  }

  return (
    <div className="signature-pad">
      <canvas
        ref={canvasRef}
        className="signature-pad__canvas"
        width={320}
        height={160}
        onMouseDown={(event) => startDraw(event.clientX, event.clientY)}
        onMouseMove={(event) => moveDraw(event.clientX, event.clientY)}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (!touch) return;
          startDraw(touch.clientX, touch.clientY);
        }}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (!touch) return;
          moveDraw(touch.clientX, touch.clientY);
        }}
        onTouchEnd={endDraw}
      />
      <button className="button button--ghost" type="button" onClick={clear}>清空签字</button>
    </div>
  );
});
