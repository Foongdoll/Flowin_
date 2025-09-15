import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";

type Point = { x: number; y: number };
type Stroke = Point[];

type Props = {
  enabled?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  mode?: "dots" | "lines";
  clearTrigger?: number; // increment to clear
  // New features
  tool?: "pen" | "eraser"; // select drawing tool
  undoTrigger?: number; // increment to undo last stroke
  eraserRadius?: number; // px radius to detect stroke deletion
  onStrokeCountChange?: (count: number) => void; // observe stroke count
};

export default function DrawingCanvas({ enabled = false, strokeColor = "#ef4444", strokeWidth = 4, mode = "dots", clearTrigger = 0, tool = "pen", undoTrigger = 0, eraserRadius = 16, onStrokeCountChange }: Props) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const current = useRef<Stroke>([]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  const start = useCallback((x: number, y: number) => {
    current.current = [{ x, y }];
    setStrokes((prev) => [...prev, current.current]);
  }, []);

  const move = useCallback((x: number, y: number) => {
    if (!current.current) return;
    current.current.push({ x, y });
    // Force update by replacing last stroke (cheap re-render)
    setStrokes((prev) => {
      const next = prev.slice();
      next[next.length - 1] = [...current.current];
      return next;
    });
  }, []);

  const end = useCallback(() => {
    current.current = [];
  }, []);

  useEffect(() => {
    // Clear all strokes when clearTrigger changes
    setStrokes([]);
  }, [clearTrigger]);

  useEffect(() => {
    // Undo last stroke when undoTrigger changes
    setStrokes((prev) => (prev.length ? prev.slice(0, prev.length - 1) : prev));
  }, [undoTrigger]);

  useEffect(() => {
    if (onStrokeCountChange) onStrokeCountChange(strokes.length);
  }, [strokes.length, onStrokeCountChange]);

  const eraseAt = useCallback(
    (x: number, y: number) => {
      const r2 = eraserRadius * eraserRadius;
      setStrokes((prev) =>
        prev.filter((stroke) => !stroke.some((p) => {
          const dx = p.x - x;
          const dy = p.y - y;
          return dx * dx + dy * dy <= r2;
        }))
      );
    },
    [eraserRadius]
  );

  const dots = useMemo(() => {
    return strokes.flatMap((stroke, si) =>
      stroke.map((p, pi) => (
        <View
          key={`s${si}-p${pi}`}
          style={{
            position: "absolute",
            left: p.x - strokeWidth / 2,
            top: p.y - strokeWidth / 2,
            width: strokeWidth,
            height: strokeWidth,
            borderRadius: strokeWidth / 2,
            backgroundColor: strokeColor,
          }}
        />
      ))
    );
  }, [strokes, strokeColor, strokeWidth]);

  const lines = useMemo(() => {
    const segs: React.ReactNode[] = [];
    for (let si = 0; si < strokes.length; si++) {
      const s = strokes[si];
      for (let i = 1; i < s.length; i++) {
        const p1 = s[i - 1];
        const p2 = s[i];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) continue;
        const angle = Math.atan2(dy, dx);
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        segs.push(
          <View
            key={`s${si}-seg${i}`}
            style={{
              position: "absolute",
              left: midX - len / 2,
              top: midY - strokeWidth / 2,
              width: len,
              height: strokeWidth,
              backgroundColor: strokeColor,
              transform: [{ rotateZ: `${angle}rad` }],
              borderRadius: strokeWidth / 2,
            }}
          />
        );
      }
    }
    return segs;
  }, [strokes, strokeColor, strokeWidth]);

  if (!enabled) return null;

  return (
    <View
      pointerEvents={enabled ? "auto" : "none"}
      style={StyleSheet.absoluteFill}
      onLayout={onLayout}
      onStartShouldSetResponder={() => enabled}
      onMoveShouldSetResponder={() => enabled}
      onResponderGrant={(e) => {
        const { locationX, locationY } = e.nativeEvent;
        if (tool === "eraser") {
          eraseAt(locationX, locationY);
        } else {
          start(locationX, locationY);
        }
      }}
      onResponderMove={(e) => {
        const { locationX, locationY } = e.nativeEvent;
        if (tool === "eraser") {
          eraseAt(locationX, locationY);
        } else {
          move(locationX, locationY);
        }
      }}
      onResponderRelease={() => {
        if (tool === "pen") end();
      }}
      onResponderTerminate={() => {
        if (tool === "pen") end();
      }}
    >
      {/* Drawing layer */}
      {mode === "dots" ? dots : lines}
    </View>
  );
}
