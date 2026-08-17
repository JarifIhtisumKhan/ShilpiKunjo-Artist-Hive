import React, { useState, useEffect, useMemo } from 'react';

/**
 * Reusable Pinterest-Style Masonry Engine
 * - Column-balanced distribution (items flow into the shortest column)
 * - Preserves natural image aspect ratios (no cropping/forcing)
 * - Skeleton placeholders while loading
 * - Responsive breakpoints (2 cols mobile, 3 tablet, 4 desktop, 5 wide)
 */
export default function MasonryEngine({
  items = [],
  renderItem,
  isLoading = false,
  skeletonCount = 8,
  emptyMessage = "No items to display.",
  onItemClick
}) {
  const [columnCount, setColumnCount] = useState(4);

  // Responsive column calculation
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumnCount(2); // Mobile
      } else if (width < 1024) {
        setColumnCount(3); // Tablet
      } else if (width < 1536) {
        setColumnCount(4); // Desktop
      } else {
        setColumnCount(5); // Ultra-wide
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Distribute items across columns in a balanced flow
  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => []);
    const colHeights = Array(columnCount).fill(0);

    items.forEach((item, index) => {
      // Estimate height or default ratio (tall/square/wide variation)
      const estimatedHeight = item.aspectRatioHeight || (280 + ((index * 47) % 180));
      
      // Find shortest column
      let shortestColIndex = 0;
      let minHeight = colHeights[0];
      for (let i = 1; i < columnCount; i++) {
        if (colHeights[i] < minHeight) {
          minHeight = colHeights[i];
          shortestColIndex = i;
        }
      }

      cols[shortestColIndex].push(item);
      colHeights[shortestColIndex] += estimatedHeight;
    });

    return cols;
  }, [items, columnCount]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => {
          const randomHeight = 240 + ((i * 53) % 180);
          return (
            <div
              key={i}
              style={{ height: `${randomHeight}px` }}
              className="w-full bg-gray-900/80 rounded-2xl animate-pulse border border-gray-800/60 p-4 flex flex-col justify-end gap-3"
            >
              <div className="h-4 bg-gray-800 rounded-full w-3/4"></div>
              <div className="h-3 bg-gray-800/70 rounded-full w-1/2"></div>
            </div>
          );
        })}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-center justify-center text-gray-500 mb-4 shadow-inner">
          <svg className="w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h4 className="text-lg font-semibold text-gray-300 mb-1">{emptyMessage}</h4>
        <p className="text-sm text-gray-500 max-w-sm">Explore different filters or be the first artist to publish in this section.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 sm:gap-6 items-start w-full">
      {columns.map((columnItems, colIndex) => (
        <div key={colIndex} className="flex-1 flex flex-col gap-4 sm:gap-6 min-w-0">
          {columnItems.map((item, itemIndex) => (
            <div
              key={item.art_id || item.submission_id || item.id || itemIndex}
              onClick={() => onItemClick && onItemClick(item)}
              className="cursor-pointer group transition-transform duration-300 hover:-translate-y-1"
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
