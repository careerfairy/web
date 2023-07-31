import { Timestamp } from "firebase/firestore"
import { Identifiable } from "../commonTypes"

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
>

export type UpdateCreatorData = Partial<
   Pick<
      Creator,
      | "firstName"
      | "lastName"
      | "position"
      | "avatarUrl"
      | "linkedInUrl"
      | "story"
      | "email"
   >
> &
   Identifiable

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
   }
}
