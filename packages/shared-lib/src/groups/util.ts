import { Group, SerializedGroup } from "."
import { fromDateFirestoreFn } from "../firebaseTypes"

export const serializeGroup = (group: Group): SerializedGroup => {
   const { plan, ...rest } = group
   return {
      ...rest,
      planType: plan?.type ?? null,
      planStartedAtString: plan?.startedAt?.toDate().toISOString() ?? null,
      planExpiresAtString: plan?.expiresAt?.toDate().toISOString() ?? null,
   }
}

export const deserializeGroup = (
   group: SerializedGroup,
   fromDate: fromDateFirestoreFn
): Group => {
   const { planType, planStartedAtString, planExpiresAtString, ...rest } = group

   return {
      ...rest,
      plan: planType
         ? {
              type: planType,
              startedAt: planStartedAtString
                 ? fromDate(new Date(planStartedAtString))
                 : null,
              expiresAt: planExpiresAtString
                 ? fromDate(new Date(planExpiresAtString))
                 : null,
           }
         : null,
   }
}
