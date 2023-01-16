import React from "react"
import WhatshotIcon from "@mui/icons-material/Whatshot"
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople"
import LanguageIcon from "@mui/icons-material/Language"
import { Chip, Tooltip } from "@mui/material"
import ConditionalWrapper from "../../../../ConditionalWrapper"

const styles = {
   warningChip: {
      backgroundColor: (theme) => theme.palette.warning.main,
      color: (theme) => theme.palette.common.white,
   },
   badgeWhite: {
      color: (theme) => theme.palette.common.white,
      borderColor: (theme) => theme.palette.common.white,
      backgroundColor: "transparent",
   },
}

export const LimitedRegistrationsBadge = ({
   numberOfSpotsRemaining,
   white,
   sx,
   ...resProps
}) => {
   const MIN_NUMBER_OF_DISPLAYED_SPOTS = 10
   return (
      <Chip
         icon={<WhatshotIcon style={{ color: "white" }} />}
         sx={[styles.warningChip, white && styles.badgeWhite, sx]}
         variant={white && "outlined"}
         label={
            numberOfSpotsRemaining < MIN_NUMBER_OF_DISPLAYED_SPOTS
               ? `${numberOfSpotsRemaining} spots left`
               : "Limited spots!"
         }
         {...resProps}
      />
   )
}

export const InPersonEventBadge = ({ white, sx, ...resProps }) => {
   return (
      <Chip
         icon={<EmojiPeopleIcon style={{ color: "white" }} />}
         label="In-Person Event"
         sx={[white && styles.badgeWhite, sx]}
         variant={white && "outlined"}
         color="secondary"
         {...resProps}
      />
   )
}

export const LanguageBadge = ({
   streamLanguage,
   white,
   sx,
   noTip = false,
   ...restProps
}) => {
   return streamLanguage ? (
      <ConditionalWrapper
         condition={!Boolean(noTip)}
         wrapper={(children) => (
            <Tooltip
               placement="top"
               arrow
               title={noTip ? "" : `This event is in ${streamLanguage.name}`}
            >
               {children}
            </Tooltip>
         )}
      >
         <Chip
            icon={<LanguageIcon />}
            label={streamLanguage.code.toUpperCase()}
            sx={[white && styles.badgeWhite, sx]}
            variant={white && "outlined"}
            color="info"
            {...restProps}
         />
      </ConditionalWrapper>
   ) : null
}
