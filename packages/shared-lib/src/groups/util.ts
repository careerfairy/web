import { Group, PublicGroup, SerializedGroup, SerializedPublicGroup } from "."
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

export const serializePublicGroup = (
   publicGroup: PublicGroup
): SerializedPublicGroup => {
   if (!publicGroup) {
      return null
   }

   if (publicGroup?.plan) {
      delete publicGroup.plan
   }

   return {
      ...publicGroup,
      ...(publicGroup?.plan
         ? {
              planType: publicGroup?.plan?.type,
              planStartedAtString: publicGroup?.plan?.startedAt
                 ?.toDate()
                 ?.toISOString(),
              planExpiresAtString: publicGroup?.plan?.expiresAt
                 ?.toDate()
                 ?.toISOString(),
           }
         : {}),
   }
}

export const deserializePublicGroup = (
   publicGroup: SerializedPublicGroup,
   fromDate: fromDateFirestoreFn
): PublicGroup => {
   const { planType, planStartedAtString, planExpiresAtString, ...rest } =
      publicGroup
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
