import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/utils/urls"
import { getBaseUrl } from "components/helperFunctions/HelperFunctions"
import { queryInvite, queryReferralCode } from "../constants/queryStringParams"

export const makeGroupCompanyPageUrl = (
   groupName: string,
   {
      interactionSource,
      absoluteUrl,
   }: { interactionSource?: string; absoluteUrl?: boolean } = {}
) => {
   return `${absoluteUrl ? "" : getBaseUrl()}/company/${companyNameSlugify(
      groupName
   )}${interactionSource ? `?interactionSource=${interactionSource}` : ""}`
}

export const makeLivestreamEventDetailsInviteUrl = (
   livestreamId,
   referralCode
) => {
   return (
      makeLivestreamEventDetailsUrl(livestreamId, {
         overrideBaseUrl: getBaseUrl(),
      }) +
      `?${queryReferralCode}=${referralCode}&${queryInvite}=${livestreamId}`
   )
}

type LivestreamShareURLOptions = {
   utm_source?: string
   utm_campaign?: string
   utm_content?: string
}

export const makeLivestreamEventDetailsShareUrl = (
   livestreamId: string,
   options?: LivestreamShareURLOptions
) => {
   const url = new URL(
      makeLivestreamEventDetailsUrl(livestreamId, {
         overrideBaseUrl: getBaseUrl(),
      })
   )
   if (options?.utm_source)
      url.searchParams.set("utm_source", options.utm_source)
   if (options?.utm_campaign)
      url.searchParams.set("utm_campaign", options.utm_campaign)
   if (options?.utm_content)
      url.searchParams.set("utm_content", options.utm_content)

   return url
}

export const makeReferralUrl = (userReferralCode) => {
   return `${getBaseUrl()}/?${queryReferralCode}=${userReferralCode}`
}

type LivestreamURLOptions = {
   type: "host" | "viewer"
   token?: string
   referralCode?: string
   inviteCode?: string
}

export const makeLivestreamUrl = (
   livestreamId: string,
   options?: LivestreamURLOptions
) => {
   const url = new URL(
      `${getBaseUrl()}/streaming/${options.type}/${livestreamId}`
   )
   const params = new URLSearchParams(url.search)

   if (options.token) {
      params.set("token", options.token)
   }
   if (options.referralCode) {
      params.set("referral", options.referralCode)
   }
   if (options.inviteCode) {
      params.set("invite", options.inviteCode)
   }

   url.search = params.toString()

   return url.toString()
}
