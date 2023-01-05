/**
 * Parameters for functions that support pagination
 * e.g. fetchATSJobs
 */
export type ATSDataPaginationOptions = {
   cursor: string | null
   pageSize: string | number | null
}

/**
 * Paginated Results Wrapper
 */
export type ATSPaginatedResults<Model> = {
   next: string | null
   previous: string | null
   results: Model[]
}

/**
 * ATS Pagination Options
 */
export interface ATSPaginationOptions {
   cursor?: string
   pageSize?: string
}

/**
 * ATS Recruiters Options
 */
export interface RecruitersFilterOptions extends ATSPaginationOptions {
   email?: string
}

export type RecruitersFunctionCallOptions = RecruitersFilterOptions & {
   all?: boolean
}
