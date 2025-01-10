"use client";

import { LucideStar } from "lucide-react";
import React, { useEffect, useRef } from "react";

const MagicText = ({ text }: { text: string }) => {
  const starRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    starRefs.current.forEach((star, index) => {
      if (!star) return;
      const interval = 1000;

      const rand = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

      const animate = () => {
        star.style.left = `${rand(-10, 100)}%`;
        star.style.top = `${rand(-40, 80)}%`;

        star.style.animation = "none";
        star.offsetHeight; // Trigger reflow
        star.style.animation = "";
      };

      setTimeout(
        () => {
          animate();
          const animInterval = setInterval(animate, 1000);
          return () => clearInterval(animInterval);
        },
        index * (interval / 3),
      );
    });
  }, []);

  return (
    <span className="relative inline-block">
      {[0, 1, 2].map((idx) => (
        <span
          key={idx}
          ref={(el) => {
            starRefs.current[idx] = el;
          }}
          className="animate-scale absolute block h-5 w-5"
        >
          <LucideStar className="animate-rotate block fill-accent text-transparent opacity-60" />
        </span>
      ))}
      <span className="animate-backgroundPan whitespace-nowrap bg-clip-text text-transparent [background-image:linear-gradient(to_right,rgb(123,31,162),rgb(103,58,183),rgb(244,143,177),rgb(123,31,162))] [background-position:0%_center] [background-size:200%]">
        {text}
      </span>
    </span>
  );
};

export default MagicText;
