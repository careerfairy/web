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
>

export type UpdateCreatorData = Partial<
   Pick<
      Creator,
      | "firstName"
      | "lastName"
      | "position"
      | "email"
      | "avatarUrl"
      | "roles"
      | "story"
      | "id"
   >
>

export const pickPublicDataFromCreator = (creator: Creator): PublicCreator => {
   return {
      firstName: creator.firstName ?? null,
      lastName: creator.lastName ?? null,
      position: creator.position ?? null,
      avatarUrl: creator.avatarUrl ?? null,
      roles: creator.roles ?? [],
      groupId: creator.groupId ?? null,
      story: creator.story ?? null,
   }
}

const creatorAvatarUrl =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2F8d3176bd-dbd4-4c26-b6ae-a15f2afb6224_Jax.jpeg?alt=media"

export const dummyCreators: Creator[] = [
   {
      id: "1",
      groupId: "group1",
      documentType: "groupCreator",
      firstName: "John",
      lastName: "Doe",
      position: "Software Engineer",
      email: "john.doe@example.com",
      avatarUrl: creatorAvatarUrl,
      linkedInUrl: "https://www.linkedin.com/in/john-doe/",
      story: "Hello, I am John Doe.",
      roles: [CreatorRoles.Spark],
   },
   {
      id: "2",
      groupId: "group1",
      documentType: "groupCreator",
      firstName: "Jane",
      lastName: "Smith",
      position: "Product Manager",
      email: "jane.smith@example.com",
      avatarUrl: creatorAvatarUrl,
      linkedInUrl: "https://www.linkedin.com/in/jane-smith/",
      story: "Hello, I am Jane Smith.",
      roles: [CreatorRoles.Spark, CreatorRoles.Speaker],
   },
   {
      id: "3",
      groupId: "group2",
      documentType: "groupCreator",
      firstName: "Bob",
      lastName: "Brown",
      position: "Data Scientist",
      email: "bob.brown@example.com",
      avatarUrl: creatorAvatarUrl,
      linkedInUrl: "https://www.linkedin.com/in/bob-brown/",
      roles: [CreatorRoles.Speaker],
   },
   {
      id: "4",
      groupId: "group2",
      documentType: "groupCreator",
      firstName: "Alice",
      lastName: "Green",
      position: "UX Designer",
      email: "alice.green@example.com",
      avatarUrl: creatorAvatarUrl,
      roles: [CreatorRoles.Spark],
   },
   {
      id: "5",
      groupId: "group3",
      documentType: "groupCreator",
      firstName: "Charlie",
      lastName: "Black",
      position: "DevOps Engineer",
      email: "charlie.black@example.com",
      avatarUrl: creatorAvatarUrl,
      linkedInUrl: "https://www.linkedin.com/in/charlie-black/",
      story: "Hello, I am Charlie Black.",
      roles: [CreatorRoles.Speaker],
   },
]
