import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { GetServerSidePropsContext, GetStaticPropsContext } from "next"
import { NextRouter } from "next/router"
import { UrlObject } from "url"
import { errorLogAndNotify } from "../../../util/CommonUtil"
import {
   getServerSideStream,
   getServerSideUserStats,
   getUserTokenFromCookie,
} from "../../../util/serverUtil"
import { getBaseUrl } from "../../helperFunctions/HelperFunctions"
import { LiveStreamDialogData } from "./LivestreamDialogLayout"

export const getLivestreamDialogData = async (
   ctx: GetServerSidePropsContext | GetStaticPropsContext
): Promise<LiveStreamDialogData> => {
   try {
      const livestreamParams = (ctx.params.livestreamDialog as string[]) || []

      let email = null
      if ("req" in ctx) {
         // Check if ctx is GetServerSidePropsContext
         const token = getUserTokenFromCookie({ req: ctx?.req })
         email = token?.email ?? null
      }

      if (livestreamParams[0] === "livestream" && livestreamParams[1]) {
         const [stream, serverSideUserStats] = await Promise.all([
            getServerSideStream(livestreamParams[1]),
            getServerSideUserStats(email),
         ])

         return {
            serverSideLivestream: stream
               ? LivestreamPresenter.serializeDocument(stream)
               : null,
            serverSideUserEmail: email,
            serverSideUserStats,
         }
      }
   } catch (e) {
      errorLogAndNotify(e, {
         message: "Error getting live stream dialog data",
         context: "getLivestreamDialogData",
         extra: {
            ctx,
         },
      })
   }
   return null
}

export const livestreamDialogSSP = <
   TContext extends GetServerSidePropsContext
>() => {
   return async (ctx: TContext) => {
      return {
         props: {
            livestreamDialogData: await getLivestreamDialogData(ctx),
         },
      }
   }
}

export const LIVESTREAM_DIALOG_PATH = "[[...livestreamDialog]]"

export const isOnlivestreamDialogPage = (routerPathname: string) => {
   return routerPathname.includes(LIVESTREAM_DIALOG_PATH)
}

/**
 * Represents the different page types available in the livestream dialog.
 * These values are used as router paths in URL construction for the livestream dialog navigation.
 *
 * Each type corresponds to a specific route segment in the dialog's URL structure:
 * - details: Main livestream details view (/livestream/[id])
 * - register: Registration flow view (/livestream/[id]/register)
 * - job-details: Job information view (/livestream/[id]/job-details/[jobId])
 * - speaker-details: Speaker information view (/livestream/[id]/speaker-details/[speakerId])
 * - recommendations: Recommendations view after registration (/livestream/[id]/recommendations)
 *
 * These router paths determine which view component is rendered within the dialog.
 */
export type DialogPageType =
   | "details"
   | "register"
   | "job-details"
   | "speaker-details"
   | "recommendations"

/**
 * Maps URL path segments to DialogPageType values.
 *
 * WARNING: Do not modify these existing values as they are used in existing links.
 */
export const DialogPageTypeMapping = {
   details: "details",
   register: "register",
   "job-details": "job-details",
   "speaker-details": "speaker-details",
   recommendations: "recommendations",
} as const satisfies Record<string, DialogPageType>

type PageTypeToUrlPath = typeof DialogPageTypeMapping

type DialogPage = "/portal" | "/next-livestreams"

/**
 * Valid path segments for the livestream dialog.
 */
export type ValidLink =
   | ["livestream", string, PageTypeToUrlPath["job-details"], string]
   | ["livestream", string, PageTypeToUrlPath["speaker-details"], string]
   | ["livestream", string]
   | ["livestream", string, PageTypeToUrlPath["register"]]
   | ["livestream", string, PageTypeToUrlPath["recommendations"]]

type LinkType =
   | {
        type: "livestreamDetails"
        livestreamId: string
        targetPage?: DialogPage
     }
   | {
        type: "jobDetails"
        livestreamId: string
        jobId: string
        targetPage?: DialogPage
     }
   | {
        type: "speakerDetails"
        livestreamId: string
        speakerId: string
        targetPage?: DialogPage
     }
   | {
        type: "registerToLivestream"
        livestreamId: string
        targetPage?: DialogPage
     }
   | {
        type: "recommendations"
        livestreamId: string
        targetPage?: DialogPage
     }

export const buildDialogLink = ({
   router,
   link,
}: {
   router: NextRouter
   link: LinkType
}): UrlObject => {
   const isOnLivestreamDialogPage = isOnlivestreamDialogPage(router.pathname)
   let query: ValidLink
   const path: DialogPage = link.targetPage ?? "/portal"

   switch (link.type) {
      case "livestreamDetails":
         query = ["livestream", link.livestreamId]
         break
      case "jobDetails":
         query = ["livestream", link.livestreamId, "job-details", link.jobId]
         break
      case "speakerDetails":
         query = [
            "livestream",
            link.livestreamId,
            "speaker-details",
            link.speakerId,
         ]
         break
      case "registerToLivestream":
         query = ["livestream", link.livestreamId, "register"]
         break
      case "recommendations":
         query = ["livestream", link.livestreamId, "recommendations"]
         break
   }

   return {
      pathname: isOnLivestreamDialogPage
         ? router.pathname
         : `${path}/${LIVESTREAM_DIALOG_PATH}`,
      query: {
         ...router.query,
         livestreamDialog: query,
      },
   }
}

export const buildExternalDialogLink = (link: LinkType): string => {
   let pathDetail: string

   switch (link.type) {
      case "livestreamDetails":
         pathDetail = `livestream/${link.livestreamId}`
         break
      case "jobDetails":
         pathDetail = `livestream/${link.livestreamId}/job-details/${link.jobId}`
         break
      case "registerToLivestream":
         pathDetail = `livestream/${link.livestreamId}/register`
         break
      default:
         throw new Error("Invalid link type")
   }

   const baseUrl = getBaseUrl()
   return `${baseUrl}${link.targetPage}/${pathDetail}`
}
