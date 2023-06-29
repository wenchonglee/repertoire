import { cn } from "@/lib/utils";
import { Badge } from "./shadcn/Badge";

const COLORS: Record<number, string> = {
  0: "bg-emerald-600 hover:bg-emerald-700",
  1: "bg-orange-600 hover:bg-orange-700",
  2: "bg-sky-600 hover:bg-sky-700",
  3: "bg-slate-600 hover:bg-slate-700",
  4: "bg-yellow-600 hover:bg-yellow-700",
  5: "bg-pink-600 hover:bg-pink-700",
};

export const ProjectBadge = ({ children }: { children: string }) => {
  return <Badge className={cn("cursor-default", COLORS[hashStringToInt(children)])}>{children}</Badge>;
};

function hashStringToInt(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 8) - hash);
  return Math.abs(hash % 6);
}
