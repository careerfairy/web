import { forwardRef, ReactNode } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import Box from "@mui/material/Box"

const styles = sxStyles({
   root: {
      width: "100%",
      pt: "calc(55px)",
   },
})

type Props = {
   children: ReactNode
}

const NavBarOffsetElement = forwardRef<HTMLDivElement, Props>(
   function NavBarOffsetElement({ children }, ref) {
      return (
         <Box sx={styles.root} ref={ref}>
            {children}
         </Box>
      )
   }
)

export default NavBarOffsetElement
