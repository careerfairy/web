import { FC, ReactNode } from "react"
import Typography from "@mui/material/Typography"
import { sxStyles } from "../../../../../types/commonTypes"
import Skeleton from "@mui/material/Skeleton"

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

const LivestreamTitle: FC<Props> = (props) => {
   return (
      <Typography
         align="center"
         variant={"h2"}
         component="h1"
         sx={styles.eventTitle}
      >
         {props.text}
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
