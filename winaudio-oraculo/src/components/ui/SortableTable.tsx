'use client';

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface SortableTableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: SortConfig;
  onSort: (key: string) => void;
  className?: string;
}

export function SortableTableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  className = '',
}: SortableTableHeaderProps) {
  const isActive = currentSort.key === sortKey;
  const isAsc = isActive && currentSort.direction === 'asc';
  const isDesc = isActive && currentSort.direction === 'desc';

  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`px-6 py-4 font-semibold cursor-pointer hover:bg-[var(--color-bg-light)] transition-colors ${className}`}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {isAsc && <ChevronUp size={16} className="text-[var(--color-primary)]" />}
        {isDesc && <ChevronDown size={16} className="text-[var(--color-primary)]" />}
        {!isActive && <ChevronUp size={16} className="text-gray-300" />}
      </div>
    </th>
  );
}

export function useSortableData<T extends Record<string, any>>(
  items: T[],
  initialSort?: SortConfig
) {
  const [sort, setSort] = React.useState<SortConfig>(initialSort || { key: '', direction: null });

  const handleSort = (key: string) => {
    let direction: SortDirection = 'asc';
    if (sort.key === key) {
      if (sort.direction === 'asc') direction = 'desc';
      else if (sort.direction === 'desc') direction = null;
    }
    setSort({ key, direction });
  };

  const sortedItems = React.useMemo(() => {
    if (!sort.direction || !sort.key) return items;

    const sorted = [...items].sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        return sort.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (aVal instanceof Date && bVal instanceof Date) {
        return sort.direction === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      return 0;
    });

    return sorted;
  }, [items, sort]);

  return { sortedItems, sort, handleSort };
}
