import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MobileCollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function MobileCollapsibleSection({
  title,
  children,
}: MobileCollapsibleSectionProps) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center justify-between p-2">
        <span className="text-xl font-bold text-[#d2491f]">{title}</span>
        <ChevronDown className="h-5 w-5" />
      </CollapsibleTrigger>
      <CollapsibleContent className="p-2 space-y-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}