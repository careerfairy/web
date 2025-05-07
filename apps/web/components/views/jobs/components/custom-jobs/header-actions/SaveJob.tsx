import { Box, CircularProgress, Tooltip } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useSavedJob } from "components/custom-hook/custom-job/useSavedJob"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { Bookmark } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { CustomJobHeaderActionsProps } from "../CustomJobHeaderActions"

const styles = sxStyles({
   bookmarkBox: {
      width: 32,
      height: 32,
      borderRadius: "22px",
      backgroundColor: (theme) => theme.palette.neutral[50],
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
   },
   bookmarkBoxSaved: {
      backgroundColor: (theme) => theme.brand.tq[100],
   },
   bookmarkIcon: {
      color: (theme) => theme.palette.neutral[500],
   },
   bookmarkIconSaved: {
      color: (theme) => theme.brand.tq[600],
   },
})

export const UserSaveJob = ({ customJob }: CustomJobHeaderActionsProps) => {
   const { isLoggedIn } = useAuth()
   return isLoggedIn ? (
      <SaveJob customJob={customJob} />
   ) : (
      <UnAuthedSaveJob customJob={customJob} />
   )
}

export const SaveJob = ({ customJob }: CustomJobHeaderActionsProps) => {
   const { isSaved, toggleSaved, isToggling } = useSavedJob(customJob)

   return (
      <BrandedTooltip title={isSaved ? "Unsave" : "Save"}>
         <Box
            sx={[styles.bookmarkBox, isSaved && styles.bookmarkBoxSaved]}
            onClick={toggleSaved}
         >
            {isToggling ? (
               <CircularProgress size={20} />
            ) : (
               <Box
                  fill={isSaved ? "currentColor" : "none"}
                  component={Bookmark}
                  size={20}
                  sx={isSaved ? styles.bookmarkIconSaved : styles.bookmarkIcon}
               />
            )}
         </Box>
      </BrandedTooltip>
   )
}

const UnAuthedSaveJob = ({ customJob }: CustomJobHeaderActionsProps) => {
   const { push, asPath } = useRouter()
   const redirectToSignUp = useCallback(() => {
      return push({
         pathname: "/signup",
         query: { absolutePath: asPath, savedJobId: customJob.id },
      })
   }, [asPath, customJob.id, push])

   return (
      <Tooltip title={"Save"}>
         <Box sx={[styles.bookmarkBox]} onClick={redirectToSignUp}>
            <Box component={Bookmark} size={20} sx={styles.bookmarkIcon} />
         </Box>
      </Tooltip>
   )
}
