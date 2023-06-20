import { Candidate } from "@careerfairy/shared-lib/ats/Candidate"
import {
   ATSPaginatedResults,
   ATSPaginationOptions,
} from "@careerfairy/shared-lib/ats/Functions"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import { Office } from "@careerfairy/shared-lib/ats/Office"
import {
   MergeApplication,
   MergeAttachment,
   MergeCandidate,
   MergeDepartment,
   MergeJob,
   MergeOffice,
   MergeRemoteUser,
   MergeUserRole,
} from "@careerfairy/shared-lib/ats/merge/MergeResponseTypes"
import { CandidateCreationOptions, IATSRepository } from "../IATSRepository"
import {
   SOURCE,
   createMergeCandidateFromUser,
   createMergeModelBody,
   sortJobsDesc,
} from "./MergeATSRepository"
import { UserData } from "@careerfairy/shared-lib/users"

export class MockedMergeATSRepository implements IATSRepository {
   private jobsDb: Record<string, Job>
   private candidatesDb: Record<string, Candidate>

   constructor() {
      this.jobsDb = {}
      this.candidatesDb = {}

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
      // Create mock data
      const mockJobs: MergeJob[] = Array(20) // let's say we have 20 jobs in total
         .fill(0)
         .map((_, idx) => this.createMockMergeJob({ id: `${idx + 1}` }))

      // Convert to job instances and paginate
      const jobs = mockJobs.map(Job.createFromMerge)
      return this.createPaginatedResults(jobs, options)
   }

   private async getAllPages<T>(
      getPage: (cursor?: string) => Promise<ATSPaginatedResults<T>>
   ): Promise<T[]> {
      const items: T[] = []
      let nextCursor: string | null = "1"

      while (nextCursor) {
         const page = await getPage(nextCursor)
         items.push(...page.results)
         nextCursor = page.next
      }

      return items
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

   private createPaginatedResults<T>(
      items: T[],
      options?: ATSPaginationOptions
   ): ATSPaginatedResults<T> {
      const pageSize = Number(options?.pageSize ?? 10)

      const paginatedResults: ATSPaginatedResults<T> = {
         next: items.length > pageSize ? "2" : null,
         previous: options?.cursor ? "1" : null,
         results: items.slice(0, pageSize),
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
      return this.createPaginatedResults(offices, options)
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
         applications: [this.createMockApplication()],
         attachments: [this.createMockAttachment()],
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

   // ...other methods in the IATSRepository interface need to be implemented here as well
}
