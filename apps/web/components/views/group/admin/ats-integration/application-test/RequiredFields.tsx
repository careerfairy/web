import { Recruiter } from "@careerfairy/shared-lib/ats/Recruiter"
import { ReactNode } from "react"
import RemoteUserList from "./RemoteUserList"

// required field => component
export type RequiredComponentsMap = {
   [index: string]: (
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
      onChange: OnChangeHandler<Recruiter["id"]>,
      disabled?: boolean
   ) => <RemoteUserList onChange={onChange} disabled={disabled} />,
}
