import { useEffect, useMemo, useState } from "react"
import { useCopyToClipboard } from "react-use"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import FacebookIcon from "@mui/icons-material/Facebook"
import { facebookAppId } from "../../constants/links"
import TwitterIcon from "@mui/icons-material/Twitter"
import EmailIcon from "@mui/icons-material/Email"
import ShareIcon from "@mui/icons-material/ShareOutlined"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { makeLivestreamEventDetailsInviteUrl } from "../../util/makeUrls"
import { useAuth } from "../../HOCs/AuthProvider"
import { dataLayerLivestreamEvent } from "../../util/analyticsUtils"
import { SocialIconProps, SocialPlatformObject } from "./useSocials"

const useEventSocials = (event: LivestreamEvent) => {
   const { userData } = useAuth()
   const [state, copyEventLinkToClipboard] = useCopyToClipboard()
   const [shareLinkTooltipMessage, setShareLinkTooltipMessage] =
      useState("Share")
   const [clicked, setClicked] = useState(false)

   useEffect(() => {
      if (state.value) {
         setShareLinkTooltipMessage("Copied!")
         setTimeout(() => {
            setShareLinkTooltipMessage("Share")
         }, 1500)

         return () => {
            setShareLinkTooltipMessage("Share")
         }
      }
   }, [state.value, clicked])
   return useMemo<SocialIconProps[]>(() => {
      const eventUrl = makeLivestreamEventDetailsInviteUrl(
         event?.id,
         userData?.referralCode
      )
      const encodedEventUrl = encodeURIComponent(eventUrl)
      const encodedCompanyName = encodeURIComponent(event?.company)
      const encodedEventTitle = encodeURIComponent(event?.title)
      const linkedinLink = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedEventUrl}&title=${encodedCompanyName}%27s%20event%20%22${encodedEventTitle}%22%20is%20open%20for%20registration%21&source=CareerFairy`
      const facebookLink = `https://www.facebook.com/dialog/share?app_id=${facebookAppId}&display=page&href=${encodedEventUrl}`
      const twitterLink = `https://twitter.com/intent/tweet?url=${encodedEventUrl}&via=CareerFairy&related=CareerFairy&text=Just%20registered%20for%20${encodedCompanyName}%27s%20latest%20event%3A%20%22${encodedEventTitle}%22`

      return [
         {
            icon: LinkedInIcon,
            name: "LinkedIn",
            onClick: () => {
               window.open(linkedinLink, "_blank").focus()
               dataLayerLivestreamEvent("event_share", event, {
                  medium: "LinkedIn",
               })
            },
            type: SocialPlatformObject.Linkedin,
         },
         {
            icon: FacebookIcon,
            name: "Facebook",
            onClick: () => {
               /*
A redirect uri can be added to track where users are coming from internally or for group admins: https://developers.facebook.com/docs/sharing/reference/share-dialog/
&redirect_uri=https%3A%2F%2Fapp.livestorm.co%2F%3Futm_source%3Dredirect-share-webinar%26utm_medium%3Dtest%26utm_campaign%3DPDF%20Event%26participant_name%3D
*/
               window.open(facebookLink, "_blank").focus()
               dataLayerLivestreamEvent("event_share", event, {
                  medium: "Facebook",
               })
            },
            type: SocialPlatformObject.Facebook,
         },
         {
            icon: TwitterIcon,
            name: "Twitter",
            onClick: () => {
               window.open(twitterLink, "_blank").focus()
               dataLayerLivestreamEvent("event_share", event, {
                  medium: "Twitter",
               })
            },
            type: SocialPlatformObject.X,
         },
         {
            icon: EmailIcon,
            name: "Email",
            href: `mailto:?subject=${event?.title}&body=${encodedEventUrl}`,
            type: SocialPlatformObject.Email,
         },
         {
            icon: ShareIcon,
            name: shareLinkTooltipMessage,
            onClick: () => {
               setClicked((prev) => !prev)
               copyEventLinkToClipboard(eventUrl)
               dataLayerLivestreamEvent("event_share", event, {
                  medium: "Copy Link",
               })
            },
            type: SocialPlatformObject.Copy,
         },
      ]
   }, [
      event,
      userData?.referralCode,
      shareLinkTooltipMessage,
      copyEventLinkToClipboard,
   ])
}

export default useEventSocials
