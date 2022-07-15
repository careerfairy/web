import { Identifiable } from "../commonTypes"
import firebase from "firebase/compat/app"

// CareerCenterData collection
export interface Group extends Identifiable {
   // required
   groupId: string
   description: string
   logoUrl: string
   adminEmails: string[]
   adminEmail?: string

   // optional
   categories: GroupCategory[]
   extraInfo?: string
   partnerGroupIds?: string[]
   rank?: number
   test?: boolean
   universityCode?: string
   universityId?: string
   universityName?: string
   hidePrivateEventsFromEmbed?: boolean
}

export interface GroupCategory extends Identifiable {
   name: string
   options: GroupOption[]
}

export interface GroupOption extends Identifiable {
   name: string
}

/**
 * Document that lives in /careerCenterData/:id/ats/:integrationId
 * Contains information about the ATS integration for a single linked account
 *
 * When supporting multiple providers (others than merge) just add a new map key
 */
export interface GroupATSAccount extends Identifiable {
   groupId: string
   merge?: {
      end_user_origin_id?: string
      integration_name?: string
      image?: string
      square_image?: string
      color?: string
      slug?: string
      lastFetchedAt?: firebase.firestore.Timestamp
   }
   createdAt: firebase.firestore.Timestamp
   updatedAt: firebase.firestore.Timestamp
}

/**
 * Document that lives in /careerCenterData/:id/ats/:integrationId/tokens/tokens
 * Contains sensitive tokens used to fetch data in the company behalf
 * (in case of merge, it also requires our own api key that's injected to the cloud functions)
 *
 * This data shouldn't be fetched via apps (webapp), only via backends (cloud functions)
 */
export interface GroupATSIntegrationTokens extends Identifiable {
   groupId: string
   integrationId: string
   merge?: {
      account_token?: string
   }
}
