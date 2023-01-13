import { CategoryContainerTopAligned } from "materialUI/GlobalContainers"
import { memo, useCallback, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../types/commonTypes"
import { buildCrispEmbedURL } from "../../../../../scripts/crisp"
import { enableConsentFor, isConsentEnabled } from "util/ConsentUtils"
import { Button, Stack, Typography } from "@mui/material"
import { errorLogAndNotify } from "util/CommonUtil"

type Props = {
   selectedState: string // current tab open, this one is "jobs"
   showMenu: boolean
}
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
})

const SupportCategory = ({ selectedState, showMenu }: Props) => {
   const { authenticatedUser } = useAuth()
   const [hasConsent, setHasConsent] = useState(isConsentEnabled("Crisp Chat"))

   const url = useMemo(() => {
      return buildCrispEmbedURL(authenticatedUser.email, authenticatedUser.uid)
   }, [authenticatedUser.email, authenticatedUser.uid])

   const giveConsent = useCallback(() => {
      setHasConsent(true)
      enableConsentFor("Crisp Chat").catch(errorLogAndNotify)
   }, [])

   if (selectedState !== "support" || !showMenu) {
      return null
   }

   if (!hasConsent) {
      return (
         <CategoryContainerTopAligned>
            <Box px={2}>
               <Stack spacing={3}>
                  <Typography align="center" px={2} mt={2}>
                     Chat is disabled because of your privacy settings.
                  </Typography>

                  <Button variant="contained" onClick={giveConsent}>
                     Enable
                  </Button>
               </Stack>
            </Box>
         </CategoryContainerTopAligned>
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

export default memo(SupportCategory)
