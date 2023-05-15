import { GetServerSidePropsContext } from "next"
import {
   getServerSideStream,
   getServerSideUserStats,
   getUserTokenFromCookie,
} from "../../../util/serverUtil"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { LiveStreamDialogData } from "./LivestreamDialogLayout"
import { errorLogAndNotify } from "../../../util/CommonUtil"

export const getLivestreamDialogData = async (
   ctx: GetServerSidePropsContext
): Promise<LiveStreamDialogData> => {
   try {
      const livestreamParams = (ctx.params.livestreamDialog as string[]) || []
      const token = getUserTokenFromCookie({ req: ctx.req })

      if (livestreamParams[0] === "livestream" && livestreamParams[1]) {
         const [stream, serverSideUserStats] = await Promise.all([
            getServerSideStream(livestreamParams[1]),
            getServerSideUserStats(token.email),
         ])

         return {
            serverSideLivestream: stream
               ? LivestreamPresenter.serializeDocument(stream)
               : null,
            serverSideUserEmail: token?.email ?? null,
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
