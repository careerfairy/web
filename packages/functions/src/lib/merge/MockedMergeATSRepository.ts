import { Application } from "@careerfairy/shared-lib/ats/Application"
import { Candidate } from "@careerfairy/shared-lib/ats/Candidate"
import {
   ATSPaginatedResults,
   ATSPaginationOptions,
} from "@careerfairy/shared-lib/ats/Functions"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import { Office } from "@careerfairy/shared-lib/ats/Office"
import { Recruiter } from "@careerfairy/shared-lib/ats/Recruiter"
import { SyncStatus } from "@careerfairy/shared-lib/ats/SyncStatus"
import {
   MergeAccountTokenResponse,
   MergeApplication,
   MergeAttachment,
   MergeCandidate,
   MergeDepartment,
   MergeJob,
   MergeLinkTokenResponse,
   MergeMetaResponse,
   MergeOffice,
   MergeRemoteUser,
   MergeRemoveAccountResponse,
} from "@careerfairy/shared-lib/ats/merge/MergeResponseTypes"
import { UserData } from "@careerfairy/shared-lib/users"
import { CandidateCreationOptions, IATSRepository } from "../IATSRepository"
import {
   SOURCE,
   createMergeAttachmentObject,
   createMergeCandidateFromUser,
   sortJobsDesc,
   sortRecruitersDesc,
} from "./MergeATSRepository"

export class MockedMergeATSRepository implements IATSRepository {
   /*
      |--------------------------------------------------------------------------
      | Jobs
      |--------------------------------------------------------------------------
      */

   async getJobs(
      options?: ATSPaginationOptions
   ): Promise<ATSPaginatedResults<Job>> {
      return this.createMockDataAndPaginate(
         createMockMergeJob,
         Job.createFromMerge,
         options
      )
   }

   async getAllJobs(): Promise<Job[]> {
      const paginatedJobs = await this.createMockDataAndPaginate(
         createMockMergeJob,
         Job.createFromMerge,
         { cursor: "1", pageSize: "20" }
      )

      return paginatedJobs.results.sort(sortJobsDesc)
   }

   async getJob(id: string): Promise<Job> {
      const mergeJob = createMockMergeJob({ id })
      return Job.createFromMerge(mergeJob)
   }

   /*
      |--------------------------------------------------------------------------
      | Offices
      |--------------------------------------------------------------------------
      */

   async getOffices(
      options?: ATSPaginationOptions
   ): Promise<ATSPaginatedResults<Office>> {
      return this.createMockDataAndPaginate(
         createMockOffice,
         Office.createFromMerge,
         options
      )
   }

   /*
      |--------------------------------------------------------------------------
      | Candidates
      |--------------------------------------------------------------------------
      */
   async getCandidate(id: string): Promise<Candidate> {
      return Candidate.createFromMerge(createMockMergeCandidate({ id }))
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

      // Convert MergeCandidateModel to MergeCandidate using createMockMergeCandidate
      const newCandidate = createMockMergeCandidate({
         id: "1",
         remote_id: model.remote_id || "",
         first_name: model.first_name || "",
         last_name: model.last_name || "",
         company: model.company,
         title: model.title,
         locations: model.locations,
         phone_numbers: model.phone_numbers,
         email_addresses: model.email_addresses,
         urls: model.urls,
         applications: model.applications
            ? model.applications.map((application) =>
                 createMockApplication({
                    id: application.job,
                 })
              )
            : [],
         attachments: model.attachments.map((attachment) =>
            createMockAttachment({
               id: attachment, // or you can create a random id
               remote_id: attachment, // or you can create a random id
               // fill in the other fields as necessary
               // ...
               candidate: createMockMergeCandidate(),
            })
         ),
         tags: model.tags,
      })

      return Candidate.createFromMerge(newCandidate)
   }

   async candidateAddCVAttachment(candidateId: string, user: UserData) {
      return `attatchment-candidate-${candidateId}-user-${user.id}`
   }

   /*
      |--------------------------------------------------------------------------
      | Applications
      |--------------------------------------------------------------------------
      */

   async createApplication(
      candidateId: string,
      jobId: string
   ): Promise<string> {
      const candidate = await this.getCandidate(candidateId)

      const job = await this.getJob(jobId)

      const newApplication = createMockApplication({
         id: "application-1",
         remote_id: "remote-1",
         candidate: createMockMergeCandidate({ id: candidate.id }),
         job: createMockMergeJob({ id: job.id }),
         applied_at: new Date().toISOString(),
         rejected_at: null,
         source: "Job Board",
         credited_to: "John Doe",
         current_stage: {
            id: "1",
            remote_id: "1",
            name: "Interview",
            job: "Software Engineer",
         },
         reject_reason: null,
      })

      const application = Application.createFromMerge(newApplication)

      candidate.applications.push(application as Application & string)

      return newApplication.id
   }

   async getApplication(id: string): Promise<Application> {
      const mergeApplication = createMockApplication({ id })
      return Application.createFromMerge(mergeApplication)
   }

   async getApplications(
      options?: ATSPaginationOptions
   ): Promise<ATSPaginatedResults<Application>> {
      return this.createMockDataAndPaginate(
         createMockApplication,
         Application.createFromMerge,
         options
      )
   }

   /*
      |--------------------------------------------------------------------------
      | Recruiters
      |--------------------------------------------------------------------------
      */

   async getRecruiters(
      options?: ATSPaginationOptions
   ): Promise<ATSPaginatedResults<Recruiter>> {
      return this.createMockDataAndPaginate(
         createMockRecruiter,
         Recruiter.createFromMerge,
         options
      )
   }

   // Mock getAllRecruiters
   async getAllRecruiters(): Promise<Recruiter[]> {
      const paginatedRecruiters = await this.createMockDataAndPaginate(
         createMockRecruiter,
         Recruiter.createFromMerge,
         { cursor: "1", pageSize: "20" }
      )

      return paginatedRecruiters.results.sort(sortRecruitersDesc)
   }

   /*
      |--------------------------------------------------------------------------
      | Sync Status & Others
      |--------------------------------------------------------------------------
      */

   async getSyncStatus(): Promise<SyncStatus[]> {
      return []
   }

   async createLinkToken(): Promise<MergeLinkTokenResponse> {
      return {
         link_token: "mocked_link_token",
         integration_name: null,
      }
   }

   async exchangeAccountToken(
      publicToken: string
   ): Promise<MergeAccountTokenResponse> {
      return {
         account_token: `mocked_account_token_${publicToken}`,
         integration: {
            name: "Greenhouse",
            image: "mocked_image_url",
            square_image: "mocked_square_image_url",
            color: "mocked_color",
            slug: "mocked_slug",
         },
      }
   }

   // Mock getMetaCreation
   async getMetaCreation(): Promise<MergeMetaResponse> {
      return {
         request_schema: {
            type: "object",
            required: [],
            properties: {},
         },
         status: {
            linked_account_status: "linked",
            can_make_request: true,
         },
         has_conditional_params: false,
         has_required_linked_account_params: false,
      }
   }

   async removeAccount(): Promise<MergeRemoveAccountResponse> {
      return { status: "success" }
   }

   /*
      |--------------------------------------------------------------------------
      | Util
      |--------------------------------------------------------------------------
      */

   private async createMockDataAndPaginate<
      T extends Mockable,
      U extends Mockable
   >(
      createMockData: (overrides?: Partial<U>) => U,
      transform: (mock: U) => T,
      options?: ATSPaginationOptions,
      numItems = 10
   ): Promise<ATSPaginatedResults<T>> {
      const cursor = options?.cursor ?? "1"

      // Create mock data
      const mockItems: U[] = Array(Number(options?.pageSize ?? numItems))
         .fill(0)
         .map((_, idx) =>
            createMockData({ id: `${+cursor + idx}` } as Partial<U>)
         )

      // Convert to instances and paginate
      const items = mockItems.map(transform)
      return this.createPaginatedResults(items, options, (item) => item.id)
   }

   private createPaginatedResults<T>(
      items: T[],
      options: ATSPaginationOptions,
      getIdentifier: (item: T) => string
   ): ATSPaginatedResults<T> {
      const pageSize = Number(options.pageSize ?? 10)
      const cursor = options.cursor

      let startIndex = 0
      if (cursor) {
         // Find the start index based on the cursor value
         const startItemIndex = items.findIndex(
            (item) => getIdentifier(item) === cursor
         )
         if (startItemIndex !== -1) {
            startIndex = startItemIndex
         }
      }

      const endIndex = Math.min(startIndex + pageSize, items.length)
      const paginatedResults: ATSPaginatedResults<T> = {
         next:
            endIndex < items.length ? getIdentifier(items[endIndex - 1]) : null,
         previous: startIndex > 0 ? getIdentifier(items[startIndex - 1]) : null,
         results: items.slice(startIndex, endIndex),
      }

      return paginatedResults
   }
}

const createMockApplication = (
   overrides: Partial<MergeApplication> = {}
): MergeApplication => {
   const id = overrides.id ?? "1"
   const defaultApplication: MergeApplication = {
      id: id,
      remote_id: `remote-${id}`,
      candidate: createMockMergeCandidate(),
      job: createMockMergeJob(),
      applied_at: new Date().toISOString(),
      rejected_at: null,
      credited_to: "John Doe",
      current_stage: {
         id: "1",
         remote_id: "1",
         name: "Interview",
         job: "Software Engineer",
      },
      reject_reason: null,
      source: SOURCE,
   }

   return { ...defaultApplication, ...overrides }
}

const createMockAttachment = (
   overrides: Partial<MergeAttachment> = {}
): MergeAttachment => {
   const id = overrides.id ?? "1"
   const defaultAttachment: MergeAttachment = {
      id: id,
      remote_id: `remote-${id}`,
      file_name: "Resume.pdf",
      file_url: "https://example.com/resume.pdf",
      candidate: createMockMergeCandidate(),
      attachment_type: "RESUME",
   }

   return { ...defaultAttachment, ...overrides }
}

const createMockMergeCandidate = (
   overrides: Partial<MergeCandidate> = {}
): MergeCandidate => {
   const id = overrides.id ?? "1"
   const defaultCandidate: MergeCandidate = {
      id: id,
      remote_id: `remote-${id}`,
      first_name: "John",
      last_name: "Doe",
      company: `Test Company ${id}`,
      title: `Software Engineer ${id}`,
      remote_created_at: new Date().toISOString(),
      remote_updated_at: new Date().toISOString(),
      last_interaction_at: new Date().toISOString(),
      is_private: false,
      can_email: true,
      locations: ["Zurich", "Bern"],
      applications: [],
      attachments: [],
      email_addresses: [
         {
            email_address_type: "PERSONAL",
            value: `john-${id}@example.com`,
         },
      ],
      phone_numbers: [
         {
            phone_number_type: "MOBILE",
            value: "1234567890",
         },
      ],
      urls: [
         {
            url_type: "SOCIAL_MEDIA",
            value: `https://www.linkedin.com/in/john-doe-${id}`,
         },
      ],
   }

   return { ...defaultCandidate, ...overrides }
}

const createMockMergeJob = (overrides: Partial<MergeJob> = {}): MergeJob => {
   const id = overrides.id ?? "1"
   const defaultJob: MergeJob = {
      id: id,
      name: `Job ${id}`,
      description: `Job description ${id}`,
      status: "OPEN",
      hiring_managers: [createMockRemoteUser()],
      offices: [createMockOffice()],
      recruiters: [createMockRemoteUser()],
      departments: [createMockDepartment()],
      confidential: false,
      remote_created_at: new Date().toISOString(),
      remote_updated_at: new Date().toISOString(),
   }

   return { ...defaultJob, ...overrides }
}

const createMockRecruiter = (
   overrides: Partial<MergeRemoteUser>
): MergeRemoteUser => {
   const id = overrides.id ?? "1"
   return {
      id,
      remote_id: `remote-${id}`,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      access_role: "ADMIN",
      disabled: false,
      remote_created_at: new Date().toISOString(),
   }
}

const createMockRemoteUser = (
   overrides: Partial<MergeRemoteUser> = {}
): MergeRemoteUser => {
   const id = overrides.id ?? "1"
   return {
      id,
      remote_id: `remote-${id}`,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      access_role: "ADMIN",
      disabled: false,
      remote_created_at: new Date().toISOString(),
      ...overrides,
   }
}

const createMockOffice = (
   overrides: Partial<MergeOffice> = {}
): MergeOffice => {
   const id = overrides.id ?? "1"
   return {
      id,
      name: `Office ${id}`,
      location: `City ${id}`,
      ...overrides,
   }
}

const createMockDepartment = (
   overrides: Partial<MergeDepartment> = {}
): MergeDepartment => {
   const id = overrides.id ?? "1"
   return {
      id,
      remote_id: `remote-${id}`,
      name: `Department ${id}`,
      ...overrides,
   }
}

type Mockable = {
   id: string
}
