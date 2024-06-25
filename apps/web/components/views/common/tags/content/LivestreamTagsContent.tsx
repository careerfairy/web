import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Button, Stack } from "@mui/material"

type Props = {
   events: LivestreamEvent[]
   onSeeMore: () => void
}
// TODO: Use for coming up and past
export const UpcomingLivestreamTagsContent = (props: Props) => {
   //  const { data: upcomingEvents } = useLivestreamsByTags({
   //     type: "upcomingEvents",
   //     tags: tags,
   //     limit: 6,
   //  })
   // TODO: move to category tags content
   return <LivestreamTagsContent {...props} title="Upcoming Events" />
}

export const PastLivestreamTagsContent = (props: Props) => {
   // const { data: pastEvents } = useLivestreamsByTags({
   //     type: "pastEvents",
   //     tags: tags,
   //     limit: 6,
   //  })
   // TODO: move to category tags content
   return <LivestreamTagsContent {...props} title="Past Events" />
}

type LivestreamTagsContentProps = {
   title: string
   events: LivestreamEvent[]
   onSeeMore: () => void
}

// TODO: pass limit
const LivestreamTagsContent = ({
   events,
   title,
   onSeeMore,
}: LivestreamTagsContentProps) => {
   console.log(
      "🚀 ~ LivestreamTagsContent ~" + title + "events:",
      events?.map((e) => e.id)
   )

   return (
      <>
         <h4>
            HI THERE: {title} - with {events?.length} events
         </h4>
         {events?.map((e, i) => {
            return (
               <Stack direction={"row"} key={i}>
                  <h5>{e.id}</h5>
                  <h6>BF: {e?.businessFunctionsTagIds}</h6>
                  <h6>CT: {e?.contentTopicsTagIds}</h6>
                  <h6>LG: {e.language?.code}</h6>
               </Stack>
            )
         })}
         <Button onClick={onSeeMore}> See more 2</Button>
      </>
   )
}

// const Loader = () => {
//    return (
//       <>
//          <h1>TODO SKELETON</h1>
//       </>
//    )
// }
