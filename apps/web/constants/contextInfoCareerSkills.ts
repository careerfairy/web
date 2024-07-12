import { Badge } from "@careerfairy/shared-lib/badges/badges"
import UserPresenter from "@careerfairy/shared-lib/users/UserPresenter"
import { timeoutDuration } from "../components/custom-hook/useCanWatchHighlights"
import { convertMillisecondsToTime } from "../util/CommonUtil"

export type ContextInfoDetail = {
   badgeRequired: Badge
   message: string
   showRequirements: boolean
   noAccessViewTitle: string
}

export const My_Recruiters_NoAccess = "My_Recruiters_NoAccess"
export const Highlights_NoAccess = "Highlights_NoAccess"

export const ContextInfoMap: Record<string, ContextInfoDetail> = {
   [My_Recruiters_NoAccess]: {
      badgeRequired: UserPresenter.saveRecruitersRequiredBadge(),
      message: `To use the My Recruiters feature, you must unlock the <strong>${badgeName(
         UserPresenter.saveRecruitersRequiredBadge()
      )}</strong> first.`,
      showRequirements: true,
      noAccessViewTitle: "Oops! You don't have access to this feature yet...",
   },
   [Highlights_NoAccess]: {
      badgeRequired: UserPresenter.watchAllHighlightsRequiredBadge(),
      message: `To use the Highlights feature, you must unlock the <strong>${badgeName(
         UserPresenter.watchAllHighlightsRequiredBadge()
      )}</strong> first.`,
      showRequirements: true,
      noAccessViewTitle: `You can only watch highlights once every ${convertMillisecondsToTime(
         timeoutDuration
      )}`,
   },
}

export function badgeName(badge: Badge): string {
   return `${badge.name} Level ${badge.level}`
}

export const careerSkillsLinkWithContext = (
   contextKey: keyof typeof ContextInfoMap
): string => {
   return `/profile/career-skills?contextInfoKey=${contextKey}`
}
