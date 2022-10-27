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
   MergeModelResponseWrapper,
   MergeOffice,
   MergePaginatedResponse,
   MergeSyncStatus,
} from "./MergeResponseTypes"
import {
   ApplicationCreationOptions,
   AttachmentCreationOptions,
   CandidateCreationOptions,
   IATSRepository,
} from "./IATSRepository"
import { Job } from "./Job"
import { Office } from "./Office"
import { SyncStatus } from "./SyncStatus"
import { Application } from "./Application"
import { UserData } from "../users"
import { Candidate } from "./Candidate"
import {
   clearFirebaseCache,
   fromFirebaseCache,
} from "./MergeFirebaseCacheDecorators"
import firebase from "firebase/compat"

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
   @fromFirebaseCache(2 * 60 * 1000) // 2min cache
   async getJobs(): Promise<Job[]> {
      const { data } = await this.axios.get<MergePaginatedResponse<MergeJob>>(
         `/jobs?expand=offices,recruiters,hiring_managers,departments&status=OPEN&page_size=100`
      )

      // Sort by last updated date, in place
      data.results.sort((a, b) => {
         if (!a.remote_updated_at || !b.remote_updated_at) return 0

         const aDate = new Date(a.remote_updated_at)
         const bDate = new Date(b.remote_created_at)

         return bDate.getTime() - aDate.getTime()
      })

      return data.results.map(Job.createFromMerge)
   }

   @fromFirebaseCache()
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
   @fromFirebaseCache()
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
   @fromFirebaseCache()
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
            },
         ]
      }

      const body = createMergeModelBody(model, options.remoteUserId)
      const { data } = await this.axios.post<
         MergeModelResponseWrapper<MergeCandidate>
      >(`/candidates`, body)

      return Candidate.createFromMerge(data.model)
   }

   @clearFirebaseCache(["getCandidate", "getApplications", "getApplication"])
   async candidateAddCVAttachment(
      candidateId: string,
      user: UserData,
      options: AttachmentCreationOptions = {}
   ) {
      const model: MergeAttachmentModel = createMergeAttachmentObject(user)

      model.candidate = {
         id: candidateId,
      }

      const body = createMergeModelBody(model, options.remoteUserId)
      const { data } = await this.axios.post<
         MergeModelResponseWrapper<MergeAttachment>
      >(`/attachments`, body)

      return data.model.id
   }

   /*
  |--------------------------------------------------------------------------
  | Applications
  |--------------------------------------------------------------------------
  */
   @fromFirebaseCache(60 * 1000) // 1min cache
   async getApplications(jobId?: string): Promise<Application[]> {
      const qs = new URLSearchParams({
         expand: "candidate,job,current_stage,reject_reason",
      })

      if (jobId) {
         qs.append("job_id", jobId)
      }

      const { data } = await this.axios.get<
         MergePaginatedResponse<MergeApplication>
      >(`/applications?${qs.toString()}`)

      return data.results.map(Application.createFromMerge)
   }

   @clearFirebaseCache(["getApplications"])
   async createApplication(
      candidateId: string,
      jobId: string,
      options: ApplicationCreationOptions = {}
   ) {
      const model: MergeApplicationModel = {
         candidate: candidateId,
         job: jobId,
         source: "CareerFairy",
      }

      const body = createMergeModelBody(model, options.remoteUserId)
      const { data } = await this.axios.post<
         MergeModelResponseWrapper<MergeApplicationModel>
      >(`/applications`, body)

      return data.model.id
   }

   @fromFirebaseCache()
   async getApplication(applicationId: string): Promise<Application> {
      const qs = new URLSearchParams({
         expand: "candidate,job,current_stage,reject_reason",
      })
      const { data } = await this.axios
         .get<MergeApplication>(
            `/applications/${applicationId}?${qs.toString()}`
         )
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

function createMergeAttachmentObject(user: UserData): MergeAttachmentModel {
   return {
      file_name: "Resume - CareerFairy",
      file_url: getResumeURL(user.userResume),
      attachment_type: "RESUME",
   }
}

function getResumeURL(resumeUrl: string): string {
   let res = resumeUrl
   // Merge doesn't accept localhost, replace with remote storage
   // merge will try to fetch the file and store in their systems
   // it might fail if the file not accessible
   // this is only used during local development
   if (res.indexOf("http://localhost:9199") !== -1) {
      // use a remote test CV file
      res =
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/development%2Fsample.pdf?alt=media&token=37d5f709-29e4-44d9-8400-f35629de64b6"
   }

   return res
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

/**
 * Creates a Merge POST body object
 * It will include the remote_user_id if existent
 * @param data
 * @param remoteUserId
 */
function createMergeModelBody(data: any, remoteUserId) {
   const body: any = {
      model: data,
   }

   if (remoteUserId) {
      body.remote_user_id = remoteUserId
   }

   return body
}
