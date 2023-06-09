import { FC } from "react"
import LiveIcon from "@mui/icons-material/RadioButtonChecked"
import { Chip, Stack } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { useLiveStreamDialog } from "components/views/livestream-dialog/LivestreamDialog"

const styles = sxStyles({
   root: {
      position: "absolute",
      top: 0,
      left: 0,
      padding: 1,
      width: "calc(100% - 100px)", // to not overlap with the share/close button
   },
})

const HeroTags: FC = () => {
   const { livestreamPresenter } = useLiveStreamDialog()

   return (
      <Stack sx={styles.root} spacing={1} direction="row">
         {livestreamPresenter.isLive() ? (
            <Chip icon={<LiveIcon />} color="error" label={"LIVE"} />
         ) : null}
      </Stack>
   )
}

export default HeroTags
