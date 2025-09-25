import React, { createContext, ReactNode, useContext, useMemo } from "react"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"

type IATSAccountContext = {
   atsAccount: GroupATSAccount
}

const ATSAccountContext = createContext<IATSAccountContext>({
   atsAccount: null,
})

type Props = {
   children: ReactNode
   account: GroupATSAccount
}

/**
 * Provides the current ATS account selected (tab)
 *
 * @param children
 * @param account
 * @constructor
 */
const ATSAccountContextProvider = ({ children, account }: Props) => {
   const values = useMemo<IATSAccountContext>(() => {
      return {
         atsAccount: account,
      }
   }, [account])

   return (
      <ATSAccountContext.Provider value={values}>
         {children}
      </ATSAccountContext.Provider>
   )
}

export const useATSAccount = () =>
   useContext<IATSAccountContext>(ATSAccountContext)

export default ATSAccountContextProvider
