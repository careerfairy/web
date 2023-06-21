import { Application } from "@careerfairy/shared-lib/ats/Application"
import { Candidate } from "@careerfairy/shared-lib/ats/Candidate"
import {
   ATSPaginatedResults,
   ATSPaginationOptions,
   RecruitersFilterOptions,
} from "@careerfairy/shared-lib/ats/Functions"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import { Office } from "@careerfairy/shared-lib/ats/Office"
import { Recruiter } from "@careerfairy/shared-lib/ats/Recruiter"
import {
   SyncStatus,
   SyncStatusTypes,
} from "@careerfairy/shared-lib/ats/SyncStatus"
import {
   MergeAccountTokenResponse,
   MergeApplication,
   MergeAttachment,
   MergeAttachmentModel,
   MergeCandidate,
   MergeDepartment,
   MergeJob,
   MergeLinkTokenResponse,
   MergeMetaEntities,
   MergeMetaResponse,
   MergeOffice,
   MergeRemoteUser,
   MergeSyncStatus,
   MergeUserRole,
} from "@careerfairy/shared-lib/ats/merge/MergeResponseTypes"
import { UserData } from "@careerfairy/shared-lib/users"
import {
   ApplicationCreationOptions,
   AttachmentCreationOptions,
   CandidateCreationOptions,
   IATSRepository,
} from "../IATSRepository"
import {
   SOURCE,
   createMergeAttachmentObject,
   createMergeCandidateFromUser,
   sortJobsDesc,
} from "./MergeATSRepository"

const MAX_NUM_ENTITIES = 1000 // Define the maximum number of entities to fetch

export class MockedMergeATSRepository implements IATSRepository {
   private jobsDb: Record<string, Job>
   private candidatesDb: Record<string, Candidate>
   private applicationsDb: Record<string, Application>

   private syncStatusIndex = 0
   private syncStatusStates = [
      "SYNCING",
      "PAUSED",
      "DONE",
   ] satisfies SyncStatusTypes[]

   private mockSyncStatuses: MergeSyncStatus[] = [
      { model_name: "Activity", model_id: "ActivityID" },
      { model_name: "Application", model_id: "ApplicationID" },
      { model_name: "Attachment", model_id: "AttachmentID" },
      { model_name: "Candidate", model_id: "CandidateID" },
      { model_name: "Department", model_id: "DepartmentID" },
      { model_name: "EmailAddress", model_id: "EmailAddressID" },
      { model_name: "Job", model_id: "JobID" },
      { model_name: "JobInterviewStage", model_id: "JobInterviewStageID" },
   ].map((model) => ({
      ...model,
      last_sync_start: new Date().toISOString(),
      next_sync_start: new Date().toISOString(),
      status: this.syncStatusStates[0],
      is_initial_sync: true,
   }))

   constructor() {
      this.jobsDb = {}
      this.candidatesDb = {}
      this.applicationsDb = {}

      // create mock job #1
      const mergeJob1 = this.createMockMergeJob({
         id: "job1",
         status: "OPEN",
         description: "Job description 1",
      })
      const job1 = Job.createFromMerge(mergeJob1)
      this.jobsDb[job1.id] = job1

      // create mock job #2
      const mergeJob2 = this.createMockMergeJob({
         id: "job2",
         status: "CLOSED",
         description: "Job description 2",
      })
      const job2 = Job.createFromMerge(mergeJob2)
      this.jobsDb[job2.id] = job2

      // create mock candidate
      const mergeCandidate1 = this.createMockMergeCandidate({
         id: "candidate1",
         first_name: "John",
         last_name: "Doe",
      })
      const candidate1 = Candidate.createFromMerge(mergeCandidate1)
      this.candidatesDb[candidate1.id] = candidate1
   }

   private createMockRemoteUser(
      id = "1",
      firstName = "John",
      lastName = "Doe",
      email = "john.doe@example.com",
      role: MergeUserRole = "ADMIN"
   ): MergeRemoteUser {
      return {
         id,
         remote_id: id,
         first_name: firstName,
         last_name: lastName,
         email,
         access_role: role,
         disabled: false,
         remote_created_at: new Date().toISOString(),
      }
   }

   private createMockOffice(
      id = "1",
      name = "Office 1",
      location = "City 1"
   ): MergeOffice {
      return {
         id,
         name,
         location,
      }
   }

   private createMockDepartment(
      id = "1",
      name = "Department 1"
   ): MergeDepartment {
      return {
         id,
         remote_id: id,
         name,
      }
   }

   private createMockMergeJob(overrides: Partial<MergeJob> = {}): MergeJob {
      const defaultJob: MergeJob = {
         id: "1",
         name: "Test Job",
         description: "Job description",
         status: "OPEN",
         hiring_managers: [this.createMockRemoteUser()],
         offices: [this.createMockOffice()],
         recruiters: [this.createMockRemoteUser()],
         departments: [this.createMockDepartment()],
         confidential: false,
         remote_created_at: new Date().toISOString(),
         remote_updated_at: new Date().toISOString(),
      }

      return { ...defaultJob, ...overrides }
   }

   async getJobs(
      options?: ATSPaginationOptions
   ): Promise<ATSPaginatedResults<Job>> {
      const cursor = options?.cursor ? Number(options.cursor) : 1
      const pageSize = options?.pageSize ? Number(options.pageSize) : 7

      // Create mock data
      const mockJobs: MergeJob[] = Array(pageSize + 1)
         .fill(0)
         .map((_, idx) =>
            this.createMockMergeJob({
               id: `${cursor + idx}`,
               name: `Job ${cursor + idx}`,
               description: `Job description ${cursor + idx}`,
            })
         )

      // Convert to job instances and paginate
      const jobs = mockJobs.map(Job.createFromMerge)
      return this.createPaginatedResults(jobs, options, (job) => job.id)
   }

   // private async getAllPages<T>(
   //    getPage: (cursor?: string) => Promise<ATSPaginatedResults<T>>
   // ): Promise<T[]> {
   //    const items: T[] = []
   //    let nextCursor: string | null = "1"

   //    while (nextCursor) {
   //       const page = await getPage(nextCursor)
   //       items.push(...page.results)
   //       nextCursor = page.next
   //    }

   //    return items
   // }

   private async getAllPages<T>(
      getPage: (cursor?: string) => Promise<ATSPaginatedResults<T>>
   ): Promise<T[]> {
      const entities: T[] = []
      let nextCursor: string | null = "1"
      let numEntitiesFetched = 0 // Track the number of entities fetched

      while (nextCursor && numEntitiesFetched < MAX_NUM_ENTITIES) {
         const page = await getPage(nextCursor)
         entities.push(...page.results)
         numEntitiesFetched += page.results.length

         if (numEntitiesFetched >= MAX_NUM_ENTITIES) {
            break // Stop fetching if the maximum number of entities has been reached
         }

         nextCursor = page.next
      }

      return entities
   }

   async getAllJobs(): Promise<Job[]> {
      const jobs = await this.getAllPages<Job>((cursor) =>
         this.getJobs({ cursor })
      )

      return jobs.sort(sortJobsDesc)
   }

   async getJob(id: string): Promise<Job> {
      const mergeJob = this.jobsDb[id]
      return mergeJob ? mergeJob : null
   }

   // private createPaginatedResults<T>(
   //    items: T[],
   //    options?: ATSPaginationOptions
   // ): ATSPaginatedResults<T> {
   //    const pageSize = Number(options?.pageSize ?? 10)

   //    const paginatedResults: ATSPaginatedResults<T> = {
   //       next: items.length > pageSize ? "2" : null,
   //       previous: options?.cursor ? "1" : null,
   //       results: items.slice(0, pageSize),
   //    }

   //    return paginatedResults
   // }

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

   /*
      |--------------------------------------------------------------------------
      | Offices
      |--------------------------------------------------------------------------
      */
   async getOffices(
      options?: ATSPaginationOptions
   ): Promise<ATSPaginatedResults<Office>> {
      const mockOffices: MergeOffice[] = Array(20)
         .fill(0)
         .map((_, idx) => this.createMockOffice(`${idx + 1}`))

      const offices = mockOffices.map(Office.createFromMerge)
      return this.createPaginatedResults(
         offices,
         options,
         (office) => office.id
      )
   }

   private createMockApplication(
      overrides: Partial<MergeApplication> = {}
   ): MergeApplication {
      const defaultApplication: MergeApplication = {
         id: "1",
         remote_id: "1",
         candidate: this.createMockMergeCandidate(),
         job: this.createMockMergeJob(),
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
      }

      return { ...defaultApplication, ...overrides }
   }

   private createMockAttachment(
      overrides: Partial<MergeAttachment> = {}
   ): MergeAttachment {
      const defaultAttachment: MergeAttachment = {
         id: "1",
         remote_id: "1",
         file_name: "Resume.pdf",
         file_url: "https://example.com/resume.pdf",
         candidate: this.createMockMergeCandidate(),
         attachment_type: "RESUME",
      }

      return { ...defaultAttachment, ...overrides }
   }

   private createMockMergeCandidate(
      overrides: Partial<MergeCandidate> = {}
   ): MergeCandidate {
      const defaultCandidate: MergeCandidate = {
         id: "1",
         remote_id: "1",
         first_name: "John",
         last_name: "Doe",
         company: "ABC Company",
         title: "Software Engineer",
         remote_created_at: new Date().toISOString(),
         remote_updated_at: new Date().toISOString(),
         last_interaction_at: new Date().toISOString(),
         is_private: false,
         can_email: true,
         locations: ["New York", "San Francisco"],
         applications: [],
         attachments: [],
         email_addresses: [
            {
               email_address_type: "PERSONAL",
               value: "john@example.com",
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
               value: "https://www.linkedin.com/in/john-doe",
            },
         ],
      }

      return { ...defaultCandidate, ...overrides }
   }

   /*
      |--------------------------------------------------------------------------
      | Candidates
      |--------------------------------------------------------------------------
      */
   async getCandidate(id: string): Promise<Candidate> {
      const mergeCandidate = this.candidatesDb[id]
      return mergeCandidate ? mergeCandidate : null
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
      const newCandidate = this.createMockMergeCandidate({
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
                 this.createMockApplication({
                    id: application.job, // or you can create a random id
                    remote_id: application.job, // or you can create a random id
                    source: SOURCE,
                    // fill in the other fields as necessary
                    // ...
                 })
              )
            : [],
         attachments: model.attachments.map((attachment) =>
            this.createMockAttachment({
               id: attachment, // or you can create a random id
               remote_id: attachment, // or you can create a random id
               // fill in the other fields as necessary
               // ...
            })
         ),
         tags: model.tags,
      })

      // store the new candidate in the mock DB
      this.candidatesDb[newCandidate.id] =
         Candidate.createFromMerge(newCandidate)

      return this.candidatesDb[newCandidate.id]
   }

   async candidateAddCVAttachment(
      candidateId: string,
      user: UserData,
      options: AttachmentCreationOptions = {}
   ) {
      const candidate = await this.getCandidate(candidateId)

      if (!candidate) {
         throw new Error("Candidate not found")
      }
      const model: MergeAttachmentModel = createMergeAttachmentObject(user)

      const newAttatchment = this.createMockAttachment({
         id: "attachment-1",
         remote_id: "remote-1",
         file_name: model.file_name,
         attachment_type: model.attachment_type,
         candidate: this.createMockMergeCandidate(),
         file_url: model.file_url,
      })

      candidate.attachments.push(newAttatchment)

      return newAttatchment.id
   }

   /*
      |--------------------------------------------------------------------------
      | Applications
      |--------------------------------------------------------------------------
      */

   async getApplications(
      options?: ATSPaginationOptions
   ): Promise<ATSPaginatedResults<Application>> {
      const mockApplications: MergeApplication[] = Array(20)
         .fill(0)
         .map((_, idx) =>
            this.createMockApplication({
               id: `${idx + 1}`,
            })
         )

      const applications = mockApplications.map(Application.createFromMerge)

      return this.createPaginatedResults(applications, options, (app) => app.id)
   }

   async createApplication(
      candidateId: string,
      jobId: string,
      _options?: ApplicationCreationOptions
   ): Promise<string> {
      const candidate = await this.getCandidate(candidateId)

      if (!candidate) {
         throw new Error("Candidate not found")
      }

      const job = await this.getJob(jobId)

      if (!job) {
         throw new Error("Job not found")
      }

      const newApplication = this.createMockApplication({
         id: "application-1",
         remote_id: "remote-1",
         candidate: this.createMockMergeCandidate(),
         job: this.createMockMergeJob(),
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

      if (typeof application === "string") {
         // handle the case where application is a string
         throw new Error(
            "Application creation failed with message: " + application
         )
      }

      candidate.applications.push(application as Application & string)

      this.applicationsDb[application.id] = application

      return newApplication.id
   }

   async getApplication(id: string): Promise<Application> {
      const mergeApplication = this.applicationsDb[id]
      return mergeApplication ? mergeApplication : null
   }

   /*
      |--------------------------------------------------------------------------
      | Sync Status & Others
      |--------------------------------------------------------------------------
      */

   async getSyncStatus(): Promise<SyncStatus[]> {
      const status: SyncStatusTypes =
         this.syncStatusStates[this.syncStatusIndex]
      this.syncStatusIndex =
         (this.syncStatusIndex + 1) % this.syncStatusStates.length

      this.mockSyncStatuses = this.mockSyncStatuses.map((model) => ({
         ...model,
         status,
         is_initial_sync: status === "SYNCING",
         last_sync_start: new Date().toISOString(),
         next_sync_start: new Date().toISOString(),
      }))

      return this.mockSyncStatuses.map(SyncStatus.createFromMerge)
   }

   async createLinkToken(
      _endUserOriginId: string,
      _endUserOrganizationName: string,
      _endUserEmailAddress: string,
      _categories: string[] = ["ats"]
   ): Promise<MergeLinkTokenResponse> {
      return {
         link_token: "GkBuD79fY1o6XQxJJGtvn2E1qXGQFsuG9X7XoZPqiX5nZ3kIwKHdwg",
         integration_name: null,
         magic_link_url: null,
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

   // Mock getRecruiters
   async getRecruiters(
      options?: RecruitersFilterOptions
   ): Promise<ATSPaginatedResults<Recruiter>> {
      // Create an array of mocked recruiters
      const recruiters = Array(20)
         .fill(null)
         .map((_, idx) => this.createMockRecruiter({ id: `${idx}` }))

      // Use your custom method to create paginated results
      return this.createPaginatedResults(
         recruiters,
         options,
         (recruiter) => recruiter.id
      )
   }

   // Mock getMetaCreation
   async getMetaCreation(model: MergeMetaEntities): Promise<MergeMetaResponse> {
      // Simulated response, you might want to adjust it to suit your testing needs
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

   private createMockRecruiter(
      overrides: Partial<MergeRemoteUser> = {}
   ): Recruiter {
      const defaultRecruiter: MergeRemoteUser = {
         id: "1",
         remote_id: "1",
         first_name: "John",
         last_name: "Doe",
         email: "john.doe@example.com",
         access_role: "ADMIN",
         disabled: false,
         remote_created_at: new Date().toISOString(),
      }

      return Recruiter.createFromMerge(
         Object.assign(defaultRecruiter, overrides)
      )
   }

   // Mock getAllRecruiters
   async getAllRecruiters(): Promise<Recruiter[]> {
      // Create an array of mocked recruiters
      const users = Array(10)
         .fill(null)
         .map((_, idx) => this.createMockRecruiter({ id: `${idx}` }))

      // Sort and return
      users.sort((a, b) => {
         if (b?.role?.includes("ADMIN")) {
            return 1
         }

         return 0
      })

      return users
   }

   // Mock removeAccount
   async removeAccount(): Promise<any> {
      return { status: "success" }
   }
}
