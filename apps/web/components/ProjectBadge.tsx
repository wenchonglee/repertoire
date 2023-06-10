import { Badge } from "./Badge";

const COLORS: Record<number, string> = {
  0: "bg-emerald-600",
  1: "bg-orange-600",
  2: "bg-sky-600",
  3: "bg-slate-600",
  4: "bg-yellow-600",
  5: "bg-pink-600",
};

export const ProjectBadge = ({ children }: { children: string }) => {
  return <Badge className={COLORS[hashStringToInt(children)]}>{children}</Badge>;
};

function hashStringToInt(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 8) - hash);
  return Math.abs(hash % 6);
}
