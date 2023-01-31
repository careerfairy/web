import { Office } from "@careerfairy/shared-lib/ats/Office"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import { SyncStatus } from "@careerfairy/shared-lib/ats/SyncStatus"
import { Application } from "@careerfairy/shared-lib/ats/Application"
import { UserData } from "@careerfairy/shared-lib/users"
import { Candidate } from "@careerfairy/shared-lib/ats/Candidate"
import { ATSApplicationOptions } from "./merge/MergeATSRepository"
import {
   ATSPaginatedResults,
   ATSPaginationOptions,
   RecruitersFilterOptions,
} from "@careerfairy/shared-lib/ats/Functions"
import { Recruiter } from "@careerfairy/shared-lib/ats/Recruiter"
import { MergeExtraRequiredData } from "@careerfairy/shared-lib/ats/merge/MergeResponseTypes"

export type CandidateCreationOptions = {
   nestedWriteCV?: boolean
   jobAssociation?: Job
   extraRequiredData?: MergeExtraRequiredData
}

export type AttachmentCreationOptions = {
   extraRequiredData?: MergeExtraRequiredData
}

export type ApplicationCreationOptions = {
   extraRequiredData?: MergeExtraRequiredData
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
