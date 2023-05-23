import { GetServerSidePropsContext } from "next"
import {
   getServerSideStream,
   getServerSideUserStats,
   getUserTokenFromCookie,
} from "../../../util/serverUtil"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { LiveStreamDialogData } from "./LivestreamDialogLayout"
import { errorLogAndNotify } from "../../../util/CommonUtil"
import { LinkProps } from "next/link"
import { NextRouter } from "next/router"

export const getLivestreamDialogData = async (
   ctx: GetServerSidePropsContext
): Promise<LiveStreamDialogData> => {
   try {
      const livestreamParams = (ctx.params.livestreamDialog as string[]) || []
      const token = getUserTokenFromCookie({ req: ctx.req })
      const email = token?.email ?? null

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
         message: "Error getting livestream dialog data",
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

type ValidLink =
   | ["livestream", string, "job-details", string]
   | ["livestream", string]

export const buildDialogLink = (
   router: NextRouter,
   livestreamId: string,
   jobId: string = null
): LinkProps["href"] => {
   const isOnLivestreamDialogPage = isOnlivestreamDialogPage(router.pathname)
   const query: ValidLink = jobId
      ? ["livestream", livestreamId, "job-details", jobId]
      : ["livestream", livestreamId]

   return {
      pathname: isOnLivestreamDialogPage
         ? router.pathname
         : `/portal/${LIVESTREAM_DIALOG_PATH}`,
      query: {
         ...router.query,
         livestreamDialog: query,
      },
   }
}
