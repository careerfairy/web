import { sxStyles } from "@careerfairy/shared-ui"
import Box from "@mui/material/Box"
import { ReactNode } from "react"

const styles = sxStyles({
   root: {
      width: "100%",
   },
})

type Props = {
   children: ReactNode
   navOffset?: number
}

const Section = ({ navOffset = 55, children }: Props) => {
   return (
      <Box sx={styles.root} pt={`${navOffset}px`}>
         {children}
      </Box>
   )
}

export default Section
