import { Typography } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      color: "neutral.800",
      fontWeight: 600,
      mb: 2,
   },
})

type Props = {
   children: ReactNode
}

export const Heading = ({ children }: Props) => {
   const streamIsMobile = useStreamIsMobile()
   return (
      <Typography
         sx={styles.root}
         variant={streamIsMobile ? "medium" : "brandedH5"}
         component="h5"
      >
         {children}
      </Typography>
   )
}
