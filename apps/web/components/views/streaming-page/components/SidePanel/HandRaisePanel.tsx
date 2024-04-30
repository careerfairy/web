import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { HostHandRaiseView } from "../hand-raise/HandRaiseView"
import { SidePanelView } from "./SidePanelView"

import { HandRaiseIcon } from "components/views/common/icons"

const styles = sxStyles({
   root: {
      p: 0,
   },
})

export const HandRaisePanel = () => {
   const { isHost } = useStreamingContext()

   if (!isHost) {
      // This view is only for the host
      return null
   }

   return (
      <SidePanelView
         id="hand-raise-panel"
         title="Hand raise"
         icon={<HandRaiseIcon />}
         contentWrapperStyles={styles.root}
      >
         <HostHandRaiseView />
      </SidePanelView>
   )
}
