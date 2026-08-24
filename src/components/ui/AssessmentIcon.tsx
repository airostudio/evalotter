import {
  Brain,
  GitBranch,
  Sparkles,
  MessageSquare,
  Hand,
  HeartHandshake,
  Calculator,
  Box,
  BookOpen,
  Palette,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  brain: Brain,
  "git-branch": GitBranch,
  sparkles: Sparkles,
  "message-square": MessageSquare,
  hand: Hand,
  "heart-handshake": HeartHandshake,
  calculator: Calculator,
  box: Box,
  "book-open": BookOpen,
  palette: Palette,
};

export function AssessmentIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICONS[icon] ?? Brain;
  return <Icon className={className} />;
}
