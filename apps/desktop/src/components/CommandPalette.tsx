import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { WorkspaceView } from "../api/types";
import { en } from "../i18n/en";
import { Icon } from "./Icon";
import { navGroups } from "./Navigator";
import "./CommandPalette.css";

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: WorkspaceView) => void;
};

export function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => navGroups.flatMap((group) => group.items), []);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? items.filter((item) => item.label.toLowerCase().includes(needle)) : items;
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!open) return null;

  function choose(view: WorkspaceView) {
    onNavigate(view);
    onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = filtered[active];
      if (item) choose(item.view);
    }
  }

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div
        aria-label={en.palette.title}
        aria-modal="true"
        className="palette"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
      >
        <div className="palette-input">
          <Icon name="search" />
          <input
            aria-label={en.palette.title}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={en.palette.placeholder}
            ref={inputRef}
            type="text"
            value={query}
          />
        </div>
        <ul className="palette-list">
          {filtered.map((item, index) => (
            <li key={item.view}>
              <button
                aria-current={index === active ? "true" : undefined}
                className={`palette-item${index === active ? " is-active" : ""}`}
                onClick={() => choose(item.view)}
                onMouseEnter={() => setActive(index)}
                tabIndex={-1}
                type="button"
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="palette-empty">{en.palette.noResults}</li>}
        </ul>
        <div className="palette-footer">
          <span className="palette-key">↑↓</span><span>{en.palette.hintNav}</span>
          <span className="palette-key">↵</span><span>{en.palette.hintEnter}</span>
          <span className="palette-key">Esc</span><span>{en.palette.hintEsc}</span>
        </div>
      </div>
    </div>
  );
}
