import { GroupQuestion } from "@careerfairy/shared-lib/groups"
import { v4 as uuidv4 } from "uuid"

export const createAGroupQuestion = () =>
   ({
      id: uuidv4(),
      name: "",
      options: {},
      hidden: false,
      questionType: "custom",
   } as GroupQuestion)
