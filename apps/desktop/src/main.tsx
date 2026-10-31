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

void createDesktopApi().then((api) => {
  createRoot(rootElement).render(
    <StrictMode>
      <App api={api} />
    </StrictMode>,
  );
});
