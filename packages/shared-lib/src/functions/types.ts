export type SendNewlyPublishedEventEmailFnArgs = {
   livestreamId: string
   groupId: string
}

export type GetRecommendedEventsFnArgs = {
   limit: number
   bypassCache?: boolean
   referenceLivestreamId?: string
}
