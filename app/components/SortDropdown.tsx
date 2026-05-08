"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

export function SortDropdown() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  const currentSort = searchParams.get("sort") ?? "newest";
  const currentLabel =
    OPTIONS.find((o) => o.value === currentSort)?.label ?? "Newest first";

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "16px",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          color: "var(--orange)",
          background: "transparent",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "6px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          minWidth: "180px",
          justifyContent: "space-between",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "var(--orange)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--border)")
        }
      >
        <span>{currentLabel}</span>
        <span
          style={{
            fontSize: "11px",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: "180px",
            background: "var(--bg-card)",
            border: "1px solid var(--yellow)",
            borderRadius: "4px",
            boxShadow: "0 0 16px rgba(247, 255, 0, 0.25)",
            overflow: "hidden",
            zIndex: 10,
          }}
        >
          {OPTIONS.map((opt) => {
            const isActive = opt.value === currentSort;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  color: isActive ? "var(--yellow)" : "var(--text-muted)",
                  background: isActive
                    ? "rgba(247, 255, 0, 0.1)"
                    : "transparent",
                  border: "none",
                  padding: "10px 14px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background =
                      "rgba(255, 107, 53, 0.1)";
                    e.currentTarget.style.color = "var(--orange)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}