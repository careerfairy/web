import { Collapse } from "@mui/material"
import { ReactNode } from "react"
import FramerBox from "../../common/FramerBox"
import { growAndFadeAnimation } from "../components/end-of-module/animations"

interface AnimatedCollapseProps {
   children: ReactNode
   show: boolean
}

export const AnimatedCollapse = ({ children, show }: AnimatedCollapseProps) => {
   return (
      <Collapse in={show} mountOnEnter unmountOnExit>
         <FramerBox {...growAndFadeAnimation}>{children}</FramerBox>
      </Collapse>
   )
}
