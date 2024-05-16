import { sxStyles } from "@careerfairy/shared-ui"
import Skeleton from "@mui/material/Skeleton"
import Typography from "@mui/material/Typography"
import { ReactNode } from "react"

const styles = sxStyles({
   eventTitle: {
      fontWeight: 600,
      textAlign: "center",
      maxWidth: 750,
      width: "100%",
   },
   skeletonText: {
      mx: "auto",
   },
})

type Props = {
   text: string | ReactNode
}

const LivestreamTitle = ({ text }: Props) => {
   return (
      <Typography
         align="center"
         variant={"h3"}
         component="h1"
         sx={styles.eventTitle}
      >
         {text}
      </Typography>
   )
}

export const LivestreamTitleSkeleton = () => {
   return (
      <LivestreamTitle
         text={
            <>
               <Skeleton sx={styles.skeletonText} width="80%" />
               <Skeleton sx={styles.skeletonText} width="40%" />
            </>
         }
      />
   )
}

export default LivestreamTitle
