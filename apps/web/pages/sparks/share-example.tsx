import React, { useCallback, useMemo } from "react"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import { Box, Button } from "@mui/material"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import SparksShareDialog from "../../components/views/sparks/components/SparksShareDialog"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useRouter } from "next/router"
import { useAuth } from "HOCs/AuthProvider"

const SparksPage = () => {
   const [isDialogOpen, handleOpenDialog, handleCloseDialog] =
      useDialogStateHandler()
   const isMobile = useIsMobile()
   const { pathname } = useRouter()
   const { userData } = useAuth()

   const shareUrl = useMemo(() => {
      const sparkId = pathname.split("/").slice(-1)[0]
      return `https://www.careerfairy.io/sparks/${sparkId}?referral=${userData?.referralCode}&invite=${sparkId}&UTM_medium=Sparks_referrals&UTM_campaign=Sparks`
   }, [pathname, userData?.referralCode])

   const shareData = useMemo(() => {
      return {
         title: "CareerFairy",
         text: "Check out this Spark on CareerFairy!",
         url: shareUrl,
      }
   }, [shareUrl])

   const handleShare = useCallback(async () => {
      if (isMobile) {
         if (navigator?.share) {
            await navigator.share(shareData)
         } else {
            handleOpenDialog()
         }
      } else {
         handleOpenDialog()
      }
   }, [handleOpenDialog, isMobile, shareData])

   return (
      <GenericDashboardLayout pageDisplayName={""}>
         <Box
            sx={{
               width: "100%",
               display: "flex",
               justifyContent: "center",
               p: "50px",
            }}
         >
            <Button variant={"contained"} color={"error"} onClick={handleShare}>
               Share example
            </Button>
            <SparksShareDialog
               isOpen={isDialogOpen}
               handleClose={handleCloseDialog}
               shareUrl={shareUrl}
            />
         </Box>
      </GenericDashboardLayout>
   )
}
export default SparksPage
