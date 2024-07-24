import { Link2 } from "react-feather"
import { useStreamingContext } from "../../context"
import { HostCTAView } from "../call-to-action/HostCTAView"
import { SidePanelView } from "./SidePanelView"

export const CTAPanel = () => {
   const { isHost } = useStreamingContext()

   return (
      <SidePanelView id="cta-panel" title="Call to action" icon={<Link2 />}>
         {isHost ? <HostCTAView /> : "content"}
      </SidePanelView>
   )
}
