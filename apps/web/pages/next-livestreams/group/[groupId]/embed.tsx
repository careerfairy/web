import React, { useCallback, useEffect, useMemo, useState } from "react"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import { NEXT_LIVESTREAMS_PATH, PRODUCTION_BASE_URL } from "constants/routes"
import HeadWithMeta from "components/page/HeadWithMeta"
import { useTheme } from "@mui/material/styles"
import ScrollToTop from "../../../../components/views/common/ScrollToTop"
import EmbedBannerSection from "../../../../components/views/common/NextLivestreams/emebed/EmbedBannerSection"
import StreamsSwipeableView from "../../../../components/views/common/NextLivestreams/emebed/StreamsSwipeableView"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { LivestreamEventSerialized } from "@careerfairy/shared-lib/dist/livestreams"
import { groupRepo, livestreamRepo } from "../../../../data/RepositoryInstances"

{
   /*TODO Example link for embedding here
    * Example link:
    * https://careerfairy.io/next-livestreams/[groupId]/embed
    * */
}
{
   /*TODO fix speaker info text overflow*/
}
{
   /*<iframe frameBorder="0" height="600" src="https://personal-habib.web.app/next-livestreams/GXW3MtpTehSmAe0aP1J4/embed" title="Events"/>*/
}

interface EmbedProps {
   serverSideGroup: Omit<Group, "adminEmails" | "adminEmail">
   serverSideUpcomingEvents: LivestreamEventSerialized[]
   serverSidePastEvents: LivestreamEventSerialized[]
}

const EmbeddedGroupStreamsPage = ({
   serverSideGroup,
   serverSidePastEvents,
   serverSideUpcomingEvents,
}: EmbedProps) => {
   const {
      palette: { primary },
   } = useTheme()
   const [value, setValue] = useState("upcomingEvents")
   const [upcomingEvents] = useState(
      serverSideUpcomingEvents.map(livestreamRepo.parseSerializedEvent)
   )
   const [pastEvents] = useState(
      serverSidePastEvents.map(livestreamRepo.parseSerializedEvent)
   )

   const [selectedOptions, setSelectedOptions] = useState([])

   useEffect(() => {
      // Only find tab with streams if there isn't a livestreamId in query
      ;(function handleFindTabWithStreams() {
         if (
            !serverSideUpcomingEvents?.length &&
            serverSidePastEvents?.length
         ) {
            showPastEvents()
         } else {
            showUpcomingEvents()
         }
      })()
   }, [Boolean(upcomingEvents), Boolean(pastEvents), serverSideGroup.groupId])

   const showPastEvents = () => setValue("pastEvents")
   const showUpcomingEvents = () => setValue("upcomingEvents")

   const metaInfo = useMemo(
      () => ({
         description: serverSideGroup.description,
         title: `CareerFairy | Next Livestreams of ${serverSideGroup.universityName}`,
         image: getResizedUrl(serverSideGroup.logoUrl, "lg"),
         fullPath: `${PRODUCTION_BASE_URL}${NEXT_LIVESTREAMS_PATH}/${serverSideGroup.groupId}`,
      }),
      [serverSideGroup]
   )

   const handleChange = useCallback((event, newValue) => {
      setValue(newValue)
   }, [])

   return (
      <React.Fragment>
         <HeadWithMeta {...metaInfo} />
         <div>
            <EmbedBannerSection
               tabsColor={primary.dark}
               backgroundColor={"transparent"}
               handleChange={handleChange}
               value={value}
            />
            <StreamsSwipeableView
               value={value}
               upcomingLivestreams={upcomingEvents}
               setSelectedOptions={setSelectedOptions}
               selectedOptions={selectedOptions}
               currentGroup={serverSideGroup}
               pastLivestreams={pastEvents}
            />
         </div>
         <ScrollToTop size="small" />
      </React.Fragment>
   )
}

export async function getServerSideProps({ query: { groupId } }) {
   if (!groupId)
      return {
         notFound: true,
      }
   let serializedUpcomingEvents = []
   let serializedPastEvents = []

   const serverSideGroup = await groupRepo.getGroupById(groupId)
   if (!serverSideGroup) {
      return {
         notFound: true,
      }
   }
   const cleanGroup = groupRepo.cleanAndSerializeGroup(serverSideGroup)
   const [upcomingEvents, pastEvents] = await Promise.all([
      livestreamRepo.getEventsOfGroup(cleanGroup.groupId, "upcoming", {
         hideHidden: Boolean(serverSideGroup.hidePrivateEventsFromEmbed),
      }),
      livestreamRepo.getEventsOfGroup(cleanGroup.groupId, "past", {
         hideHidden: Boolean(serverSideGroup.hidePrivateEventsFromEmbed),
      }),
   ])
   if (upcomingEvents) {
      serializedUpcomingEvents = upcomingEvents.map((event) =>
         livestreamRepo.serializeEvent(event)
      )
   }
   if (pastEvents) {
      serializedPastEvents = pastEvents.map((event) =>
         livestreamRepo.serializeEvent(event)
      )
   }

   return {
      props: {
         serverSideGroup: cleanGroup,
         serverSideUpcomingEvents: serializedUpcomingEvents,
         serverSidePastEvents: serializedPastEvents,
         groupId,
      },
   }
}

export default EmbeddedGroupStreamsPage
