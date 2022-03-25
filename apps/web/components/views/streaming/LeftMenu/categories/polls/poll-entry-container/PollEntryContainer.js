import React from "react"
import UpcomingPollStreamer from "./upcoming-poll/UpcomingPollStreamer"
import CurrentPollStreamer from "./current-poll/CurrentPollStreamer"

function PollEntryContainer(props) {
   if (props.poll.state === "upcoming") {
      return <UpcomingPollStreamer {...props} />
   }
   if (props.poll.state === "current") {
      return <CurrentPollStreamer {...props} />
   }
}

export default PollEntryContainer
