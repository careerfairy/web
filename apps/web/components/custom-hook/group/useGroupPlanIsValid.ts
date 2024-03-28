import useGroupsByIds from "../useGroupsByIds"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
type Result = {
   valid: boolean
}

const useGroupPlanIsValid = (groupId: string): Result => {
   const { data: group } = useGroupsByIds([groupId])

   let valid
   if (!group.length) valid = false
   const groupPresenter = GroupPresenter.createFromDocument(group.at(0))
   valid = !groupPresenter.hasPlanExpired()
   return { valid }
}

export default useGroupPlanIsValid
