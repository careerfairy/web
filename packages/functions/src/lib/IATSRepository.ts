import { Office } from "@careerfairy/shared-lib/dist/ats/Office"
import { Job } from "@careerfairy/shared-lib/dist/ats/Job"
import { SyncStatus } from "@careerfairy/shared-lib/dist/ats/SyncStatus"
import { Application } from "@careerfairy/shared-lib/dist/ats/Application"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { Candidate } from "@careerfairy/shared-lib/dist/ats/Candidate"
import {
   ATSApplicationOptions,
   ATSPaginationOptions,
} from "./merge/MergeATSRepository"
import { ATSPaginatedResults } from "@careerfairy/shared-lib/dist/ats/Functions"
import { Recruiter } from "@careerfairy/shared-lib/dist/ats/Recruiter"

export type CandidateCreationOptions = {
   nestedWriteCV?: boolean
   jobAssociation?: Job
   remoteUserId?: string
}

export type AttachmentCreationOptions = {
   remoteUserId?: string
}

export type ApplicationCreationOptions = {
   remoteUserId?: string
}

export interface RecruitersFilterOptions extends ATSPaginationOptions {
   email?: string
}

export interface IATSRepository {
   getJobs(options?: ATSPaginationOptions): Promise<ATSPaginatedResults<Job>>

   getAllJobs(): Promise<Job[]>

   getRecruiters(
      options?: RecruitersFilterOptions
   ): Promise<ATSPaginatedResults<Recruiter>>

   getAllRecruiters(): Promise<Recruiter[]>

   getJob(id: string): Promise<Job>

   getOffices(
      options?: ATSPaginationOptions
   ): Promise<ATSPaginatedResults<Office>>

   getCandidate(id: string): Promise<Candidate>

   createCandidate(
      user: UserData,
      options?: CandidateCreationOptions
   ): Promise<Candidate>

   getApplications(
      options?: ATSApplicationOptions
   ): Promise<ATSPaginatedResults<Application>>

   getSyncStatus(): Promise<SyncStatus[]>

   candidateAddCVAttachment(
      candidateId: string,
      user: UserData,
      options?: AttachmentCreationOptions
   ): Promise<string>

   createApplication(
      candidateId: string,
      jobId: string,
      options?: ApplicationCreationOptions
   ): Promise<string>

   getApplication(applicationId: string): Promise<Application>
}
