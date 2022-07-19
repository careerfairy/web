/**
 * Job type
 * https://www.merge.dev/docs/ats/jobs/#jobs-object
 */
export interface Job {
   id: string
   status?: JobStatus
   description?: string
   name?: string
   hiring_managers: string[]
   offices: string[]
   recruiters: string[]
   confidential?: boolean
   remote_created_at?: string
   remote_updated_at?: string
}

export type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | "ARCHIVED" | "PENDING"
