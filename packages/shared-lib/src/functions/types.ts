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
      universities: string[]
      fieldsOfStudy: string[]
   }
}
