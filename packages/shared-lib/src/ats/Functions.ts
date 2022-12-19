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
