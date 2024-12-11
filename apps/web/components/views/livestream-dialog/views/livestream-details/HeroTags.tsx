import LiveIcon from "@mui/icons-material/RadioButtonChecked"
import { Chip, Stack } from "@mui/material"
import { useLiveStreamDialog } from "components/views/livestream-dialog/LivestreamDialog"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "absolute",
      top: 0,
      left: { xs: "35px", md: 0 },
      padding: 1,
      width: "calc(100% - 100px)", // to not overlap with the share/close button
   },
   chip: {
      margin: "4px !important",
   },
})

const HeroTags: FC = () => {
   const { livestreamPresenter } = useLiveStreamDialog()

   return (
      <Stack sx={styles.root} spacing={1} direction="row">
         {livestreamPresenter.isLive() ? (
            <Chip
               icon={<LiveIcon />}
               color="error"
               label={"LIVE"}
               sx={styles.chip}
            />
         ) : null}
      </Stack>
   )
}

export default HeroTags
