import { sxStyles } from "@careerfairy/shared-ui"
import Typography from "@mui/material/Typography"
import { ReactNode } from "react"
import StaticSkeleton from "./StaticSkeleton"

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
   return text ? (
      <Typography
         align="center"
         variant={"h3"}
         component="h1"
         sx={styles.eventTitle}
      >
         {text}
      </Typography>
   ) : (
      <LivestreamTitleSkeleton />
   )
}

const LivestreamTitleSkeleton = () => {
   return (
      <LivestreamTitle
         text={
            <>
               <StaticSkeleton sx={styles.skeletonText} width="80%" />
               <StaticSkeleton sx={styles.skeletonText} width="40%" />
            </>
         }
      />
   )
}

export default LivestreamTitle
