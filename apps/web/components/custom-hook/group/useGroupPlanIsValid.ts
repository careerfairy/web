import useSWR from "swr"
import { useCallback } from "react"
import { Group, GroupPlanType } from "@careerfairy/shared-lib/groups"
import { groupRepo } from "data/RepositoryInstances"

type Result = {
   valid: boolean
}

const useGroupPlanIsValid = (
   groupId: string,
   types: GroupPlanType[]
): Result => {
   const groupFetcher = useCallback(
      (groupId) => groupRepo.getGroupById(groupId),
      []
   )

   const { data: group } = useSWR<Group>(groupId, groupFetcher, {
      suspense: true,
   })

   const now = new Date()
   let valid = false

   if (
      types.includes(group?.plan?.type) &&
      group?.plan?.expiresAt?.toDate() > now
   )
      valid = true

   return { valid }
}

export default useGroupPlanIsValid
