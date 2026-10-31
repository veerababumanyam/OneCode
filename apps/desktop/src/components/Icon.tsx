import type { ReactNode, SVGProps } from "react";

const paths = {
  brand: <><path d="M12 3.5 20.5 8v8L12 20.5 3.5 16V8L12 3.5Z" /><path d="m8.5 10 3.5-2 3.5 2v4l-3.5 2-3.5-2v-4Z" /></>,
  chat: <><path d="M4 5.5h16v11H9l-5 3v-14Z" /><path d="M8 9h8M8 13h5" /></>,
  review: <><path d="m5 12 4 4L19 6" /><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" /></>,
  context: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3" /><path d="M12 3.5v5M20.5 12h-5M12 20.5v-5M3.5 12h5" /></>,
  models: <><path d="m12 3.5 8 4.5v8l-8 4.5L4 16V8l8-4.5Z" /><path d="m4 8 8 4.5L20 8M12 12.5V20" /></>,
  history: <><path d="M3.5 12a8.5 8.5 0 1 0 2.4-5.9L3.5 8.5" /><path d="M3.5 4.5v4h4M12 7v5l3 2" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.8-.6a7.8 7.8 0 0 1-1.7 1l-.3 1.9h-2.8l-.3-1.9a7.8 7.8 0 0 1-1.7-1l-1.8.6-1.4-2.4 1.4-1.1a7.8 7.8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.8.6a7.8 7.8 0 0 1 1.7-1l.3-1.9h2.8l.3 1.9a7.8 7.8 0 0 1 1.7 1l1.8-.6 1.4 2.4-1.4 1.1a7.8 7.8 0 0 1 0 2Z" /></>,
  explorer: <><path d="M3.5 7.5h6l2 2h9v9h-17z" /><path d="M3.5 7.5v-2h6l2 2" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
  source: <><path d="M6 4v11a4 4 0 0 0 4 4h8" /><circle cx="6" cy="4" r="2" /><circle cx="18" cy="19" r="2" /><path d="M18 4v2a4 4 0 0 1-4 4h-2" /><circle cx="18" cy="4" r="2" /></>,
  sessions: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
  map: <><circle cx="6" cy="6.5" r="2.5" /><circle cx="18" cy="7.5" r="2.5" /><circle cx="12" cy="18" r="2.5" /><path d="m8.5 6.7 7 .6M7.2 8.7l3.6 7M16.8 9.7l-3.5 6.2" /></>,
  folder: <><path d="M3.5 7.5h6l2 2h9v9h-17z" /><path d="M3.5 7.5v-2h6l2 2" /></>,
  file: <><path d="M6 3.5h8l4 4v13H6z" /><path d="M14 3.5v5h4M9 13h6M9 16.5h6" /></>,
  terminal: <><path d="m5 7 5 5-5 5M12 17h7" /></>,
  tests: <><path d="m5 12 4 4L19 6" /><path d="M5 4h14M5 20h14" /></>,
  problems: <><path d="M12 3 2.8 19h18.4L12 3Z" /><path d="M12 9v4M12 16h.01" /></>,
  processes: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
  output: <><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h5" /></>,
  evidence: <><path d="M5 3.5h14v17H5z" /><path d="m8 12 2.5 2.5L16 9M8 7h8" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v2" /></>,
  external: <><path d="M13 5h6v6M19 5l-9 9" /><path d="M17 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="var(--oq-icon-stroke)"
      viewBox="0 0 24 24"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
