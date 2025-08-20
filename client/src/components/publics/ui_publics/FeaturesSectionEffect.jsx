"use client";

import { cn } from "../../../lib/cn";
import React, { useEffect, useState } from "react";

export const FeatureSectionEffect = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}) => {
  const containerRef = React.useRef(null);
  const scrollerRef = React.useRef(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addAnimation() {
    if (!containerRef.current || !scrollerRef.current) return;

    // duplikasi item agar loop seamless
    const children = Array.from(scrollerRef.current.children);
    children.forEach((child) => {
      scrollerRef.current.appendChild(child.cloneNode(true));
    });

    applyDirection();
    applySpeed();
    setStart(true);
  }

  function applyDirection() {
    if (!containerRef.current) return;
    containerRef.current.style.setProperty(
      "--animation-direction",
      direction === "left" ? "forwards" : "reverse"
    );
  }

  function applySpeed() {
    if (!containerRef.current) return;
    const dur =
      typeof speed === "number"
        ? `${speed}s`
        : speed === "fast"  
        ? "10s"
        : speed === "normal"
        ? "24s"
        : "40s";
    containerRef.current.style.setProperty("--animation-duration", dur);
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-[50vh] w-full flex items-center justify-center overflow-hidden",
        "mx-auto max-w-7xl",
        className
      )}
      // style={{
      //   // efek blur/fade di kiri-kanan
      //   maskImage:
      //     "linear-gradient(to right, rgba(255,255,255,0), white 15%, white 85%, rgba(255,255,255,0))",
      //   WebkitMaskImage:
      //     "linear-gradient(to right, rgba(255,255,255,0), white 15%, white 85%, rgba(255,255,255,0))",
      //   maskRepeat: "no-repeat",
      //   maskSize: "100% 100%",
      //   WebkitMaskRepeat: "no-repeat",
      //   WebkitMaskSize: "100% 100%",
      // }}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-feature-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item) => (
          <li
            key={item.name}
            className={cn(
              "relative w-[350px] max-w-full shrink-0 rounded-2xl",
              "border border-b-0 shadow-md border-zinc-200" 
            )}
          >
            <blockquote className="px-10 py-5">
              <span className="relative z-20 text-xl font-normal leading-[1.6] text-green-800 pt-10">
                {item.quote}
              </span>
              <div className="relative z-20 mt-6 flex flex-row items-center">
                <span className="flex flex-col gap-1">
                  <span className="text-xl font-bold leading-[1.6] text-neutral-800 ">
                    {item.name}
                  </span>
                  <span className="text-sm font-normal leading-[1.6] text-gray-800 ">
                    {item.title}
                  </span>
                </span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>

  <style>{`
        .animate-feature-scroll {
          animation-name: feature-scroll-x;
          animation-duration: var(--animation-duration, 24s);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-direction: var(--animation-direction, forwards);
        }
        @keyframes feature-scroll-x {
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};
