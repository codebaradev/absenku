"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

const PAGE_SIZE = 5;

export function useTablePagination<T>(items: T[]) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);

  return {
    page: current,
    pageCount,
    pageItems: items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    setPage,
  };
}

export function TablePagination({
  page,
  pageCount,
  total,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex items-center justify-between gap-4 border-t border-[#e5e7eb] px-4 py-3">
      <span className="hidden sm:block text-sm text-[#45464d]">
        Menampilkan {start}–{end} dari {total}
      </span>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeftIcon />
              <span className="hidden sm:block">Sebelumnya</span>
            </Button>
          </PaginationItem>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <PaginationItem key={p}>
              <Button
                variant={p === page ? "outline" : "ghost"}
                size="icon"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </Button>
            </PaginationItem>
          ))}
          <PaginationItem>
            <Button
              variant="ghost"
              onClick={() => onPageChange(page + 1)}
              disabled={page === pageCount}
              aria-label="Halaman berikutnya"
            >
              <span className="hidden sm:block">Berikutnya</span>
              <ChevronRightIcon />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
