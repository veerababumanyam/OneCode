import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { createDesktopApi } from "./api/runtime";
import { en } from "./i18n/en";
import "./styles.css";

const rootElement = document.querySelector("#root");
if (!rootElement) throw new Error("The application root element is missing.");

document.title = en.app.documentTitle;
document.querySelector('meta[name="description"]')?.setAttribute("content", en.app.description);

// OneQuill resolves light/dark from [data-theme]; follow the OS preference until a
// user-facing theme choice exists (DESIGN-GUIDELINES §4). A ?theme= deep link
// overrides it, mirroring the ?view= and ?palette= capture/test affordances.
function applyPreferredTheme() {
  const forced = new URLSearchParams(window.location.search).get("theme");
  const set = (dark: boolean) => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  };
  if (forced === "dark" || forced === "light") {
    set(forced === "dark");
    return;
  }
  const query = window.matchMedia?.("(prefers-color-scheme: dark)");
  if (!query) {
    set(false);
    return;
  }
  set(query.matches);
  query.addEventListener?.("change", (event) => set(event.matches));
}
applyPreferredTheme();

// Direction follows the document language; a ?dir= deep link overrides it so RTL
// layout can be captured and verified, mirroring the ?theme= and ?view= affordances.
function applyPreferredDirection() {
  const forced = new URLSearchParams(window.location.search).get("dir");
  if (forced === "rtl" || forced === "ltr") {
    document.documentElement.dir = forced;
  }
}
applyPreferredDirection();

void createDesktopApi().then((api) => {
  createRoot(rootElement).render(
    <StrictMode>
      <App api={api} />
    </StrictMode>,
  );
});
