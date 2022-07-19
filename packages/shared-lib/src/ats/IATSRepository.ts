import { Job } from "./Job"
import { Office } from "./Office"

export interface IATSRepository {
   getJobs(): Promise<Job[]>
   getOffices(): Promise<Office[]>
}
