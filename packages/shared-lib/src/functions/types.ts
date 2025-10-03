import { UTMParams } from "../commonTypes"
import { OfflineEventStatsAction } from "../offline-events/offline-events"
import { UserData } from "../users"

export type SendNewlyPublishedEventEmailFnArgs = {
   livestreamId: string
   groupId: string
}

export type GetRecommendedEventsFnArgs = {
   limit: number
   bypassCache?: boolean
   referenceLivestreamId?: string
}

export type GetRecommendedJobsFnArgs = {
   limit: number
   bypassCache?: boolean
   referenceJobId?: string
   userAuthId?: string
   userCountryCode?: string
}

export type GetGroupTalentEngagementFnArgs = {
   groupId: string
   targeting: {
      countries: string[]
      universities: Array<{
         id: string
         name: string
         country: string
      }>
      fieldsOfStudy: string[]
   }
}

export type GetGroupTalentEngagementFnResponse = {
   count: number
}

export type GetTotalUsersMatchingTargetingResponse = {
   total: number
}

export type DeleteLivestreamRequest = {
   livestreamId: string
   collection: "livestreams" | "draftLivestreams"
   groupId: string
}

export type TrackOfflineEventActionRequest = {
   offlineEventId: string
   actionType: OfflineEventStatsAction
   utm: UTMParams | null
   userData?: UserData // Optional for anonymous users
   fingerprint?: string // For anonymous user tracking
}
