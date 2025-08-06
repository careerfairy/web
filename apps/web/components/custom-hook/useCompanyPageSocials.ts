import { Group } from "@careerfairy/shared-lib/groups"
import {
   SocialIconProps,
   SocialPlatformObject,
   SocialPlatformType,
} from "components/custom-hook/useSocials"
import FacebookRoundedIcon from "components/views/common/icons/FacebookRoundedIcon"
import LinkedInRoundedIcon from "components/views/common/icons/LinkedInRoundedIcon"
import WhatsAppRoundedIcon from "components/views/common/icons/WhatsAppRoundedIcon"
import XRoundedIcon from "components/views/common/icons/XRoundedIcon"
import { facebookAppId } from "constants/links"
import { useCallback, useMemo, useState } from "react"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerEvent } from "util/analyticsUtils"
import { makeGroupCompanyPageUrl } from "util/makeUrls"

type Props = {
   group: Group
   onShareOptionClick?: (type: SocialPlatformType) => void
}

const useCompanyPageSocials = ({ group, onShareOptionClick }: Props) => {
   const companyPageUrl = makeGroupCompanyPageUrl(group.universityName, {
      absoluteUrl: true,
   })

   // Track which platforms have been clicked to prevent duplicate analytics
   const [clickedPlatforms, setClickedPlatforms] = useState(
      new Set<SocialPlatformType>()
   )

   const handleShareOptionClick = useCallback(
      (type: SocialPlatformType) => {
         // Only fire analytics on first click per platform
         if (!clickedPlatforms.has(type)) {
            setClickedPlatforms((prev) => new Set([...prev, type]))

            // Map social platform types to UTM medium values for consistent tracking
            const mediumMapping = {
               [SocialPlatformObject.Whatsapp]: "whatsapp",
               [SocialPlatformObject.Linkedin]: "linkedin",
               [SocialPlatformObject.Facebook]: "facebook",
               [SocialPlatformObject.X]: "x",
               [SocialPlatformObject.Copy]: "copy",
            }

            const medium = mediumMapping[type] || type

            // Track the share action
            dataLayerEvent(AnalyticsEvents.CompanyPageShare, {
               medium: medium,
            })
         }

         // Always call parent callback if provided
         if (onShareOptionClick) {
            onShareOptionClick(type)
         }
      },
      [clickedPlatforms, onShareOptionClick]
   )

   // Reset deduplication when component unmounts or dialog closes
   const resetClickedPlatforms = useCallback(() => {
      setClickedPlatforms(new Set())
   }, [])

   const socials = useMemo<SocialIconProps[]>(() => {
      const buildUrlWithUtm = (medium: string) => {
         const utmParams = new URLSearchParams({
            utm_source: "careerfairy",
            utm_medium: medium,
            utm_campaign: "company-page",
            utm_content: group.universityName,
         })
         return `${companyPageUrl}?${utmParams.toString()}`
      }

      const message = `Check out ${group.universityName}'s company page on CareerFairy!`
      const encodedMessage = encodeURIComponent(message)

      return [
         {
            icon: null,
            roundedIcon: WhatsAppRoundedIcon,
            name: "WhatsApp",
            onClick: () => {
               handleShareOptionClick(SocialPlatformObject.Whatsapp)
               const whatsappUrl = buildUrlWithUtm("whatsapp")
               const encodedUrl = encodeURIComponent(whatsappUrl)
               window
                  .open(
                     `https://api.whatsapp.com/send?text=${encodedMessage}%20${encodedUrl}`,
                     "_blank"
                  )
                  ?.focus()
            },
            type: SocialPlatformObject.Whatsapp,
         },
         {
            icon: null,
            roundedIcon: LinkedInRoundedIcon,
            name: "LinkedIn",
            onClick: () => {
               handleShareOptionClick(SocialPlatformObject.Linkedin)
               const linkedinUrl = buildUrlWithUtm("linkedin")
               const encodedUrl = encodeURIComponent(linkedinUrl)
               window
                  .open(
                     `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
                     "_blank"
                  )
                  ?.focus()
            },
            type: SocialPlatformObject.Linkedin,
         },
         {
            icon: null,
            roundedIcon: FacebookRoundedIcon,
            name: "Facebook",
            onClick: () => {
               handleShareOptionClick(SocialPlatformObject.Facebook)
               const facebookUrl = buildUrlWithUtm("facebook")
               const encodedUrl = encodeURIComponent(facebookUrl)
               window
                  .open(
                     `https://www.facebook.com/dialog/share?app_id=${facebookAppId}&display=page&href=${encodedUrl}`,
                     "_blank"
                  )
                  ?.focus()
            },
            type: SocialPlatformObject.Facebook,
         },
         {
            icon: null,
            roundedIcon: XRoundedIcon,
            name: "X",
            onClick: () => {
               handleShareOptionClick(SocialPlatformObject.X)
               const xUrl = buildUrlWithUtm("x")
               const encodedUrl = encodeURIComponent(xUrl)
               window
                  .open(
                     `https://twitter.com/intent/tweet?url=${encodedUrl}&via=CareerFairy&related=CareerFairy&text=${encodedMessage}`,
                     "_blank"
                  )
                  ?.focus()
            },
            type: SocialPlatformObject.X,
         },
      ]
   }, [companyPageUrl, group.universityName, handleShareOptionClick])

   const buildCopyUrlWithUtm = () => {
      const utmParams = new URLSearchParams({
         utm_source: "careerfairy",
         utm_medium: "copy",
         utm_campaign: "company-page",
         utm_content: group.universityName,
      })
      return `${companyPageUrl}?${utmParams.toString()}`
   }

   const handleCopy = () => {
      handleShareOptionClick(SocialPlatformObject.Copy)
      return buildCopyUrlWithUtm()
   }

   return {
      socials,
      companyPageUrl,
      buildCopyUrlWithUtm,
      handleCopy,
      resetClickedPlatforms,
   }
}

export default useCompanyPageSocials
