import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { ButtonBase, ButtonBaseProps, Typography } from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { sxStyles } from "types/commonTypes"
import { getFormattedName } from "../../util"

const styles = sxStyles({
   root: {
      display: "grid",
      gap: "12px",
      flexDirection: "column",
      fontFamily: "inherit",
      placeItems: "center",
   },
   name: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      minWidth: 0,
      maxWidth: "100%",
   },
})

type Props = {
   onClick: ButtonBaseProps["onClick"]
   speaker: Speaker
}

export const SpeakerButton = ({ onClick, speaker }: Props) => {
   return (
      <ButtonBase sx={styles.root} onClick={onClick}>
         <CircularLogo
            src={speaker.avatar}
            size={80}
            alt={speaker.firstName}
            objectFit="cover"
         />
         <Typography sx={styles.name} color="neutral.700" variant="medium">
            {getFormattedName(speaker.firstName, speaker.lastName)}
         </Typography>
      </ButtonBase>
   )
}
