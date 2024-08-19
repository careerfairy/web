import { Speaker } from "@careerfairy/shared-lib/livestreams"
import {
   Box,
   ButtonBase,
   ButtonBaseProps,
   Grow,
   TooltipProps,
   Typography,
   alpha,
} from "@mui/material"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { Edit2 } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { getFormattedName } from "../../util"
import { BrandedTooltip } from "../BrandedTooltip"

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
         transition: theme.transitions.create(["filter", "opacity"]),
         opacity: 1,
      },
      position: "relative",
   }),
   greyedOut: {
      "& img": {
         filter: "grayscale(100%)",
         opacity: 0.4,
      },
      color: "neutral.300",
   },
   name: (theme) => ({
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "100%",
      color: "inherit",
      transition: theme.transitions.create("color"),
   }),
   avatar: {
      border: "1px solid #EDE7FD",
      position: "relative",
   },
   editOverlay: (theme) => ({
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      background: alpha(theme.palette.common.black, 0.5),
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      "& svg": {
         color: theme.palette.common.white,
         width: 24,
         height: 24,
      },
      zIndex: 0,
   }),
})

type Props = {
   onClick: ButtonBaseProps["onClick"]
   speaker: Pick<Speaker, "id" | "firstName" | "lastName" | "avatar">
   profileInUse?: boolean
   isEditMode?: boolean
}

export const HostProfileButton = ({
   onClick,
   speaker,
   profileInUse,
   isEditMode,
}: Props) => {
   return (
      <BrandedTooltip
         title={profileInUse ? "This profile is already in use!" : null}
         slotProps={tooltipOffsetProps}
      >
         <ButtonBase
            sx={[styles.root, profileInUse && styles.greyedOut]}
            onClick={onClick}
         >
            <CircularLogo
               src={speaker.avatar}
               size={80}
               alt={speaker.firstName}
               objectFit="cover"
               sx={styles.avatar}
            >
               <Grow in={isEditMode}>
                  <Box sx={styles.editOverlay}>
                     <Edit2 />
                  </Box>
               </Grow>
            </CircularLogo>
            <Typography sx={styles.name} variant="medium">
               {getFormattedName(speaker.firstName, speaker.lastName)}
            </Typography>
         </ButtonBase>
      </BrandedTooltip>
   )
}

const tooltipOffsetProps: TooltipProps["slotProps"] = {
   popper: {
      modifiers: [{ name: "offset", options: { offset: [0, -13] } }],
   },
}
