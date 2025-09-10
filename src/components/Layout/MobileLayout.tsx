import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { useIsMobile } from "../../hooks/useIsMobile";

export function MobileLayout() {
  const isMobile = useIsMobile();

  return (
    <main className="w-dvw h-dvh overflow-hidden">
      <div className="h-dvh overflow-hidden">
        <div className="w-full h-full overflow-hidden grid grid-rows-[1fr_3.2rem]">
          <div
            className="w-full h-full overflow-hidden flex flex-col justify-center items-center py-4"
            style={{
              paddingLeft: isMobile ? "1rem" : "1.5rem",
              paddingRight: isMobile ? "1rem" : "1.5rem",
            }}
          >
            <div className="w-full overflow-hidden">
              <Outlet />
            </div>
          </div>
          <Navigation />
        </div>
      </div>
    </main>
  );
}
