
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Providers } from "./providers/Providers.tsx";
import { SocketProvider } from "./contexts/SocketContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Providers>
    <SocketProvider>
      <App />
    </SocketProvider>
  </Providers>
);
