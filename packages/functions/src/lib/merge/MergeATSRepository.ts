/* eslint-disable camelcase */
import axios, { AxiosError } from "axios"
import {
   MergeAccountTokenResponse,
   MergeApplication,
   MergeApplicationModel,
   MergeAttachment,
   MergeAttachmentModel,
   MergeCandidate,
   MergeCandidateModel,
   MergeExtraRequiredData,
   MergeJob,
   MergeLinkTokenResponse,
   MergeMetaEntities,
   MergeMetaResponse,
   MergeModelResponseWrapper,
   MergeOffice,
   MergePaginatedResponse,
   MergeRemoteUser,
   MergeSyncStatus,
} from "@careerfairy/shared-lib/ats/merge/MergeResponseTypes"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import { Office } from "@careerfairy/shared-lib/ats/Office"
import { SyncStatus } from "@careerfairy/shared-lib/ats/SyncStatus"
import { Application } from "@careerfairy/shared-lib/ats/Application"
import { UserData } from "@careerfairy/shared-lib/users"
import { Candidate } from "@careerfairy/shared-lib/ats/Candidate"
import firebase from "firebase/compat"
import {
   ApplicationCreationOptions,
   AttachmentCreationOptions,
   CandidateCreationOptions,
   IATSRepository,
} from "../IATSRepository"
import {
   ATSPaginatedResults,
   ATSPaginationOptions,
   RecruitersFilterOptions,
} from "@careerfairy/shared-lib/ats/Functions"
import { Recruiter } from "@careerfairy/shared-lib/ats/Recruiter"

export const MERGE_DEFAULT_PAGE_SIZE = "100"
export const SOURCE = "CareerFairy"
export const TEST_CV =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/development%2Fsample.pdf?alt=media&token=37d5f709-29e4-44d9-8400-f35629de64b6"

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
    * @param firestore
    */
   constructor(
      apiKey: string,
      accountToken?: string,
      readonly firestore?: firebase.firestore.Firestore
   ) {
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
   async getJobs(
      options?: ATSPaginationOptions
   ): Promise<ATSPaginatedResults<Job>> {
      const path = this.buildPath("/jobs", {
         expand: "offices,recruiters,hiring_managers,departments",
         status: "OPEN",
         cursor: options?.cursor,
         page_size: options?.pageSize ?? MERGE_DEFAULT_PAGE_SIZE,
      })

      const { data } = await this.axios.get<MergePaginatedResponse<MergeJob>>(
         path
      )

      // Sort by last updated date, in place
      data.results.sort(sortMergeJobsDesc)

      return this.mapPaginatedResults<Job>(data, Job.createFromMerge)
   }

   /**
    * Fetches all open jobs
    *
    * Goes through all pages sequentially
    */
   async getAllJobs(): Promise<Job[]> {
      const jobs = await this.getAllPages<Job>((cursor) =>
         this.getJobs({ cursor })
      )

      return jobs.sort(sortJobsDesc)
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
   async getOffices(
      options?: ATSPaginationOptions
   ): Promise<ATSPaginatedResults<Office>> {
      const path = this.buildPath("/offices", {
         cursor: options?.cursor,
         page_size: options?.pageSize ?? MERGE_DEFAULT_PAGE_SIZE,
      })

      const { data } = await this.axios.get<
         MergePaginatedResponse<MergeOffice>
      >(path)

      return this.mapPaginatedResults(data, Office.createFromMerge)
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

   async createCandidate(
      user: UserData,
      options: CandidateCreationOptions = {}
   ): Promise<Candidate> {
      const model = createMergeCandidateFromUser(user)

      if (options.nestedWriteCV) {
         // @ts-ignore
         model.attachments.push(createMergeAttachmentObject(user))
      }

      // Workable requires this
      // associate the candidate with the job
      // no need to create the application afterwards
      if (options.jobAssociation) {
         model.applications = [
            {
               job: options.jobAssociation.id,
               source: SOURCE,
            },
         ]
      }

      const body = createMergeModelBody(model, options?.extraRequiredData)
      const { data } = await this.axios.post<
         MergeModelResponseWrapper<MergeCandidate>
      >("/candidates", body)

      return Candidate.createFromMerge(data.model)
   }

   async candidateAddCVAttachment(
      candidateId: string,
      user: UserData,
      options: AttachmentCreationOptions = {}
   ) {
      const model: MergeAttachmentModel = createMergeAttachmentObject(user)

      model.candidate = {
         id: candidateId,
      }

      const body = createMergeModelBody(model, options?.extraRequiredData)
      const { data } = await this.axios.post<
         MergeModelResponseWrapper<MergeAttachment>
      >("/attachments", body)

      return data.model.id
   }

   /*
      |--------------------------------------------------------------------------
      | Applications
      |--------------------------------------------------------------------------
      */
   async getApplications(
      options?: ATSApplicationOptions
   ): Promise<ATSPaginatedResults<Application>> {
      const path = this.buildPath("/offices", {
         expand: "candidate,job,current_stage,reject_reason",
         job_id: options.jobId,
         cursor: options?.cursor,
         page_size: options?.pageSize ?? MERGE_DEFAULT_PAGE_SIZE,
      })

      const { data } = await this.axios.get<
         MergePaginatedResponse<MergeApplication>
      >(path)

      return this.mapPaginatedResults(data, Application.createFromMerge)
   }

   async createApplication(
      candidateId: string,
      jobId: string,
      options: ApplicationCreationOptions = {}
   ) {
      const model: MergeApplicationModel = {
         candidate: candidateId,
         job: jobId,
         source: SOURCE,
      }

      const body = createMergeModelBody(model, options?.extraRequiredData)
      const { data } = await this.axios.post<
         MergeModelResponseWrapper<MergeApplicationModel>
      >("/applications", body)

      return data.model.id
   }

   async getApplication(applicationId: string): Promise<Application> {
      const path = this.buildPath(`/applications/${applicationId}`, {
         expand: "candidate,job,current_stage,reject_reason",
      })
      const { data } = await this.axios
         .get<MergeApplication>(path)
         .catch(emptyResponseWhenNotFound)
      return data ? Application.createFromMerge(data) : null
   }

   /*
      |--------------------------------------------------------------------------
      | Sync Status & Others
      |--------------------------------------------------------------------------
      */
   async getSyncStatus(): Promise<SyncStatus[]> {
      const { data } = await this.axios.get<
         MergePaginatedResponse<MergeSyncStatus>
      >("/sync-status")

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
         "https://api.merge.dev/api/integrations/create-link-token",
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
      const { data } = await this.axios.post<any>("/delete-account")

      return data
   }

   /**
    * Maps a Merge paginated response to our Business model type
    * @param results
    * @param mapper
    * @private
    */
   private mapPaginatedResults<T>(
      results: MergePaginatedResponse<unknown>,
      mapper: (model: unknown) => T
   ): ATSPaginatedResults<T> {
      return {
         next: results.next,
         previous: results.previous,
         results: results.results?.map(mapper),
      }
   }

   /**
    * Builds the Merge Path with Query Params
    *
    * Remove falsy params (e.g. optional options that are null)
    * Appends the first slash to the path if it's missing
    * @param path
    * @param queryParams
    * @private
    */
   private buildPath(path: string, queryParams?: object) {
      if (path.charAt(0) !== "/") {
         path = "/" + path
      }

      const qs = new URLSearchParams()

      // remove falsy values from query params
      for (const param in queryParams) {
         if (queryParams[param]) {
            qs.set(param, queryParams[param])
         }
      }

      const qsFinal = qs.toString()

      if (qsFinal.length > 0) {
         return `${path}?${qsFinal}`
      }

      return path
   }

   /**
    * Fetches all Recruiters
    *
    * Goes through all pages sequentially
    */
   async getAllRecruiters(): Promise<Recruiter[]> {
      const users = await this.getAllPages<Recruiter>((cursor) =>
         this.getRecruiters({ cursor })
      )

      // sort in place by Admins desc
      users.sort((a, b) => {
         if (b?.role?.includes("ADMIN")) {
            return 1
         }

         return 0
      })

      return users
   }

   async getRecruiters(
      options?: RecruitersFilterOptions
   ): Promise<ATSPaginatedResults<Recruiter>> {
      const path = this.buildPath("/users", {
         email: options?.email, // filter by email if provided
         cursor: options?.cursor,
         page_size: options?.pageSize ?? MERGE_DEFAULT_PAGE_SIZE,
      })

      const { data } = await this.axios.get<
         MergePaginatedResponse<MergeRemoteUser>
      >(path)

      return this.mapPaginatedResults<Recruiter>(
         data,
         Recruiter.createFromMerge
      )
   }

   /**
    * Get the Meta for a given model
    *
    * Useful for us to build the request programmatically
    * Not exposed int the ATSRepository interface because it's an
    * implementation detail of Merge
    *
    * @param model
    */
   async getMetaCreation(model: MergeMetaEntities): Promise<MergeMetaResponse> {
      const path = this.buildPath(`/${model}/meta/post`)

      const { data } = await this.axios.get<MergeMetaResponse>(path)

      return data
   }

   private async getAllPages<T>(
      pageFetcher: (cursor: string) => Promise<ATSPaginatedResults<T>>
   ) {
      let data: T[] = []
      let cursor: string = null
      let counter = 0

      do {
         try {
            console.log(`Fetching page ${++counter}`)
            const pageResults = await pageFetcher(cursor)

            data = data.concat(pageResults.results)
            cursor = pageResults.next
         } catch (e) {
            console.error(e)
            cursor = null // we don't have a next page to fetch
         }
      } while (cursor !== null)

      console.log(`Total entries: ${data.length}`)

      return data
   }
}

/*
|--------------------------------------------------------------------------
| Utility interfaces
|--------------------------------------------------------------------------
*/

export interface ATSApplicationOptions extends ATSPaginationOptions {
   /**
    * Filter by job id
    */
   jobId?: string
}

export const createMergeCandidateFromUser = (
   user: UserData
): MergeCandidateModel => {
   const model: MergeCandidateModel = {
      first_name: user.firstName,
      last_name: user.lastName,
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
      attachments: [],
   }

   if (user.linkedinUrl) {
      model.urls.push({
         value: user.linkedinUrl,
         url_type: "SOCIAL_MEDIA",
      })
   }

   return model
}

export function createMergeAttachmentObject(
   user: UserData
): MergeAttachmentModel {
   return {
      /**
       * For Greenhouse its required to append the .pdf extension for the
       * Resume Preview functionality to work
       */
      file_name: `Resume - ${user.firstName} ${user.lastName} - CareerFairy.pdf`,
      file_url: getResumeURL(user.userResume),
      attachment_type: "RESUME",
   }
}

export function getResumeURL(resumeUrl: string): string {
   let res = resumeUrl
   // Merge doesn't accept localhost, replace with remote storage
   // merge will try to fetch the file and store in their systems
   // it might fail if the file not accessible
   // this is only used during local development
   if (res.indexOf("http://localhost:9199") !== -1) {
      // use a remote test CV file
      res = TEST_CV
   }

   return res
}

/**
 * There are some requests where we want to return null instead of
 * throwing an error whenever a response status code is 404 (not found)
 *
 * @param e
 */
export const emptyResponseWhenNotFound = (e: AxiosError) => {
   if (e?.response?.status === 404) {
      return {
         data: null,
      }
   }

   throw e
}

interface MergeExtraRequiredData {
   remote_user_id?: string
   // Add more required fields if necessary
}

interface MergeModelBody<T> {
   model: T
   [key: string]: any
}

/**
 * Creates a Merge POST body object
 * It will include the extra required fields (e.g. remote_user_id) if existent
 * @param data The model data
 * @param extraRequiredFields Optional extra required fields
 * @returns The Merge POST body object
 */
export function createMergeModelBody<T>(
   data: T,
   extraRequiredFields?: MergeExtraRequiredData
): MergeModelBody<T> {
   const body: MergeModelBody<T> = {
      model: data,
      ...(extraRequiredFields || {}),
   }

   return body
}

export function sortMergeJobsDesc(a: MergeJob, b: MergeJob) {
   if (!a.remote_updated_at || !b.remote_updated_at) return 0

   const aDate = new Date(a.remote_updated_at)
   const bDate = new Date(b.remote_updated_at)

   return bDate.getTime() - aDate.getTime()
}

export function sortJobsDesc(a: Job, b: Job) {
   if (!a.updatedAt || !b.updatedAt) return 0

   return b.updatedAt?.getTime() - a.updatedAt?.getTime()
}
