import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { ChatSimple } from "../components/Chat/ChatSimple";
import { ConfigLayout } from "../components/Config/ConfigLayout";
import { ConfigMain } from "../components/Config/ConfigMain";
import { ConfigVoice } from "../components/Config/ConfigVoice";
import { Live2DController } from "../components/Live2DController";
import { MemoryMain } from "../components/Memory/MemoryMain";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <ChatSimple />,
      },
      {
        path: "memory",
        element: <MemoryMain />,
      },
      {
        path: "chat/text",
        element: <ChatSimple />,
      },
      {
        path: "chat/voice",
        element: <ChatSimple />,
      },
      {
        path: "live2d",
        element: <Live2DController />,
      },
      {
        path: "config/main",
        element: <ConfigMain />,
      },
      {
        path: "config/service",
        element: <ConfigVoice />,
      },
      {
        path: "config/layout",
        element: <ConfigLayout />,
      },
    ],
  },
]);
