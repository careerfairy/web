import { GroupQuestion } from "@careerfairy/shared-lib/groups"
import { v4 as uuidv4 } from "uuid"

const newQuestion = {
   id: uuidv4(),
   name: "",
   options: {},
   hidden: false,
   questionType: "custom",
} as GroupQuestion

const setQuestionOptions = (question) => {
   for (let i = 0; i < 2; ++i) {
      const newQuestion = createAGroupQuestionOption()
      question.options[newQuestion.id] = { ...newQuestion }
   }
}

export const createAGroupQuestion = () => {
   setQuestionOptions(newQuestion)
   return { ...newQuestion }
}

export const createAGroupQuestionOption = () => ({ name: "", id: uuidv4() })
