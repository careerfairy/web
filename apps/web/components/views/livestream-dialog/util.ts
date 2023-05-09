import { GetServerSidePropsContext } from "next"
import { getServerSideStream } from "../../../util/serverUtil"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"

export const getLivestreamDialogData = async (
   ctx: GetServerSidePropsContext
): Promise<{ [p: string]: any } | null> => {
   const livestreamPrams = (ctx.params.livestream as string[]) || []

   if (livestreamPrams[0] === "livestream" && livestreamPrams[1]) {
      const stream = await getServerSideStream(livestreamPrams[1])
      return stream ? LivestreamPresenter.serializeDocument(stream) : null
   }
   return null
}

export const withLivestreamDialogData = <
   TContext extends GetServerSidePropsContext
>() => {
   return async (ctx: TContext) => {
      return {
         props: {
            serverSideLivestream: await getLivestreamDialogData(ctx),
         },
      }
   }
}
