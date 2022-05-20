import { Badge } from "@careerfairy/shared-lib/dist/badges/badges"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"

export type ContextInfoDetail = {
   badgeRequired: Badge
   message: string
   showRequirements: boolean
}

export const My_Recruiters_NoAccess = "My_Recruiters_NoAccess"

export const ContextInfoMap: Record<string, ContextInfoDetail> = {
   [My_Recruiters_NoAccess]: {
      badgeRequired: UserPresenter.saveRecruitersRequiredBadge(),
      message: `To use the My Recruiters feature, you must unlock the <strong>${badgeName(
         UserPresenter.saveRecruitersRequiredBadge()
      )}</strong> first.`,
      showRequirements: true,
   },
}

function badgeName(badge: Badge): string {
   return `${badge.name} Level ${badge.level}`
}

export const careerSkillsLinkWithContext = (
   contextKey: keyof typeof ContextInfoMap
): string => {
   return `/profile/career-skills?contextInfoKey=${contextKey}`
}
