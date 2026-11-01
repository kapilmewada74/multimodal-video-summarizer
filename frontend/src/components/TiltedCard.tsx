"use client";

import React, { useRef, useState, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export interface TiltedCardLayerProps {
  children: React.ReactNode;
  depth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TiltedCardLayer: React.FC<TiltedCardLayerProps> = ({
  children,
  depth = 30,
  className = "",
  style = {},
}) => {
  return (
    <div
      style={{
        transform: `translateZ(${depth}px)`,
        transformStyle: "preserve-3d",
        ...style,
      }}
      className={`absolute inset-0 pointer-events-none ${className}`}
    >
      {children}
    </div>
  );
};

export interface TiltedCardProps {
  imageSrc?: string;
  altText?: string;
  captionText?: string;
  containerHeight?: string | number;
  containerWidth?: string | number;
  imageHeight?: string | number;
  imageWidth?: string | number;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  glare?: number | boolean;
  shadow?: number | boolean;
  backContent?: React.ReactNode;
  flipOnClick?: boolean;
  isFlipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
  children?: React.ReactNode;
  className?: string;
  frontClassName?: string;
  backClassName?: string;
  frontStyle?: React.CSSProperties;
  backStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}

const springConfig = {
  damping: 26,
  stiffness: 220,
  mass: 1.2,
};

export default function TiltedCard({
  imageSrc,
  altText = "Tilted Card",
  captionText,
  containerHeight = "320px",
  containerWidth = "100%",
  imageHeight = "100%",
  imageWidth = "100%",
  rotateAmplitude = 12,
  scaleOnHover = 1.05,
  glare = 0.5,
  shadow = 0.5,
  backContent,
  flipOnClick = true,
  isFlipped: controlledFlipped,
  onFlipChange,
  children,
  className = "",
  frontClassName = "",
  backClassName = "",
  frontStyle = {},
  backStyle = {},
  style = {},
}: TiltedCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Uncontrolled vs controlled flip state
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const maxGlare = typeof glare === "number" ? glare : glare ? 0.5 : 0;
  const shadowIntensity = typeof shadow === "number" ? shadow : shadow ? 0.4 : 0;

  // Raw cursor motion values (normalized from -1 to 1)
  const normX = useMotionValue(0);
  const normY = useMotionValue(0);
  const hoverScale = useMotionValue(1);

  // Smooth springs for tilt physics
  const springX = useSpring(normX, springConfig);
  const springY = useSpring(normY, springConfig);
  const springScale = useSpring(hoverScale, { damping: 20, stiffness: 200 });

  // Spring for flip rotation (0 deg -> 180 deg)
  const flipAngle = useSpring(isFlipped ? 180 : 0, { damping: 24, stiffness: 180 });

  // Update flipAngle spring when isFlipped changes
  React.useEffect(() => {
    flipAngle.set(isFlipped ? 180 : 0);
  }, [isFlipped, flipAngle]);

  // Derived 3D transform rotations
  // When card is flipped, invert X tilt for natural perspective
  const tiltX = useTransform(springY, [-1, 1], [rotateAmplitude, -rotateAmplitude]);
  const tiltY = useTransform(springX, [-1, 1], [-rotateAmplitude, rotateAmplitude]);

  // Combined rotateY = base flipAngle + tiltY (or -tiltY when looking at back)
  const combinedRotateY = useTransform(
    [flipAngle, tiltY],
    ([fa, ty]: number[]) => {
      const isBack = fa > 90;
      return isBack ? fa - ty : fa + ty;
    }
  );

  // Glare position (percentage across the card)
  const glareXPercent = useTransform(springX, [-1, 1], [20, 80]);
  const glareYPercent = useTransform(springY, [-1, 1], [20, 80]);
  const glareOpacity = useSpring(0, { damping: 20, stiffness: 250 });

  // Dynamic shadow offset shifting opposite to tilt
  const shadowOffsetX = useTransform(springX, [-1, 1], [15 * shadowIntensity, -15 * shadowIntensity]);
  const shadowOffsetY = useTransform(springY, [-1, 1], [20 * shadowIntensity, -5 * shadowIntensity]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Normalize coordinates: -1 (left/top) to 1 (right/bottom)
    const nX = (mouseX / width) * 2 - 1;
    const nY = (mouseY / height) * 2 - 1;

    normX.set(Math.max(-1, Math.min(1, nX)));
    normY.set(Math.max(-1, Math.min(1, nY)));
    hoverScale.set(scaleOnHover);
    if (maxGlare > 0) {
      glareOpacity.set(maxGlare);
    }
  };

  const handleMouseLeave = () => {
    normX.set(0);
    normY.set(0);
    hoverScale.set(1);
    glareOpacity.set(0);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!backContent || !flipOnClick) return;
    const next = !isFlipped;
    if (controlledFlipped === undefined) {
      setInternalFlipped(next);
    }
    onFlipChange?.(next);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className={`relative select-none ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        perspective: 1200,
        WebkitPerspective: 1200,
        cursor: backContent && flipOnClick ? "pointer" : "default",
        filter: shadowIntensity > 0
          ? "drop-shadow(0 12px 24px rgba(0,0,0,0.12))"
          : undefined,
        ...style,
      }}
    >
      <motion.div
        className="w-full h-full relative"
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          scale: springScale,
          rotateX: tiltX,
          rotateY: combinedRotateY,
        }}
      >
        {/* ================= FRONT SIDE ================= */}
        <div
          className={`absolute inset-0 w-full h-full rounded-[22px] ${frontClassName}`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(0deg) translateZ(1px)",
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            ...frontStyle,
          }}
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={altText}
              style={{
                width: imageWidth,
                height: imageHeight,
                objectFit: "cover",
              }}
              className="w-full h-full pointer-events-none rounded-[22px]"
            />
          )}

          {/* Floating layers (<TiltedCardLayer>) and front children */}
          {children}

          {/* Dynamic Glare Overlay */}
          {maxGlare > 0 && (
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-[22px] z-30"
              style={{
                opacity: glareOpacity,
                background: useTransform(
                  [glareXPercent, glareYPercent],
                  ([gx, gy]: number[]) =>
                    `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.12) 35%, transparent 70%)`
                ),
                mixBlendMode: "overlay",
              }}
            />
          )}
        </div>

        {/* ================= BACK SIDE (FLIP) ================= */}
        {backContent && (
          <div
            className={`absolute inset-0 w-full h-full rounded-[22px] ${backClassName}`}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg) translateZ(1px)",
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
              ...backStyle,
            }}
          >
            {backContent}

            {/* Back Glare Overlay */}
            {maxGlare > 0 && (
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-[22px] z-30"
                style={{
                  opacity: glareOpacity,
                  background: useTransform(
                    [glareXPercent, glareYPercent],
                    ([gx, gy]: number[]) =>
                      `radial-gradient(circle at ${100 - gx}% ${gy}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 75%)`
                  ),
                  mixBlendMode: "overlay",
                }}
              />
            )}
          </div>
        )}
      </motion.div>

      {/* Optional Caption */}
      {captionText && !isFlipped && (
        <p className="mt-2 text-xs text-[var(--text-muted)] text-center truncate">
          {captionText}
        </p>
      )}
    </div>
  );
}
