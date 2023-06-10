"use client";

import ansi2html from "ansi-to-html";

const config: ConstructorParameters<typeof ansi2html>[0] = {
  fg: "",
  newline: true,
  colors: {
    // ansi color codes, lifted from playwright except primary colors: https://github.com/microsoft/playwright/blob/main/packages/html-reporter/src/testResultView.tsx
    0: "#000", // black
    1: "#b91c1c", // red-700
    2: "#16a34a", // green-600
    3: "#ca8a04", // yellow-600
    4: "#2563eb", // blue-600
    5: "#C0C", // purple
    6: "#0CC", // cyan
    7: "#CCC", // white
    8: "#555",
    9: "#F55",
    10: "#5F5",
    11: "#FF5",
    12: "#55F",
    13: "#F5F",
    14: "#5FF",
    15: "#FFF",
  },
};
const converter = new ansi2html(config);

export const Errors = ({ error }: { error: string }) => {
  const html = converter.toHtml(escapeHTML(error));

  return (
    <div
      className="whitespace-pre-wrap font-mono rounded p-4 text-sm bg-muted"
      dangerouslySetInnerHTML={{ __html: html || "" }}
    ></div>
  );
};

function escapeHTML(text: string): string {
  return text.replace(/[&"<>]/g, (c) => ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" }[c]!));
}
