import { useState } from "react";
import { ChatCheck } from "./ChatCheck.tsx";
import { ChatSimple } from "./ChatSimple.tsx";

export function ChatIndex({ to }: { to: "text" | "voice" }) {
  const [ready, setReady] = useState<boolean>(false);

  return (
    <section className="w-full overflow-hidden flex flex-col justify-center items-center">
      {ready ? <ChatSimple /> : <ChatCheck setReady={setReady} />}
    </section>
  );
}
