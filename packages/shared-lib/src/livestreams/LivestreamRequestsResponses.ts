import { LivestreamPoll } from "./livestreams"

export type DeleteLivestreamChatEntryRequest = {
   entryId?: string
   deleteAll?: boolean
   agoraUserId: string
   livestreamToken: string | null
   livestreamId: string
}

export type CreateLivestreamPollRequest = {
   livestreamId: string
   livestreamToken: string | null
   question: string
   options: { text: string }[]
}

export type UpdateLivestreamPollRequest = {
   livestreamId: string
   livestreamToken: string | null
   pollId: string
   question?: string
   options?: { text: string; id?: string }[]
   state?: LivestreamPoll["state"]
}

export type DeleteLivestreamPollRequest = {
   livestreamId: string
   livestreamToken: string | null
   pollId: string
}
