import { memo } from "react"

// project imports
import useGroupATSAccounts from "../../components/custom-hook/useGroupATSAccounts"
import { Status } from "./Status"

type Props = {
   groupId: string
}

const ATSStatus = ({ groupId }: Props) => {
   const { data: accounts } = useGroupATSAccounts(groupId)

   if (accounts.length === 0) {
      // no ATS accounts, so no status
      return null
   }

   // If an account has not completed the application test yet, then we show a warning
   if (
      accounts.some((account) => account.isApplicationTestComplete() === false)
   ) {
      return (
         <Status
            message={"ATS application test is not complete"}
            color={"warning"}
         />
      )
   }

   // If an account has not completed it's first sync yet, we show a warning
   if (accounts.some((account) => account.isFirstSyncComplete() === false)) {
      return (
         <Status message={"ATS first sync is not complete"} color={"warning"} />
      )
   }

   // If all accounts are ready, we show a success status
   if (accounts.every((account) => account.isReady())) {
      return (
         <Status
            message={"ATS is up and running without issues"}
            color={"primary"}
         />
      )
   }

   return null
}

export default memo(ATSStatus) // Memoize to prevent unnecessary re-renders
