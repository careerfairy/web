import useCollection from "./useCollection"
import { LiveStreamEvent } from "../../types/event"
import livestreamRepo, {
   LivestreamsDataParser,
} from "../../data/firebase/LivestreamRepository"

const useListenToUpcomingStreams = () => {
   const query = livestreamRepo.upcomingEventsQuery()

   let { data, isLoading } = useCollection<LiveStreamEvent>(query, true)

   if (isLoading) return undefined

   return new LivestreamsDataParser(data)
      .removeEndedEvents()
      .complementaryFields()
      .get()
}

export default useListenToUpcomingStreams
