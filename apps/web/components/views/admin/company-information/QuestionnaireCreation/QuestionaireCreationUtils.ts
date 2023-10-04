import { GroupQuestion } from "@careerfairy/shared-lib/groups"
import { v4 as uuidv4 } from "uuid"

export const createAGroupQuestion = (): GroupQuestion => {
   const option1 = createAGroupQuestionOption()
   const option2 = createAGroupQuestionOption()

   return {
      id: `temp-${uuidv4()}`,
      name: "",
      options: {
         [option1.id]: option1,
         [option2.id]: option2,
      },
      hidden: false,
      questionType: "custom",
   }
}

export const createAGroupQuestionOption = () => ({ name: "", id: uuidv4() })
