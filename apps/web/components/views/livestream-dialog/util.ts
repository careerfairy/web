import { GetServerSidePropsContext } from "next"
import { getServerSideStream } from "../../../util/serverUtil"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"

export const getLivestreamDialogData = async (
   ctx: GetServerSidePropsContext
): Promise<{ [p: string]: any } | null> => {
   const livestreamParams = (ctx.params.livestreamDialog as string[]) || []

   if (livestreamParams[0] === "livestream" && livestreamParams[1]) {
      const stream = await getServerSideStream(livestreamParams[1])
      return stream ? LivestreamPresenter.serializeDocument(stream) : null
   }
   return null
}

export const livestreamDialogSSP = <
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
