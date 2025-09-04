import ShareArrowIcon from "components/views/common/icons/ShareArrowIcon"
import Button from "@mui/material/Button"
import { Fragment } from "react"
import { useCompanyPage } from "../"
import { AnalyticsEvents } from "../../../../util/analyticsConstants"
import { dataLayerEvent } from "../../../../util/analyticsUtils"
import { makeGroupCompanyPageUrl } from "../../../../util/makeUrls"
import useDialogStateHandler from "../../../custom-hook/useDialogStateHandler"
import useIsMobile from "../../../custom-hook/useIsMobile"
import { ShareCompanyPageDialog } from "../../common/ShareCompanyPageDialog"

const ShareButton = () => {
   const { group } = useCompanyPage()
   const isMobile = useIsMobile()

   const [
      shareCompanyDialogOpen,
      handleOpenShareCompanyDialog,
      handleCloseShareCompanyDialog,
   ] = useDialogStateHandler()

   const handleShare = async () => {
      if (isMobile && navigator?.share) {
         try {
            const companyPageUrl = makeGroupCompanyPageUrl(
               group.universityName,
               {
                  absoluteUrl: true,
               }
            )

            const utmParams = new URLSearchParams({
               utm_source: "careerfairy",
               utm_medium: "mobile",
               utm_campaign: "company-page",
               utm_content: group.universityName,
            })

            const urlWithUtm = `${companyPageUrl}?${utmParams.toString()}`

            await navigator.share({
               title: group.universityName,
               text: `Check out ${group.universityName}'s company page on CareerFairy!`,
               url: urlWithUtm,
            })

            // Track mobile share directly since it doesn't go through the hook
            dataLayerEvent(AnalyticsEvents.CompanyPageShare, {
               medium: "mobile",
            })
         } catch (error) {
            // If native share fails or is cancelled, fallback to dialog
            if (error.name !== "AbortError") {
               handleOpenShareCompanyDialog()
            }
         }
      } else {
         handleOpenShareCompanyDialog()
      }
   }

   return (
      <Fragment>
         <Button
            onClick={handleShare}
            variant={"outlined"}
            size={"medium"}
            color={"primary"}
            startIcon={
               <ShareArrowIcon
                  sx={{ color: (theme) => theme.brand.primary[600] }}
               />
            }
         >
            Share
         </Button>
         {shareCompanyDialogOpen ? (
            <ShareCompanyPageDialog
               group={group}
               handleClose={handleCloseShareCompanyDialog}
            />
         ) : null}
      </Fragment>
   )
}

export default ShareButton
