import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { ButtonBase, ButtonBaseProps, Typography } from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { sxStyles } from "types/commonTypes"
import { getFormattedName } from "../../util"

const styles = sxStyles({
   root: (theme) => ({
      display: "grid",
      gap: "12px",
      flexDirection: "column",
      fontFamily: "inherit",
      placeItems: "center",
      borderRadius: "12px",
      p: 1,
      m: -1,
      transition: theme.transitions.create("transform"),
      "&:hover, &:focus": {
         transform: "scale(1.05)",
      },
      color: "neutral.700",
      "& img": {
         opacity: 1,
         transition: theme.transitions.create(["filter", "opacity"]),
      },
   }),
   name: (theme) => ({
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "100%",
      color: "inherit",
      transition: theme.transitions.create("color"),
   }),
   greyedOut: {
      "& img": {
         filter: "grayscale(100%)",
         opacity: 0.4,
      },
      color: "neutral.300",
   },
   avatar: {
      border: "1px solid #EDE7FD",
   },
})

type Props = {
   onClick: ButtonBaseProps["onClick"]
   speaker: Pick<Speaker, "id" | "firstName" | "lastName" | "avatar">
   greyedOut?: boolean
}

export const SpeakerButton = ({ onClick, speaker, greyedOut }: Props) => {
   return (
      <ButtonBase
         sx={[styles.root, greyedOut && styles.greyedOut]}
         onClick={onClick}
      >
         <CircularLogo
            src={speaker.avatar}
            size={80}
            alt={speaker.firstName}
            objectFit="cover"
            sx={styles.avatar}
         />
         <Typography sx={styles.name} variant="medium">
            {getFormattedName(speaker.firstName, speaker.lastName)}
         </Typography>
      </ButtonBase>
   )
}
