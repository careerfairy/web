import { GroupPlanType } from "@careerfairy/shared-lib/groups"
import useGroupsByIds from "../useGroupsByIds"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"

type Result = {
   valid: boolean
}

/**
 * Determines whether a given group ID and optionally GroupPlanTypes has a plan which has expired.
 * @param groupId ID of the group whose plan is to be checked for the given types
 * @param types Type of subscription plan
 * @returns {valid: boolean}
 */
const useGroupPlanIsValid = (
   groupId: string,
   types?: GroupPlanType[]
): Result => {
   const { data: group } = useGroupsByIds([groupId])

   let valid
   if (!group.length) valid = false
   const groupPresenter = GroupPresenter.createFromDocument(group.at(0))

   valid = !groupPresenter.hasPlanExpiredByType(types ? types : [])

   return { valid: valid }
}

export default useGroupPlanIsValid
