import { GroupedTags } from "@careerfairy/shared-lib/constants/tags"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamsByTags } from "components/custom-hook/tags/useLivestreamsByTags"

type Props = {
   tags: GroupedTags
}
// TODO: Use for coming up and past
export const UpcomingLivestreamTagsContent = ({ tags }: Props) => {
   // TODO: move to category tags content
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <LivestreamTagsContent type="upcomingEvents" tags={tags} />
      </SuspenseWithBoundary>
   )
}

type LivestreamTagsContentProps = {
   type: "upcomingEvents" | "pastEvents"
   tags: GroupedTags
}

// TODO: pass limit
const LivestreamTagsContent = ({ type, tags }: LivestreamTagsContentProps) => {
   const { data } = useLivestreamsByTags({
      type: "pastEvents",
      tags: tags,
      limit: 996,
   })
   console.log(
      "🚀 ~ LivestreamTagsContent ~ events:",
      type,
      data.map((e) => e.id)
   )

   return (
      <>
         <h5>HI THERE</h5>
      </>
   )
}

const Loader = () => {
   return (
      <>
         <h1>TODO SKELETON</h1>
      </>
   )
}
