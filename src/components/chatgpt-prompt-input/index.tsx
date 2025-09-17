import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
// Dialog removed

type ClassValue = string | number | boolean | null | undefined;
function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    showArrow?: boolean;
  }
>(({ className, sideOffset = 4, showArrow = false, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "relative z-50 max-w-[280px] rounded-md bg-popover text-popover-foreground px-1.5 py-1 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {props.children}
      {showArrow && <TooltipPrimitive.Arrow className="-my-px fill-popover" />}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
// Popover removed
// Dialog components removed

// --- SVG Icon Components ---
// Removed Plus and Settings icons
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {" "}
    <path
      d="M12 5.25L12 18.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />{" "}
    <path
      d="M18.75 12L12 5.25L5.25 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />{" "}
  </svg>
);
// XIcon removed
// Removed tool-related icons
// NEW: MicIcon
const MicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {" "}
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>{" "}
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>{" "}
    <line x1="12" y1="19" x2="12" y2="23"></line>{" "}
  </svg>
);

// Tools list removed

interface PromptBoxProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange" | "onSubmit"
  > {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  loading?: boolean;
  allowSpeech?: {
    recording: boolean;
    onRecordingChange: (recording: boolean) => void;
  };
  header?: React.ReactNode;
}

// --- The Final, Self-Contained PromptBox Component ---
export const PromptBox = React.forwardRef<HTMLDivElement, PromptBoxProps>(
  (
    {
      className,
      value: externalValue,
      onChange,
      onSubmit,
      disabled,
      loading,
      allowSpeech,
      header,
      ...props
    },
    ref
  ) => {
    const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [internalValue, setInternalValue] = React.useState("");
    // tool state removed
    const [isComposing, setIsComposing] = React.useState(false);

    // Use external value if provided, otherwise use internal state
    const value = externalValue !== undefined ? externalValue : internalValue;
    React.useLayoutEffect(() => {
      const textarea = internalTextareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        const newHeight = Math.min(textarea.scrollHeight, 200);
        textarea.style.height = `${newHeight}px`;
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (externalValue === undefined) {
        setInternalValue(newValue);
      }
      if (onChange) {
        onChange(newValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !isComposing) {
        e.preventDefault();
        if (!disabled && !loading && value.trim() && onSubmit) {
          onSubmit();
        }
      }
    };

    const handleSubmit = () => {
      if (!disabled && !loading && value.trim() && onSubmit) {
        onSubmit();
      }
    };
    const hasValue = value.trim().length > 0;

    return (
      <div ref={ref} className="w-full">
        {header && <div className="mb-2">{header}</div>}

        <div
          className={cn(
            "flex flex-col rounded-2xl p-3 shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 cursor-text hover:shadow-xl hover:bg-white/90 dark:hover:bg-gray-800/90",
            className
          )}
        >
          {/* Image attach and preview removed */}

          <textarea
            ref={internalTextareaRef}
            rows={1}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={props.placeholder || "Message..."}
            disabled={disabled}
            className="custom-scrollbar w-full resize-none border-0 bg-transparent p-3 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-gray-300 focus:ring-0 focus-visible:outline-none min-h-12"
            {...props}
          />

          <div className="mt-0.5 p-1 pt-0">
            <TooltipProvider delayDuration={100}>
              <div className="flex items-center gap-2">
                {/* Removed: attachment and tools controls */}

                {/* Right-aligned buttons container */}
                <div className="ml-auto flex items-center gap-2">
                  {allowSpeech && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() =>
                            allowSpeech.onRecordingChange(
                              !allowSpeech.recording
                            )
                          }
                          disabled={disabled}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none hover:scale-105 active:scale-95",
                            allowSpeech.recording
                              ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 animate-pulse"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white"
                          )}
                        >
                          <MicIcon className="h-5 w-5" />
                          <span className="sr-only">Record voice</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" showArrow={true}>
                        <p>
                          {allowSpeech.recording
                            ? "Stop recording"
                            : "Record voice"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={disabled || loading || !hasValue}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-700/35 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none hover:scale-105 active:scale-95"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <SendIcon className="h-5 w-5" />
                        )}
                        <span className="sr-only">
                          {loading ? "Processing..." : "Send message"}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" showArrow={true}>
                      <p>{loading ? "Processing..." : "Send"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  }
);
PromptBox.displayName = "PromptBox";
