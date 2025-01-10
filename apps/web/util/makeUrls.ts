import { Group } from "@careerfairy/shared-lib/groups"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/utils/urls"
import { getBaseUrl } from "components/helperFunctions/HelperFunctions"
import { queryInvite, queryReferralCode } from "../constants/queryStringParams"

export const makeGroupCompanyPageUrl = (group: Group) => {
   return `${getBaseUrl()}/company/${companyNameSlugify(group.universityName)}`
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
