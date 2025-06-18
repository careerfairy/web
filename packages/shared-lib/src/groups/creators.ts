import { Timestamp } from "firebase/firestore"
import { Identifiable } from "../commonTypes"
import { LivestreamEvent, Speaker } from "../livestreams"
import { Spark } from "../sparks/sparks"

export const CreatorRoles = {
   Spark: "Spark",
   Speaker: "Speaker",
} as const

export type CreatorRole = (typeof CreatorRoles)[keyof typeof CreatorRoles]

/**
 * Collection path: /careerCenterData/[groupId]/creators/[email]
 * Creator is a person who is a member of a group with a specific role:
 * - Spark - A person who is a spark content creator
 * - Speaker - A person who is a speaker in a live stream
 */
export interface Creator extends Identifiable {
   // creator belongs to a group
   groupId: string
   documentType: "groupCreator" // simplify groupCollection Queries

   firstName: string
   lastName: string
   position: string
   email: string
   avatarUrl: string

   createdAt: Timestamp
   updatedAt: Timestamp

   // optional fields
   linkedInUrl?: string
   story?: string

   // user can have multiple roles
   // allows to filter creators if needed
   roles: CreatorRole[]
}

export type PublicCreator = Pick<
   Creator,
   | "firstName"
   | "lastName"
   | "position"
   | "avatarUrl"
   | "roles"
   | "groupId"
   | "story"
   | "id"
   | "linkedInUrl"
   | "documentType"
>

export type AddCreatorData = Pick<
   Creator,
   | "firstName"
   | "lastName"
   | "position"
   | "email"
   | "avatarUrl"
   | "linkedInUrl"
   | "story"
   | "roles"
>

export type UpdateCreatorData = Partial<AddCreatorData> & Identifiable

export const pickPublicDataFromCreator = (creator: Creator): PublicCreator => {
   return {
      firstName: creator.firstName ?? null,
      lastName: creator.lastName ?? null,
      position: creator.position ?? null,
      avatarUrl: creator.avatarUrl ?? null,
      roles: creator.roles ?? [],
      groupId: creator.groupId ?? null,
      story: creator.story ?? null,
      id: creator.id ?? null,
      linkedInUrl: creator.linkedInUrl ?? null,
      documentType: creator.documentType ?? null,
   }
}

export const mapSpeakerToPublicCreator = (speaker: Speaker): PublicCreator => {
   return {
      id: speaker.id,
      groupId: speaker.groupId,
      documentType: "groupCreator",
      firstName: speaker.firstName || null,
      lastName: speaker.lastName || null,
      position: speaker.position || null,
      avatarUrl: speaker.avatar || null,
      linkedInUrl: speaker.linkedInUrl || "",
      story: speaker.background || null,
      roles: speaker.roles || [CreatorRoles.Speaker],
   }
}

export const mapCreatorToSpeaker = (
   creator: Pick<
      Creator,
      | "id"
      | "avatarUrl"
      | "story"
      | "firstName"
      | "lastName"
      | "position"
      | "email"
      | "linkedInUrl"
      | "roles"
      | "groupId"
   >
): Speaker => {
   return {
      id: creator.id,
      avatar: creator.avatarUrl,
      background: creator.story,
      firstName: creator.firstName,
      lastName: creator.lastName,
      position: creator.position,
      linkedInUrl: creator.linkedInUrl,
      roles: creator.roles,
      groupId: creator.groupId,
   }
}

export function transformCreatorNameIntoSlug(
   firstName: string,
   lastName: string
) {
   return `${firstName}-${lastName}`.toLowerCase()
}

export type CreatorPublicContent = {
   livestreams: LivestreamEvent[]
   sparks: Spark[]
   hasJobs: boolean
}

export type CreatorWithContent = Creator & {
   numberOfContent: number
   companyName: string
   companyLogoUrl: string
   companyBannerUrl: string
}
