/**
 * Job type
 * https://www.merge.dev/docs/ats/jobs/#jobs-object
 */
export interface MergeJob {
   id: string
   status?: JobStatus
   description?: string
   name?: string
   hiring_managers: MergeRemoteUser[]
   offices: MergeOffice[]
   recruiters: MergeRemoteUser[]
   departments: MergeDepartment[]
   confidential?: boolean
   remote_created_at?: string
   remote_updated_at?: string
}

export type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | "ARCHIVED" | "PENDING"

/**
 * Office type
 * https://www.merge.dev/docs/ats/offices/#offices-object
 */
export interface MergeOffice {
   id: string
   name?: string
   location?: string
}

/**
 * Remote User
 * https://www.merge.dev/docs/ats/users/#users-object
 */
export interface MergeRemoteUser {
   id: string
   remote_id: string
   first_name?: string
   last_name?: string
   email?: string
   access_role?: MergeUserRole
   disabled?: boolean
   remote_created_at?: string
}

export type MergeUserRole =
   | "SUPER_ADMIN"
   | "ADMIN TEAM_MEMBER"
   | "LIMITED_TEAM_MEMBER"
   | "INTERVIEWER"

/**
 * Department
 * https://www.merge.dev/docs/ats/departments/#departments-object
 */
export interface MergeDepartment {
   id: string
   remote_id: string
   name?: string
}

/**
 * Sync Status response
 * https://www.merge.dev/docs/ats/sync-status/
 */
export interface MergeSyncStatus {
   model_name: string
   model_id: string
   last_sync_start: string
   next_sync_start: string
   status: "DISABLED" | "DONE" | "FAILED" | "PAUSED" | "SYNCING"
   is_initial_sync: boolean
}

/*
|--------------------------------------------------------------------------
| API Response Wrappers
|--------------------------------------------------------------------------
*/
export type MergePaginatedResponse<T> = {
   /**
    * Next cursor id
    */
   next: string

   /**
    * Previous cursor id
    */
   previous: string
   results: T[]
}

export type MergeLinkTokenResponse = {
   link_token: string
   integration_name: string
}

export type MergeAccountTokenResponse = {
   account_token: string
   integration?: {
      name?: string
      image?: string
      square_image?: string
      color?: string
      slug?: string
   }
}
