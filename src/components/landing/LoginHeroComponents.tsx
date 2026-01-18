import React from "react";

/**
 * HorizontalCurve - SVG curve for mobile layout (positioned at bottom of hero section)
 * Creates 3 pronounced, organic wave curves that separate the hero from the form
 * The waves flow naturally with varying amplitudes for visual interest
 */
export const HorizontalCurve = () => (
  <svg
    className="absolute bottom-0 left-0 w-full h-[80px] md:h-[100px]"
    viewBox="0 0 1200 150"
    preserveAspectRatio="none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 
      3-curve organic wave pattern:
      - First curve: Deep dip starting from left
      - Second curve: Peak in the middle 
      - Third curve: Gentle rise toward the right
      Creates an asymmetrical, flowing wave effect
    */}
    <path
      d="M0,80 
         C600,0 650,10 600,130 
         C750,190 1100,100 1200,60 
         L1200,150 L0,150 Z"
      className="fill-white"
    />
  </svg>
);

/**
 * VerticalCurve - SVG curve for desktop layout (positioned on right edge of hero section)
 * Same organic wave shape as horizontal curve, rotated 90 degrees to run top-to-bottom
 * Maintains the smooth, asymmetrical flow from the reference image
 */
export const VerticalCurve = () => (
  <svg
    className="absolute top-0 right-0 w-[100px] xl:w-[140px] 2xl:w-[180px] h-full"
    viewBox="0 0 200 1200"
    preserveAspectRatio="none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 
      S-shaped curve matching the sketch:
      - Gentle inward curve near the top (starts curving inward gradually)
      - Strong inward pinch around the middle (deepest point, x=30-40)
      - Eases back out toward the bottom (returns smoothly to right edge)
      Creates a smooth, organic S-flow pattern with pronounced middle pinch
    */}
    <path
      d="M100,0 
     C180,200 180,400 100,600 
     C20,800 20,1000 100,1200 
     L200,1200 L200,0 Z"
      className="fill-white"
    />
  </svg>
);

/**
 * TopographicPattern - SVG pattern overlay for the hero section
 * Creates the contour line effect visible in the reference image
 *
 * @param patternId - Unique ID for the SVG pattern (default: "topographic")
 */
interface TopographicPatternProps {
  patternId?: string;
}

export const TopographicPattern: React.FC<TopographicPatternProps> = ({
  patternId = "topographic",
}) => (
  <svg
    className="absolute inset-0 w-full h-full opacity-20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id={patternId}
        x="0"
        y="0"
        width="200"
        height="200"
        patternUnits="userSpaceOnUse"
      >
        {/* Organic contour lines */}
        <path
          d="M20,100 Q60,60 100,100 T180,100"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        <path
          d="M0,140 Q40,100 80,140 T160,140 T240,140"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
        <path
          d="M30,60 Q70,20 110,60 T190,60"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        <path
          d="M10,180 Q50,140 90,180 T170,180"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
        <path
          d="M40,30 Q80,-10 120,30 T200,30"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${patternId})`} />
  </svg>
);
