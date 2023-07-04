export type MergeMetaEntities = "candidates" | "applications" | "attachments"

/**
 * Some integrations require extra data to be sent to the ATS
 */
export type MergeExtraRequiredData = {
   // greenhouse
   remote_user_id?: string
}

/**
 * Integrations that we know and have a custom behaviour
 */
export type MergeATSAccountSlug = "teamtailor" | "greenhouse" | "workable"

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
   | "ADMIN"
   | "TEAM_MEMBER"
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
   status:
      | "DISABLED"
      | "DONE"
      | "FAILED"
      | "PAUSED"
      | "SYNCING"
      | "PARTIALLY_SYNCED" // Merge has failed to sync at least 1 field in this model, but some fields have successfully synced.
   is_initial_sync: boolean
}

export interface MergeModelResponseWrapper<T> {
   model: T
}

/**
 * Candidate response
 */
export interface MergeCandidate {
   id: string
   remote_id: string
   first_name: string
   last_name: string
   company?: string
   title?: string
   remote_created_at?: string
   remote_updated_at?: string
   last_interaction_at?: string
   is_private?: boolean
   can_email?: boolean
   locations?: string[]
   phone_numbers?: MergePhoneNumber[]
   email_addresses?: MergeEmailAddress[]
   urls?: MergeUrl[]
   applications?: MergeApplication[] | string[]
   attachments?: MergeAttachment[]
   tags?: string[]
}

/**
 * Application (expanded)
 */
export interface MergeApplication {
   id: string
   remote_id: string
   candidate?: MergeCandidate
   job?: MergeJob
   applied_at?: string
   rejected_at?: string
   source?: string
   credited_to?: string
   current_stage?: MergeJobInterviewStage
   reject_reason?: MergeRejectReason
}

// creation model
export interface MergeApplicationModel {
   id?: string // will only exist after creating (response)
   candidate: string
   job: string
   applied_at?: string
   rejected_at?: string
   source?: string
   credited_to?: string
   current_stage?: string
   reject_reason?: string
}

export interface MergeJobInterviewStage {
   id: string
   remote_id: string
   name: string
   job: string
}

export interface MergeRejectReason {
   id: string
   remote_id: string
   name: string
}

/**
 * Attachment
 */
export interface MergeAttachment {
   id: string
   remote_id: string
   file_name?: string
   file_url?: string
   candidate?: MergeCandidate
   attachment_type?: attachmentType
}

export type attachmentType =
   | "RESUME"
   | "COVER_LETTER"
   | "OFFER_LETTER"
   | "OTHER"

// model to create / update
export interface MergeAttachmentModel {
   file_name?: string
   file_url?: string
   candidate?: string | { id: string }
   attachment_type: attachmentType
}

export interface MergePhoneNumber {
   value: string
   phone_number_type: "HOME" | "WORK" | "MOBILE" | "SKYPE" | "OTHER"
}

export interface MergeEmailAddress {
   value: string
   email_address_type: "PERSONAL" | "WORK" | "OTHER"
}

export interface MergeUrl {
   value: string
   url_type:
      | "PERSONAL"
      | "COMPANY"
      | "PORTFOLIO"
      | "BLOG"
      | "SOCIAL_MEDIA"
      | "OTHER"
}

/**
 * Model used to create a Candidate
 * Request body model object
 */
export interface MergeCandidateModel {
   remote_id?: string
   first_name?: string
   last_name?: string
   company?: string
   title?: string
   attachments: string[] | MergeAttachmentModel[]
   applications?: MergeCandidateApplications[]
   tags: string[]
   urls: MergeUrl[]
   email_addresses: MergeEmailAddress[]
   phone_numbers: MergePhoneNumber[]
   locations?: string[]
}

export interface MergeCandidateApplications {
   job: string
   source?: string
}

// https://docs.merge.dev/ats/candidates/#candidates_meta_post_retrieve
export interface MergeMetaResponse {
   request_schema: MergeRequestSchema
   status: {
      linked_account_status: string
      can_make_request: boolean
   }
   has_conditional_params: boolean
   has_required_linked_account_params: boolean
}

interface MergeRequestSchema {
   type: "object" | "array" | "string" | "any"
   title?: string
   description?: string
   required: string[]
   format?: "date-time" | "uuid"
   items?: MergeRequestSchema
   properties: { [index: string]: MergeRequestSchema } // recursive
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
   integration_name: string | null
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

export type MergeRemoveAccountResponse = {
   status: string
}
