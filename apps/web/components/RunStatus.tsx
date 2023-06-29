import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shadcn/Tooltip";
import type { PlaywrightOutcome } from "@prisma/client";
import { CheckCircle2, Dices, SkipForward, XCircle } from "lucide-react";

export const RunStatus = (props: { status: PlaywrightOutcome; count?: number }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <div className="flex gap-1 items-center font-medium">
            {renderIcon(props.status)}
            {props.count}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{renderTooltipContent(props.status)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const renderIcon = (status: PlaywrightOutcome) => {
  switch (status) {
    case "expected":
      return <CheckCircle2 className="text-green-600 w-4 h-4" />;

    case "unexpected":
      return <XCircle className="text-red-600 w-4 h-4" />;

    case "flaky":
      return <Dices className="text-orange-600 w-4 h-4" />;

    case "skipped":
      return <SkipForward className="text-stone-600 w-4 h-4" />;
  }
};

const renderTooltipContent = (status: PlaywrightOutcome) => {
  switch (status) {
    case "expected":
      return "Expected";

    case "unexpected":
      return "Unexpected";

    case "flaky":
      return "Flaky";

    case "skipped":
      return "Skipped";
  }
};
