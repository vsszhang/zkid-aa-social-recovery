import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import "./index.css";
import App from "./App";
import OverviewPage from "./pages/OverviewPage";
import AccountRecoveryPage from "./pages/AccountRecoveryPage";
import MessageCenterPage from "./pages/MessageCenterPage";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Owner from "./components/Owner";
import Landing from "./components/Landing";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/owner",
    element: <Owner />,
    children: [
      { path: "/owner/overview", element: <OverviewPage /> },
      { path: "/owner/account-recovery", element: <AccountRecoveryPage /> },
      { path: "/owner/message-center", element: <MessageCenterPage /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ChakraProvider>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </ChakraProvider>
);
