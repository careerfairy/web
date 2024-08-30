import { Button, Stack, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { useAuth } from "HOCs/AuthProvider"
import { CategoryContainerTopAligned } from "materialUI/GlobalContainers"
import { useCallback, useMemo, useState } from "react"
import { Lock } from "react-feather"
import { buildCrispEmbedURL } from "scripts/crisp"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"
import { enableConsentFor, isConsentEnabled } from "util/ConsentUtils"

const styles = sxStyles({
   root: {
      width: "100%",
      height: "100%",
      overflow: "hidden",
      "& iframe": {
         width: "inherit",
         height: "inherit",
         border: "none",
      },
   },
   consentRoot: {
      px: 1.5,
      alignItems: "center",
      marginTop: "20px",
   },
   icon: {
      width: 71,
      height: 71,
      opacity: 0.5,
      color: "primary.main",
      marginBottom: "8px",
   },
   title: {
      fontWeight: 700,
      color: "primary.main",
      textAlign: "center",
   },
   description: {
      textAlign: "center",
      color: "neutral.800",
   },
})

export const CrispChat = () => {
   const { authenticatedUser } = useAuth()
   const [hasConsent, setHasConsent] = useState(isConsentEnabled("Crisp Chat"))

   const url = useMemo(() => {
      return buildCrispEmbedURL(authenticatedUser.email, authenticatedUser.uid)
   }, [authenticatedUser.email, authenticatedUser.uid])

   const giveConsent = useCallback(() => {
      setHasConsent(true)
      enableConsentFor("Crisp Chat").catch(errorLogAndNotify)
   }, [])

   if (!hasConsent) {
      return (
         <Stack sx={styles.consentRoot} spacing={3}>
            <Stack alignItems="center" justifyContent="center" spacing={0.5}>
               <Box component={Lock} sx={styles.icon} />
               <Typography variant="mobileBrandedH1" sx={styles.title}>
                  Support chat unavailable
               </Typography>
               <Typography variant="medium" sx={styles.description}>
                  The support chat is unavailable because of your privacy
                  settings. Click on enable to extend your cookies settings
                  allowing for the support functionality.
               </Typography>
            </Stack>
            <Button onClick={giveConsent} variant="contained" fullWidth>
               Enable support chat
            </Button>
         </Stack>
      )
   }

   return (
      <CategoryContainerTopAligned>
         <Box sx={styles.root}>
            <iframe src={url}></iframe>
         </Box>
      </CategoryContainerTopAligned>
   )
}
