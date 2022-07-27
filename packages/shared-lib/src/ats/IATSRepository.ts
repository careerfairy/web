import { Office } from "./Office"
import { Job } from "./Job"
import { SyncStatus } from "./SyncStatus"
import { Application } from "./Application"

export interface IATSRepository {
   getJobs(): Promise<Job[]>
   getOffices(): Promise<Office[]>
   getApplications(jobId?: string): Promise<Application[]>
   getSyncStatus(): Promise<SyncStatus[]>
}
