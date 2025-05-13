import Skeleton from "@mui/material/Skeleton"
import Typography from "@mui/material/Typography"
import { FC, ReactNode } from "react"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   eventTitle: {
      fontWeight: 700,
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
         variant={"brandedH1"}
         sx={styles.eventTitle}
         data-testid={"livestream-dialog-title"}
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
