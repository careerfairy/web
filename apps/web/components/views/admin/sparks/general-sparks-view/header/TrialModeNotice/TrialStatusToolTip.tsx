import StyledToolTip from "materialUI/GlobalTooltips/StyledToolTip"
import { ReactElement } from "react"
import { sxStyles } from "types/commonTypes"

import TrialStatusContent from "./TrialStatusContent"

const styles = sxStyles({
   tooltip: {
      p: 2.5,
      maxWidth: 456,
   },
   popper: {
      maxWidth: 456,
      width: "100%",
   },
})

type Props = {
   children: ReactElement
   disabled: boolean
}

const TrialStatusToolTip = ({ children, disabled }: Props) => {
   return (
      <StyledToolTip
         componentsProps={{
            tooltip: { sx: styles.tooltip },
            popper: { sx: styles.popper },
         }}
         title={<TrialStatusContent />}
         open={disabled ? false : undefined}
      >
         {children}
      </StyledToolTip>
   )
}

export default TrialStatusToolTip
