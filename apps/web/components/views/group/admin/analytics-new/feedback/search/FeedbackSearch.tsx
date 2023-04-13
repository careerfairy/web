import React, { FC, useCallback } from "react"
import { Card, Divider } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import LivestreamSearch, {
   LivestreamHit,
} from "../../../common/LivestreamSearch"
import Stack from "@mui/material/Stack"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import { useFeedbackPageContext } from "../FeedbackPageProvider"

const styles = sxStyles({
   root: {
      flex: 1,
      display: "flex",
   },
   stack: {
      flex: 1,
   },
})

type Props = {}

const FeedbackSearch: FC<Props> = (props) => {
   const isMobile = useIsMobile()
   const { feedbackDialogProps, handleOpenFeedbackDialog } =
      useFeedbackPageContext()
   console.log("-> feedbackDialogProps", feedbackDialogProps)

   const handleChange = useCallback(
      (hit: LivestreamHit | null) => {
         if (hit) {
            handleOpenFeedbackDialog(hit.id)
         }
      },
      [handleOpenFeedbackDialog]
   )

   return (
      <Card sx={styles.root}>
         <Stack
            sx={styles.stack}
            direction={isMobile ? "column" : "row"}
            spacing={2}
            divider={
               <Divider
                  flexItem
                  orientation={isMobile ? "horizontal" : "vertical"}
               />
            }
         >
            <LivestreamSearch handleChange={handleChange} value={null} />
         </Stack>
      </Card>
   )
}

export default FeedbackSearch
