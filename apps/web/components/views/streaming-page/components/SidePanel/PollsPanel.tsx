import React, { useState } from "react"
import { SidePanelView } from "./SidePanelView"
import { PollIcon } from "components/views/common/icons"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { PollCreationButton } from "../polls/PollCreationButton"
import { CreateOrEditPollForm } from "../polls/CreateOrEditPollForm"

const styles = sxStyles({
   contentWrapperViewer: {
      px: 2,
      py: 1.5,
   },
   contentWrapperHost: {
      p: 1.5,
   },
})

export const PollsPanel = () => {
   const { isHost } = useStreamingContext()
   const [isCreatePollOpen, setIsCreatePollOpen] = useState(false)

   return (
      <SidePanelView
         contentWrapperStyles={
            isHost ? styles.contentWrapperHost : styles.contentWrapperViewer
         }
         id="polls-panel"
         title="Polls"
         icon={<PollIcon />}
      >
         {isHost ? (
            <PollCreationButton onClick={() => setIsCreatePollOpen(true)} />
         ) : null}
         {isCreatePollOpen && isHost ? <CreateOrEditPollForm /> : null}
         content
      </SidePanelView>
   )
}
