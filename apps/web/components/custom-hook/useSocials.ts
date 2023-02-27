import { useEffect, useMemo, useState } from "react"
import { useCopyToClipboard } from "react-use"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import FacebookIcon from "@mui/icons-material/Facebook"
import { facebookAppId } from "../../constants/links"
import TwitterIcon from "@mui/icons-material/Twitter"
import EmailIcon from "@mui/icons-material/Email"
import ShareIcon from "@mui/icons-material/ShareOutlined"
import { dataLayerEvent } from "../../util/analyticsUtils"

export interface SocialIconProps {
   icon: typeof LinkedInIcon
   name: string
   onClick?: () => any
   href?: string
}

type Props = {
   url: string
   title: string
   linkedinMessage: string
   twitterMessage: string
   dataLayerEntityName: "company_page"
}
const useSocials = (props: Props) => {
   const [shareLinkTooltipMessage, setShareLinkTooltipMessage] =
      useState("Share")

   const [clicked, setClicked] = useState(false)

   const [state, copyLinkToClipboard] = useCopyToClipboard()

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
      const linkedinMessage = encodeURIComponent(props?.linkedinMessage)
      const twitterMessage = encodeURIComponent(props?.twitterMessage)
      const encodedUrl = encodeURIComponent(props.url)
      const encodedTitle = encodeURIComponent(props?.title)

      const linkedinLink = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}%27s%20${linkedinMessage}&source=CareerFairy`
      const facebookLink = `https://www.facebook.com/dialog/share?app_id=${facebookAppId}&display=page&href=${encodedUrl}`
      const twitterLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&via=CareerFairy&related=CareerFairy&text=${twitterMessage}`

      const eventName = `${props.dataLayerEntityName}_share`
      return [
         {
            icon: LinkedInIcon,
            name: "LinkedIn",
            onClick: () => {
               window.open(linkedinLink, "_blank").focus()
               dataLayerEvent(eventName, {
                  medium: "LinkedIn",
               })
            },
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
               dataLayerEvent(eventName, {
                  medium: "Facebook",
               })
            },
         },
         {
            icon: TwitterIcon,
            name: "Twitter",
            onClick: () => {
               window.open(twitterLink, "_blank").focus()
               dataLayerEvent(eventName, {
                  medium: "Twitter",
               })
            },
         },
         {
            icon: EmailIcon,
            name: "Email",
            href: `mailto:?subject=${props?.title}&body=${encodedUrl}`,
         },
         {
            icon: ShareIcon,
            name: shareLinkTooltipMessage,
            onClick: () => {
               setClicked((prev) => !prev)
               copyLinkToClipboard(props.url)
               dataLayerEvent(eventName, {
                  medium: "Copy Link",
               })
            },
         },
      ]
   }, [
      props?.linkedinMessage,
      props?.twitterMessage,
      props.url,
      props?.title,
      props.dataLayerEntityName,
      shareLinkTooltipMessage,
      copyLinkToClipboard,
   ])
}

export default useSocials
