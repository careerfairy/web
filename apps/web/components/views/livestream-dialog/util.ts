import { GetServerSidePropsContext } from "next"
import {
   getServerSideStream,
   getServerSideUserStats,
   getUserTokenFromCookie,
} from "../../../util/serverUtil"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { LiveStreamDialogData } from "./LivestreamDialogLayout"

export const getLivestreamDialogData = async (
   ctx: GetServerSidePropsContext
): Promise<LiveStreamDialogData> => {
   const livestreamPrams = (ctx.params.livestreamDialog as string[]) || []
   const token = getUserTokenFromCookie({ req: ctx.req })

   if (livestreamPrams[0] === "livestream" && livestreamPrams[1]) {
      const [stream, serverSideUserStats] = await Promise.all([
         getServerSideStream(livestreamPrams[1]),
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
   return null
}

export const withLivestreamDialogData = <
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
