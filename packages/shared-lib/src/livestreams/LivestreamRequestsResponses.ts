import { LivestreamPoll, Speaker } from "./livestreams"

export type DeleteLivestreamChatEntryRequest = {
   entryId?: string
   deleteAll?: boolean
   agoraUserId: string
   livestreamToken: string | null
   livestreamId: string
}

export type CreateLivestreamPollRequest = {
   livestreamId: string
   livestreamToken: string
   question: string
   options: { text: string }[]
}

export type UpdateLivestreamPollRequest = {
   livestreamId: string
   livestreamToken: string
   pollId: string
   question?: string
   options?: { text: string; id?: string }[]
   state?: LivestreamPoll["state"]
}

export type DeleteLivestreamPollRequest = {
   livestreamId: string
   livestreamToken: string
   pollId: string
}

export type MarkLivestreamPollAsCurrentRequest = {
   livestreamId: string
   livestreamToken: string
   pollId: string
}

export type MarkLivestreamQuestionAsCurrentRequest = {
   livestreamId: string
   livestreamToken: string | null
   questionId: string
}

export type MarkLivestreamQuestionAsDoneRequest = {
   livestreamId: string
   livestreamToken: string | null
   questionId: string
}

export type ResetLivestreamQuestionRequest = {
   livestreamId: string
   livestreamToken: string
   questionId: string | null
}

export type ToggleHandRaiseRequest = {
   livestreamId: string
   livestreamToken: string
}

export type UpsertSpeakerRequest = {
   livestreamId: string
   livestreamToken: string
   /** If speaker has an id, it will be updated, otherwise it will be created */
   speaker: Speaker & { id?: string }
}

export type CreateLivestreamCTARequest = {
   livestreamId: string
   livestreamToken: string
   message: string
   buttonText: string
   buttonURL: string
}

export type UpdateLivestreamCTARequest = {
   livestreamId: string
   livestreamToken: string
   ctaId: string
   message?: string
   buttonText?: string
   buttonURL?: string
}

export type DeleteLivestreamCTARequest = {
   livestreamId: string
   livestreamToken: string
   ctaId: string
}

export type ToggleActiveCTARequest = {
   livestreamId: string
   livestreamToken: string
   ctaId: string
}
