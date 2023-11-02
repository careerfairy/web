import { GetServerSidePropsContext, GetStaticPropsContext } from "next"
import {
   getServerSideStream,
   getServerSideUserStats,
   getUserTokenFromCookie,
} from "../../../util/serverUtil"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { LiveStreamDialogData } from "./LivestreamDialogLayout"
import { errorLogAndNotify } from "../../../util/CommonUtil"
import { NextRouter } from "next/router"
import { UrlObject } from "url"
import { getBaseUrl } from "../../helperFunctions/HelperFunctions"

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

type DialogPage = "/portal" | "/next-livestreams"

type ValidLink =
   | ["livestream", string, "job-details", string]
   | ["livestream", string]
   | ["livestream", string, "register"]

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
        type: "registerToLivestream"
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
      case "registerToLivestream":
         query = ["livestream", link.livestreamId, "register"]
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
