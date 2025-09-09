import { useIsMobile } from "../../hooks/useIsMobile";

interface DragHandleProps {
  x: number;
  setX: (x: number) => void;
  leftGap: number;
  rightGap: number;
}

export function DragHandle({ x, setX, leftGap, rightGap }: DragHandleProps) {
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <div
      className="fixed top-1/2 right-0 w-[0.4rem] h-12 z-50 cursor-ew-resize border border-blue-900 rounded-full bg-blue-50 opacity-50 hover:opacity-100 translate-y-[-50%]"
      style={{ marginRight: `calc(${x}px - 0.25rem)` }}
      draggable
      onDragStart={(e) => {
        // @ts-expect-error 类型提示错误, 运行无问题
        e.target.style.opacity = "0";
      }}
      onDragEnd={(e) => {
        // @ts-expect-error 类型提示错误, 运行无问题
        e.target.style.opacity = "1";
      }}
      onDrag={(e) => {
        const newX = window.innerWidth - e.clientX;
        if (newX < leftGap || newX > window.innerWidth - rightGap) {
          return;
        }
        setX(newX);
      }}
    />
  );
}
