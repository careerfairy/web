import React, { memo } from "react"

// material-ui
import { Box, Tooltip } from "@mui/material"

// project imports
import { sxStyles } from "../../types/commonTypes"
import { useTheme } from "@mui/styles"
import useGroupATSAccounts from "../../components/custom-hook/useGroupATSAccounts"

const styles = sxStyles({
   statusRoot: (theme) => ({
      width: theme.spacing(2),
      height: theme.spacing(2),
      borderRadius: "50%",
      boxShadow: "inset 0 0 0 3.5px white",
   }),
})

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

type StatusProps = {
   message: string
   color: "primary" | "secondary" | "success" | "error" | "warning" | "info"
}
export const Status = ({ color, message }: StatusProps) => {
   const theme = useTheme()
   const targetColor = theme.palette[color].main

   return (
      <Tooltip arrow title={message}>
         <Box
            bgcolor={targetColor}
            border={`1px solid ${targetColor}`}
            sx={styles.statusRoot}
         />
      </Tooltip>
   )
}

export default memo(ATSStatus) // Memoize to prevent unnecessary re-renders
