import { GroupPlanType } from "@careerfairy/shared-lib/groups"
import useGroupsByIds from "../useGroupsByIds"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"

type Result = {
   valid: boolean
}

const useGroupPlanIsValid = (
   groupId: string,
   types?: GroupPlanType[]
): Result => {
   const { data: group } = useGroupsByIds([groupId])

   let valid = false
   if (group.length) {
      const groupPresenter = GroupPresenter.createFromDocument(group.at(0))
      valid = groupPresenter.isPlanValidByTypes(types)
   }

   return { valid: valid }
}

export default useGroupPlanIsValid
