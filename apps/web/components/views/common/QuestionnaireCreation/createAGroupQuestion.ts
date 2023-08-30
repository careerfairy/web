import { GroupQuestion } from "@careerfairy/shared-lib/groups"
import { v4 as uuidv4 } from "uuid"
import { createAGroupQuestionOption } from "./createAGroupQuestionOption"

const setQuestionOptions = (question) => {
   for (let i = 0; i < 2; ++i) {
      const newQuestion = createAGroupQuestionOption()
      question.options[newQuestion.id] = { ...newQuestion }
   }
}

export const createAGroupQuestion = () => {
   const newQuestion = {
      id: uuidv4(),
      name: "",
      options: {},
      hidden: false,
      questionType: "custom",
   } as GroupQuestion

   setQuestionOptions(newQuestion)

   return { ...newQuestion }
}
