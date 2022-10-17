import { Office } from "./Office"
import { Job } from "./Job"
import { SyncStatus } from "./SyncStatus"
import { Application } from "./Application"
import { UserData } from "../users"
import { Candidate } from "./Candidate"

export type CandidateCreationOptions = {
   nestedWriteCV?: boolean
   jobAssociation?: Job
}

export interface IATSRepository {
   getJobs(): Promise<Job[]>
   getJob(id: string): Promise<Job>
   getOffices(): Promise<Office[]>
   getCandidate(id: string): Promise<Candidate>
   createCandidate(
      user: UserData,
      options?: CandidateCreationOptions
   ): Promise<Candidate>
   getApplications(jobId?: string): Promise<Application[]>
   getSyncStatus(): Promise<SyncStatus[]>
   candidateAddCVAttachment(
      candidateId: string,
      user: UserData
   ): Promise<string>
   createApplication(candidateId: string, jobId: string): Promise<string>
   getApplication(applicationId: string): Promise<Application>
}
