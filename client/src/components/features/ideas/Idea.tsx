import { IdeaCard } from "../../layout/ideas/IdeaCard.tsx";
import { IdeaType } from "../../../types/idea.types.ts";

export const Idea = ({ idea }: { idea: IdeaType }) => {
  const progressPercentage = Math.min(
    (idea.alreadyCollected / idea.targetAmount) * 100,
    100,
  );

  return <IdeaCard idea={idea} progressPercentage={progressPercentage} />;
};
