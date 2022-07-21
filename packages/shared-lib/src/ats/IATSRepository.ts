import { Office } from "./Office"
import { Job } from "./Job"
import { SyncStatus } from "./SyncStatus"

export interface IATSRepository {
   getJobs(): Promise<Job[]>
   getOffices(): Promise<Office[]>
   getSyncStatus(): Promise<SyncStatus[]>
}
