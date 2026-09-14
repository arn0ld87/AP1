import type { TaskVisual as TaskVisualData } from "@/lib/ap1-tasks";

import { ErDiagram } from "./ErDiagram";
import { GanttChart } from "./GanttChart";
import { LearningIllustration } from "./LearningIllustration";
import { NetzplanDiagram } from "./NetzplanDiagram";

export function TaskVisual({ visual }: { visual: TaskVisualData }) {
  if (visual.type === "er") return <ErDiagram data={visual.data} alt={visual.alt} />;
  if (visual.type === "netzplan") return <NetzplanDiagram data={visual.data} alt={visual.alt} />;
  if (visual.type === "gantt") return <GanttChart data={visual.data} alt={visual.alt} />;
  if ("src" in visual) {
    return (
      <img
        src={visual.src}
        alt={visual.alt}
        className="w-full rounded-xl border border-border object-cover"
        loading="lazy"
      />
    );
  }
  return <LearningIllustration kind={visual.data.kind} alt={visual.alt} />;
}
