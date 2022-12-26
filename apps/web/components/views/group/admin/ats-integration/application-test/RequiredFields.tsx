import { MergeMetaResponse } from "@careerfairy/shared-lib/dist/ats/merge/MergeResponseTypes"
import { Recruiter } from "@careerfairy/shared-lib/dist/ats/Recruiter"
import RemoteUserList from "./RemoteUserList"
import { ReactNode } from "react"

// required field => component
export type RequiredComponentsMap = {
   [index: string]: (
      meta: MergeMetaResponse,
      onChange: OnChangeHandler<unknown>,
      disabled?: boolean
   ) => ReactNode
}

export type OnChangeHandler<T> = (value: T) => void

/**
 * This is a map of required fields to their respective components
 */
export const requiredComponents: RequiredComponentsMap = {
   // e.g. Greenhouse requires a remote user when creating a candidate
   remote_user_id: (
      meta: MergeMetaResponse,
      onChange: OnChangeHandler<Recruiter["id"]>,
      disabled?: boolean
   ) => <RemoteUserList meta={meta} onChange={onChange} disabled={disabled} />,
}
