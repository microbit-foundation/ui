/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ToastProvider } from "@microbit/ui";
import { messages } from "@microbit/ui/messages";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { IntlProvider } from "react-intl";
import { App } from "./App";
import "./layers.css";
import "./styled-system.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IntlProvider locale="en" messages={messages.en}>
      <App />
      <ToastProvider />
    </IntlProvider>
  </StrictMode>,
);
