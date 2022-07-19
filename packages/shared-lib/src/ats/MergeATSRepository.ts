import { IATSRepository } from "./IATSRepository"
import axios from "axios"
import { Job } from "./Job"
import { Office } from "./Office"

/**
 * Merge.dev HTTP API
 * Docs: https://www.merge.dev/docs/ats/overview/
 */
export class MergeATSRepository implements IATSRepository {
   private readonly axios = axios.create({
      baseURL: "https://api.merge.dev/api/ats/v1",
   })

   /**
    * Create a new instance
    * @param apiKey Merge API key
    * @param accountToken Client (Group) token
    */
   constructor(apiKey: string, accountToken?: string) {
      this.axios.defaults.headers.common["Authorization"] = `Bearer ${apiKey}`

      // not every merge API call requires an account token
      if (accountToken) {
         this.axios.defaults.headers.common["X-Account-Token"] = accountToken
      }
   }

   async getJobs() {
      const { data } = await this.axios.get<MergePaginatedResponse<Job>>(
         `/jobs`
      )

      return data.results
   }

   async getOffices() {
      const { data } = await this.axios.get<MergePaginatedResponse<Office>>(
         `/offices`
      )

      return data.results
   }

   /**
    * Merge specific, create a link token that's associated with a group
    *
    * This will return the token belonging to the group that we should use to interact with
    * the group Linked Accounts
    *
    * @param end_user_origin_id A unique id for the entity that will authenticate and configure their integrations through Merge Link.
    * @param end_user_organization_name
    * @param end_user_email_address
    * @param categories
    */
   async createLinkToken(
      end_user_origin_id: string,
      end_user_organization_name: string,
      end_user_email_address: string,
      categories: string[] = ["ats"]
   ) {
      const { data } = await this.axios.post<MergeLinkTokenResponse>(
         `https://api.merge.dev/api/integrations/create-link-token`,
         {
            end_user_origin_id,
            end_user_organization_name,
            end_user_email_address,
            categories,
         }
      )

      return data
   }

   async exchangeAccountToken(public_token: string) {
      const { data } = await this.axios.get<MergeAccountTokenResponse>(
         `https://api.merge.dev/api/integrations/account-token/${public_token}`
      )

      return data
   }
}

export type MergePaginatedResponse<T> = {
   next: string
   previous: string
   results: T[]
}

export type MergeLinkTokenResponse = {
   link_token: string
   integration_name: string
}

export type MergeAccountTokenResponse = {
   account_token: string
   integration?: {
      name?: string
      image?: string
      square_image?: string
      color?: string
      slug?: string
   }
}
