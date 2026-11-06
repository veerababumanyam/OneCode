import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { createDevelopmentFixtureAdapter } from "../dev/fixture-adapter";
import { en } from "../i18n/en";

describe("Command palette", () => {
  it("opens with Ctrl+K, filters to one match, and navigates on Enter", async () => {
    render(<App api={createDevelopmentFixtureAdapter()} />);
    await screen.findByRole("heading", { name: en.screens.home });

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const dialog = await screen.findByRole("dialog", { name: en.palette.title });

    fireEvent.change(screen.getByRole("textbox", { name: en.palette.title }), { target: { value: "rev" } });
    const options = screen.getAllByRole("button").filter((button) => button.closest(".palette-list"));
    expect(options).toHaveLength(1);

    fireEvent.keyDown(dialog, { key: "Enter" });
    expect(await screen.findByRole("heading", { name: en.screens.review })).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: en.palette.title })).toBeNull();
  });

  it("closes on Escape without navigating", async () => {
    render(<App api={createDevelopmentFixtureAdapter()} />);
    await screen.findByRole("heading", { name: en.screens.home });

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const dialog = await screen.findByRole("dialog", { name: en.palette.title });

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: en.palette.title })).toBeNull();
    expect(screen.getByRole("heading", { name: en.screens.home })).toBeTruthy();
  });

  it("opens from the topbar trigger", async () => {
    render(<App api={createDevelopmentFixtureAdapter()} />);
    await screen.findByRole("heading", { name: en.screens.home });

    fireEvent.click(screen.getByRole("button", { name: en.palette.title }));
    expect(await screen.findByRole("dialog", { name: en.palette.title })).toBeTruthy();
  });
});
