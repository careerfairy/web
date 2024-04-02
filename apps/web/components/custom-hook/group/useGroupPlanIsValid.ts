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

   let valid
   if (!group.length) valid = false
   const groupPresenter = GroupPresenter.createFromDocument(group.at(0))

   valid = !groupPresenter.hasPlanExpired()
   if (!types?.length) return { valid }
   const hasType = types.includes(groupPresenter.plan?.type)

   return { valid: valid && hasType }
}

export default useGroupPlanIsValid
