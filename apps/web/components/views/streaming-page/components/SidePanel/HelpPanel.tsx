import { HelpCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { CrispChat } from "../help/CrispChat"
import { SidePanelView } from "./SidePanelView"

const styles = sxStyles({
   helpPanel: {
      p: 0,
   },
})

export const HelpPanel = () => {
   return (
      <SidePanelView
         id="help-panel"
         title="Help"
         icon={<HelpCircle />}
         contentWrapperStyles={styles.helpPanel}
      >
         <CrispChat />
      </SidePanelView>
   )
}
