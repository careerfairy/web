import axios, { AxiosError } from "axios"
import {
   MergeAccountTokenResponse,
   MergeApplication,
   MergeApplicationModel,
   MergeAttachment,
   MergeAttachmentModel,
   MergeCandidate,
   MergeCandidateModel,
   MergeJob,
   MergeLinkTokenResponse,
   MergeOffice,
   MergePaginatedResponse,
   MergeSyncStatus,
} from "./MergeResponseTypes"
import { IATSRepository } from "./IATSRepository"
import { Job } from "./Job"
import { Office } from "./Office"
import { SyncStatus } from "./SyncStatus"
import { Application } from "./Application"
import { UserData } from "../users"
import { Candidate } from "./Candidate"

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

   /*
   |--------------------------------------------------------------------------
   | Jobs
   |--------------------------------------------------------------------------
   */
   async getJobs(): Promise<Job[]> {
      const { data } = await this.axios.get<MergePaginatedResponse<MergeJob>>(
         `/jobs?expand=offices,recruiters,hiring_managers,departments`
      )

      return data.results.map(Job.createFromMerge)
   }

   async getJob(id: string): Promise<Job> {
      const { data } = await this.axios
         .get<MergeJob>(`/jobs/${id}`)
         .catch(emptyResponseWhenNotFound)

      return data ? Job.createFromMerge(data) : null
   }

   /*
   |--------------------------------------------------------------------------
   | Offices
   |--------------------------------------------------------------------------
   */

   async getOffices(): Promise<Office[]> {
      const { data } = await this.axios.get<
         MergePaginatedResponse<MergeOffice>
      >(`/offices`)

      return data.results.map(Office.createFromMerge)
   }

   /*
   |--------------------------------------------------------------------------
   | Candidates
   |--------------------------------------------------------------------------
   */
   async getCandidate(id: string): Promise<Candidate> {
      const { data } = await this.axios
         .get<MergeCandidate>(
            `/candidates/${id}?expand=applications,attachments`
         )
         .catch(emptyResponseWhenNotFound)

      return data ? Candidate.createFromMerge(data) : null
   }

   async createCandidate(user: UserData): Promise<Candidate> {
      const model = createMergeCandidateFromUser(user)
      const { data } = await this.axios.post<MergeCandidate>(
         `/candidates`,
         model
      )

      return Candidate.createFromMerge(data)
   }

   async candidateAddCVAttachment(candidateId: string, cvUrl: string) {
      const model: MergeAttachmentModel = {
         file_name: "Resume - CareerFairy",
         file_url: cvUrl,
         candidate: candidateId,
         attachment_type: "RESUME",
      }
      const { data } = await this.axios.post<MergeAttachment>(
         `/attachments`,
         model
      )

      return data.id
   }

   /*
   |--------------------------------------------------------------------------
   | Applications
   |--------------------------------------------------------------------------
   */
   async getApplications(jobId?: string): Promise<Application[]> {
      const qs = new URLSearchParams({
         expand: "candidate,job",
      })

      if (jobId) {
         qs.append("job_id", jobId)
      }

      const { data } = await this.axios.get<
         MergePaginatedResponse<MergeApplication>
      >(`/applications?${qs.toString()}`)

      return data.results.map(Application.createFromMerge)
   }

   async createApplication(candidateId: string, jobId: string) {
      const model: MergeApplicationModel = {
         candidate: candidateId,
         job: jobId,
         source: "CareerFairy",
      }
      const { data } = await this.axios.post<MergeApplicationModel>(
         `/applications`,
         model
      )

      return data.id
   }

   async getApplication(applicationId: string): Promise<Application> {
      const { data } = await this.axios.get<MergeApplication>(
         `/applications/${applicationId}?expand=job,candidate`
      )

      return Application.createFromMerge(data)
   }

   /*
   |--------------------------------------------------------------------------
   | Sync Status & Others
   |--------------------------------------------------------------------------
   */
   async getSyncStatus(): Promise<SyncStatus[]> {
      const { data } = await this.axios.get<
         MergePaginatedResponse<MergeSyncStatus>
      >(`/sync-status`)

      return data.results.map(SyncStatus.createFromMerge)
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

   async removeAccount() {
      const { data } = await this.axios.post<any>(`/delete-account`)

      return data
   }
}

const createMergeCandidateFromUser = (user: UserData): MergeCandidateModel => {
   const model: MergeCandidateModel = {
      first_name: user.firstName,
      last_name: user.lastName,
      attachments: [],
      applications: [],
      tags: ["CareerFairy"],
      urls: [],
      email_addresses: [
         {
            value: user.userEmail,
            email_address_type: "PERSONAL",
         },
      ],
      phone_numbers: [],
   }

   if (user.linkedinUrl) {
      model.urls.push({
         value: user.linkedinUrl,
         url_type: "SOCIAL_MEDIA",
      })
   }

   return model
}

/**
 * There are some requests where we want to return null instead of
 * throwing an error whenever a response status code is 404 (not found)
 *
 * @param e
 */
const emptyResponseWhenNotFound = (e: AxiosError) => {
   if (e?.response?.status === 404) {
      return {
         data: null,
      }
   }

   throw e
}
