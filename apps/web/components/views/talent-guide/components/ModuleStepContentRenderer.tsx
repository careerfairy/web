import { ModuleStepType } from "data/hygraph/types"
import { QuizBlock, RichTextBlock } from "../blocks"

type RichTextRendererProps = {
   step: ModuleStepType
}

export const ModuleStepContentRenderer = ({ step }: RichTextRendererProps) => {
   if (!step.content) {
      return null
   }

   if (step.content.__typename === "Quiz") {
      return <QuizBlock {...step.content} />
   }

   if (step.content.__typename === "RichTextBlock") {
      return <RichTextBlock {...step.content} />
   }

   // TODO: Add discover companies block here

   console.warn(
      `Unhandled content type: ${
         (step.content as any).__typename
      } returning null`
   )

   return null
}
