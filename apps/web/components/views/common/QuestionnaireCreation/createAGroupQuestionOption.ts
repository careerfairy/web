import {
   GroupQuestion,
   GroupQuestionOption,
} from "@careerfairy/shared-lib/groups"
import { v4 as uuidv4 } from "uuid"

export const createAGroupQuestionOption = () =>
   ({ name: "", id: uuidv4() } as GroupQuestionOption)
