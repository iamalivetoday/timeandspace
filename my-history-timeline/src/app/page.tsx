"use client";

import React, { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [timelineData, setTimelineData] = useState([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [jumpYear, setJumpYear] = useState(2024);
  const [pixelsPerYear, setPixelsPerYear] = useState(10); // Default scale
  const maxYear = 2100;
  const minYear = -10000;
  const offset = Math.abs(minYear);
  const currentYear = new Date().getFullYear(); // Get the current year

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => setTimelineData(data));
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollToYear(2024);
      }
    }, 100);
  }, []);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const maxScrollLeft = (maxYear - minYear) * pixelsPerYear;
    if (scrollContainerRef.current.scrollLeft > maxScrollLeft) {
      scrollContainerRef.current.scrollLeft = maxScrollLeft;
    }
  };

  const scrollToYear = (year: number) => {
    if (!scrollContainerRef.current) return;
    const constrainedYear = Math.min(Math.max(year, minYear), maxYear);
    const position = (constrainedYear + offset) * pixelsPerYear;
    scrollContainerRef.current.scrollTo({
      left: position,
      behavior: "smooth",
    });
  };

  const handleJump = () => {
    scrollToYear(jumpYear);
  };

  // ** Zoom In (Double pixels per year) **
  const handleZoomIn = () => {
    setPixelsPerYear((prev) => Math.min(prev * 2, 100)); // Limit max zoom
  };

  // ** Zoom Out (Halve pixels per year) **
  const handleZoomOut = () => {
    setPixelsPerYear((prev) => Math.max(prev / 2, 1)); // Limit min zoom
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-100">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-10 px-6 py-3 flex items-center justify-between">
        <h1 className="text-black font-bold text-lg">Timeline of Everything</h1>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Zoom In/Out Buttons */}
          <button
            onClick={handleZoomOut}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            −
          </button>
          <button
            onClick={handleZoomIn}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            +
          </button>

          {/* Jump To Year */}
          <input
            type="number"
            value={jumpYear}
            onChange={(e) => setJumpYear(Number(e.target.value) || "")}
            placeholder="year"
            className="p-2 border border-gray-300 rounded w-24 text-base"
          />
          <button
            onClick={handleJump}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-base"
          >
            Jump To
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div
        ref={scrollContainerRef}
        className="relative flex h-[88vh] overflow-x-scroll bg-white border-t mt-16"
        onScroll={handleScroll}
        style={{ scrollBehavior: "smooth" }}
      >
        {/* X-Axis Century Banners */}
        {Array.from({ length: (maxYear - minYear) / 100 + 1 }, (_, i) => {
          const year = minYear + i * 100;
          const position = (year + offset) * pixelsPerYear;
          const width = 100 * pixelsPerYear;
          const isEven = (year / 100) % 2 === 0;

          return (
            <div
              key={year}
              className={`absolute bottom-0 text-gray-900 text-sm font-bold py-2 px-4 text-center ${
                isEven ? "bg-gray-200" : "bg-gray-300"
              }`}
              style={{
                left: `${position}px`,
                width: `${width}px`,
                minWidth: "100px",
              }}
            >
              {year > 0 ? `${year} CE` : `${Math.abs(year)} BCE`}
            </div>
          );
        })}

        {/* Red Vertical Line for Current Year */}
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-red-500"
          style={{
            left: `${(currentYear + offset) * pixelsPerYear}px`,
          }}
        />

        {/* Timeline Events */}
        {timelineData.map((event, index) => {
          const eventYear = parseInt(event.years.replace(/,/g, ""), 10);
          const adjustedYear =
            event.years.includes("BC") || event.years.includes("BCE")
              ? -eventYear
              : eventYear;

          // Determine duration of event
          let eventWidth = pixelsPerYear;
          if (event.years.includes("-")) {
            const [start, end] = event.years.split("-").map((y) => parseInt(y));
            eventWidth = (Math.abs(start - end) || 1) * pixelsPerYear;
          }

          const position = (adjustedYear + offset) * pixelsPerYear;

          // Handle Short Text Case
          const textWidth = `${eventWidth}px`;

          return (
            <div
              key={index}
              className="absolute bottom-10 flex-shrink-0 bg-blue-500 text-white p-2 rounded-lg overflow-hidden whitespace-nowrap"
              style={{
                left: `${position}px`,
                width: textWidth,
                minWidth: "100px",
              }}
            >
              <div
                className="text-xs"
                style={{
                  display: "inline-block",
                  animation: `scroll-text 20s linear infinite`,
                }}
              >
                {event.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll Animation CSS */}
      <style jsx>{`
        @keyframes scroll-text {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
