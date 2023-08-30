import { useEffect, useMemo, useState } from "react"
import { useCopyToClipboard } from "react-use"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import FacebookIcon from "@mui/icons-material/Facebook"
import { facebookAppId } from "../../constants/links"
import TwitterIcon from "@mui/icons-material/Twitter"
import EmailIcon from "@mui/icons-material/Email"
import ShareIcon from "@mui/icons-material/ShareOutlined"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import { dataLayerEvent } from "../../util/analyticsUtils"

export const SocialPlatformObject = {
   Facebook: "facebook",
   X: "x",
   Whatsapp: "whatsapp",
   Email: "email",
   Linkedin: "linkedin",
   Copy: "copy",
} as const

export type SocialPlatformType =
   (typeof SocialPlatformObject)[keyof typeof SocialPlatformObject]

export interface SocialIconProps {
   icon: typeof LinkedInIcon
   imageLink?: string
   name: string
   onClick?: () => any
   href?: string
   type: SocialPlatformType
}

type Props = {
   url: string
   title: string
   message: string
   dataLayerEntityName: "company_page" | "sparks"
   platforms?: SocialPlatformType[]
}
const useSocials = ({
   url,
   title,
   message,
   dataLayerEntityName,
   platforms,
}: Props) => {
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
      const encodedMessage = encodeURIComponent(message)
      const [urlBase, urlParameters] = url.split("?", 2)
      const encodedUrlParameters = urlParameters
         ? encodeURIComponent("&" + urlParameters)
         : ""
      const encodedUrlBase = encodeURIComponent(urlBase + "?")

      const linkedinLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrlBase}utm_source=LinkedIn${encodedUrlParameters}`
      const facebookLink = `https://www.facebook.com/dialog/share?app_id=${facebookAppId}&display=page&href=${encodedUrlBase}utm_source=Facebook${encodedUrlParameters}`
      const twitterLink = `https://twitter.com/intent/tweet?url=${encodedUrlBase}utm_source=X${encodedUrlParameters}&via=CareerFairy&related=CareerFairy&text=${encodedMessage}`
      const whatsappLink = `https://api.whatsapp.com/send?text=${encodedMessage}%20${encodedUrlBase}utm_source=WhatsApp${encodedUrlParameters}`

      const eventName = `${dataLayerEntityName}_share`
      const socials = [
         {
            icon: LinkedInIcon,
            imageLink:
               "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/share-logos%2Flinkedin.png?alt=media&token=6c3fea64-5ff3-45ef-b6c2-a3b5e3ba4c60",
            name: "LinkedIn",
            onClick: () => {
               window.open(linkedinLink, "_blank").focus()
               dataLayerEvent(eventName, {
                  medium: "LinkedIn",
               })
            },
            type: SocialPlatformObject.Linkedin,
         },
         {
            icon: FacebookIcon,
            imageLink:
               "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/share-logos%2Ffacebook.png?alt=media&token=e8be60d2-f445-4d21-ad19-2ba24af9c36e",
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
            type: SocialPlatformObject.Facebook,
         },
         {
            icon: TwitterIcon,
            imageLink:
               "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/share-logos%2Fx.png?alt=media&token=d0605e29-6627-4510-8b80-31e84c3e6894",
            name: "χ",
            onClick: () => {
               window.open(twitterLink, "_blank").focus()
               dataLayerEvent(eventName, {
                  medium: "Twitter",
               })
            },
            type: SocialPlatformObject.X,
         },
         {
            icon: EmailIcon,
            name: "Email",
            href: `mailto:?subject=${title}&body=${encodedUrlBase}utm_source=Email${encodedUrlParameters}`,
            type: SocialPlatformObject.Email,
         },
         {
            icon: ShareIcon,
            name: shareLinkTooltipMessage,
            onClick: () => {
               setClicked((prev) => !prev)
               copyLinkToClipboard(url)
               dataLayerEvent(eventName, {
                  medium: "Copy Link",
               })
            },
            type: SocialPlatformObject.Copy,
         },
         {
            icon: WhatsAppIcon,
            imageLink:
               "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/share-logos%2Fwhatsapp.png?alt=media&token=54cac0cc-4640-463b-a6c7-35315663e6b6",
            name: "WhatsApp",
            onClick: () => {
               window.open(whatsappLink, "_blank").focus()
               dataLayerEvent(eventName, {
                  medium: "WhatsApp",
               })
            },
            type: SocialPlatformObject.Whatsapp,
         },
      ]

      return platforms
         ? socials
              .filter((social) => platforms.includes(social.type))
              .sort((social1, social2) =>
                 platforms.indexOf(social1.type) <
                 platforms.indexOf(social2.type)
                    ? -1
                    : 1
              )
         : socials
   }, [
      message,
      url,
      title,
      dataLayerEntityName,
      shareLinkTooltipMessage,
      platforms,
      copyLinkToClipboard,
   ])
}

export default useSocials
