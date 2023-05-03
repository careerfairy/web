import { FC, useEffect } from "react"
import BaseDialogView, {
   LeftContent,
   RightContent,
   SubHeaderText,
   TitleText,
} from "../BaseDialogView"
import { useCreditsDialogContext } from "../CreditsDialog"
import Stack from "@mui/material/Stack"
import { sxStyles } from "../../../../types/commonTypes"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { ButtonBase, Fab, Typography } from "@mui/material"
import { makeReferralUrl } from "../../../../util/makeUrls"
import { dataLayerEvent } from "../../../../util/analyticsUtils"
import { useCopyToClipboard } from "react-use"
import useSnackbarNotifications from "../../../custom-hook/useSnackbarNotifications"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import TwitterIcon from "@mui/icons-material/Twitter"
import WhatsAppShare from "../../common/socials/WhatsAppShare"
import LinkedInShare from "../../common/socials/LinkedInShare"
import TwitterShare from "../../common/socials/TwitterShare"

const styles = sxStyles({
   root: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
   },
   referBox: {
      borderRadius: 2,
      border: `2px solid #D0C6FF`,
      bgcolor: "background.paper",
      p: 2,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      width: "100%",
   },
   socialButton: {
      backgroundColor: "grey.500",
      color: "white",
      fontSize: "1.7rem",
   },
   linkText: {
      width: "100%",
      maxWidth: 350,
   },
})

const ReferFriendsView: FC = () => {
   const { handleGoToView } = useCreditsDialogContext()

   return (
      <BaseDialogView
         handleBack={() => handleGoToView("GET_MORE_CREDITS")}
         leftContent={
            <LeftContent
               title={
                  <TitleText>
                     Refer a <TitleText color="primary.main">friend</TitleText>!
                  </TitleText>
               }
               subHeader={
                  <SubHeaderText>
                     By referring CareerFairy you&apos;re part of the change
                     helping your friends finding the job they&apos;ll love.
                  </SubHeaderText>
               }
            />
         }
         rightContent={
            <RightContent backgroundColor="#FAFAFA">
               <View />
            </RightContent>
         }
      />
   )
}

const View = () => {
   return (
      <Stack sx={styles.root} flex={1} spacing={2}>
         <CopyUserReferralLinkButton />
         <SocialButtons />
      </Stack>
   )
}

const CopyUserReferralLinkButton = () => {
   const { userData } = useAuth()
   const { successNotification, errorNotification } = useSnackbarNotifications()

   const [state, copyReferralLinkToClipboard] = useCopyToClipboard()

   const referralLink = makeReferralUrl(userData?.referralCode)
   const linkCopied = state.value === referralLink

   useEffect(() => {
      if (linkCopied) {
         successNotification("Link has been copied to your clipboard")
         return
      }

      if (state.error) {
         errorNotification("Something went wrong while copying the link")
      }
   }, [errorNotification, linkCopied, state.error, successNotification])

   const handleCopy = () => {
      copyReferralLinkToClipboard(referralLink)
      successNotification("Link has been copied to your clipboard")
      dataLayerEvent("referral_copy_link")
   }

   return (
      <ButtonBase onClick={handleCopy} sx={styles.referBox}>
         <Typography
            gutterBottom
            variant="body1"
            color="#9999B1"
            fontWeight={500}
         >
            Your Referral Link
         </Typography>
         <Typography
            sx={styles.linkText}
            whiteSpace="nowrap"
            variant="body1"
            overflow="hidden"
            color="text.secondary"
            textAlign="start"
            fontWeight={500}
         >
            {referralLink}
         </Typography>
      </ButtonBase>
   )
}

const SocialButtons = () => {
   const { userData } = useAuth()

   const referralLink = makeReferralUrl(userData?.referralCode)

   const title = "CareerFairy - Find your dream job"
   const handleWhatsappShare = () => {
      dataLayerEvent("referral_share_whatsapp", {
         social: "whatsapp",
      })
   }

   const handleTwitterShare = () => {
      dataLayerEvent("referral_share_twitter", {
         social: "twitter",
      })
   }

   const handleLinkedinShare = () => {
      dataLayerEvent("referral_share_linkedin", {
         social: "linkedin",
      })
   }

   return (
      <Stack>
         <Typography
            gutterBottom
            variant="body1"
            color="#9999B1"
            fontSize="1.15rem"
            fontWeight={500}
            textAlign="center"
         >
            Or share by
         </Typography>
         <Stack direction="row" spacing={2}>
            <WhatsAppShare
               url={referralLink}
               title={title}
               onClick={handleWhatsappShare}
            >
               <SocialButton icon={<WhatsAppIcon fontSize="inherit" />} />
            </WhatsAppShare>
            <TwitterShare
               onClick={handleTwitterShare}
               url={referralLink}
               title={title}
            >
               <SocialButton icon={<TwitterIcon fontSize="inherit" />} />
            </TwitterShare>
            <LinkedInShare
               onClick={handleLinkedinShare}
               title={title}
               url={referralLink} // Note: won't work in dev as LinkedIn doesn't allow the localhost domain
            >
               <SocialButton icon={<LinkedInIcon fontSize="inherit" />} />
            </LinkedInShare>
         </Stack>
      </Stack>
   )
}

type SocialButtonProps = {
   icon: JSX.Element
}
const SocialButton: FC<SocialButtonProps> = ({ icon }) => {
   return (
      <Fab
         size="small"
         sx={styles.socialButton}
         color="secondary"
         aria-label="whatsapp-link"
      >
         {icon}
      </Fab>
   )
}

export default ReferFriendsView
