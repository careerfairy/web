import { forwardRef, ReactNode } from "react"
import { sxStyles } from "../../../../../../types/commonTypes"
import Box from "@mui/material/Box"

const styles = sxStyles({
   root: {
      width: "100%",
   },
})

type Props = {
   children: ReactNode
   navOffset?: number
}

const Section = forwardRef<HTMLDivElement, Props>(function Section(
   { children, navOffset = 55 },
   ref
) {
   return (
      <Box
         sx={[
            styles.root,
            {
               pt: `calc(${navOffset}px)`,
            },
         ]}
         ref={ref}
      >
         {children}
      </Box>
   )
})

export default Section
