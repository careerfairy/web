import React, { useCallback, useMemo, useState } from "react"
import Button from "@mui/material/Button"
import { useCompanyPage } from "../"
import ShareIcon from "@mui/icons-material/ShareOutlined"
import ShareCompanyPageDialog from "../../common/ShareCompanyPageDialog"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import useIsMobile from "../../../custom-hook/useIsMobile"
import { SocialPlatformType, SocialPlatformObject } from "../../../custom-hook/useSocials"
import { makeGroupCompanyPageUrl } from "../../../../util/makeUrls"
import { AnalyticsEvents } from "../../../../util/analyticsConstants"
import { dataLayerEvent } from "../../../../util/analyticsUtils"

const ShareButton = () => {
   const { group, editMode } = useCompanyPage()
   const isMobile = useIsMobile()

   const [
      shareCompanyDialogOpen,
      handleOpenShareCompanyDialog,
      handleCloseShareCompanyDialog,
   ] = useDialogStateHandler()

   const [clickedComponents, setClickedComponents] = useState(
      new Set<SocialPlatformType>()
   )

   const companyPageUrl = useMemo(() => {
      return makeGroupCompanyPageUrl(group.universityName, {
         absoluteUrl: true,
      })
   }, [group.universityName])

   const shareData = useMemo(() => {
      return {
         title: group.universityName,
         text: `Check out ${group.universityName}'s company page on CareerFairy!`,
         url: companyPageUrl,
      }
   }, [group.universityName, companyPageUrl])

   const handleTrackShare = useCallback(
      (type: SocialPlatformType) => {
         if (!clickedComponents.has(type)) {
            setClickedComponents((prevState) => new Set([...prevState, type]))

            // Track the share action
            dataLayerEvent(AnalyticsEvents.CompanyPageShare, {
               medium: type,
            })
         }
      },
      [clickedComponents]
   )

   const handleShare = useCallback(async () => {
      if (isMobile && navigator?.share) {
         try {
            await navigator.share(shareData)
            handleTrackShare(SocialPlatformObject.Copy) // Track as mobile share
         } catch (error) {
            // If native share fails or is cancelled, fallback to dialog
            if (error.name !== 'AbortError') {
               handleOpenShareCompanyDialog()
            }
         }
      } else {
         handleOpenShareCompanyDialog()
      }
   }, [handleOpenShareCompanyDialog, isMobile, shareData, handleTrackShare])

   const handleClose = useCallback(() => {
      handleCloseShareCompanyDialog()
      setClickedComponents(new Set())
   }, [handleCloseShareCompanyDialog])

   return (
      <>
         <Button
            onClick={handleShare}
            variant={"outlined"}
            size={"medium"}
            color={"primary"}
            startIcon={<ShareIcon />}
         >
            Share
         </Button>
         {shareCompanyDialogOpen ? (
            <ShareCompanyPageDialog
               group={group}
               handleClose={handleClose}
               isGroupAdmin={editMode}
               onShareOptionClick={handleTrackShare}
            />
         ) : null}
      </>
   )
}

export default ShareButton
