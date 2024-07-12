import { Badge } from "@careerfairy/shared-lib/badges/badges"
import { Button, Tooltip } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import { memo } from "react"
import isEqual from "react-fast-compare"
import BadgeIcon from "../common/BadgeIcon"

const styles = {
   disabled: {
      filter: "grayscale(1)",
   },
   noLink: {
      cursor: "default",
   },
}

const defaultActiveTooltip = (badge: Badge) =>
   `You've been granted the ${badge?.name} Level ${badge?.level} Badge! (${badge?.requirements[0].description}) Congrats!`
const defaultInactiveTooltip = (badge: Badge) =>
   `You need to ${badge?.requirements[0].description} to activate this badge.`

const BadgeButton = ({
   badge,
   isActive = true,
   onClick,
   showIcon = true,
   showBadgeSuffix = true,
   onlyIcon = false,
   activeTooltip = defaultActiveTooltip,
   inactiveTooltip = defaultInactiveTooltip,
   // eslint-disable-next-line react/no-object-type-as-default-prop
   badgeIconProps = {},
   // eslint-disable-next-line react/no-object-type-as-default-prop
   buttonProps = {},
   iconButton = false,
}: Props) => {
   buttonProps = Object.assign({ variant: "outlined" }, buttonProps)

   const title = isActive ? activeTooltip(badge) : inactiveTooltip(badge)

   let buttonStyles = isActive ? {} : styles.disabled
   if (!onClick) {
      buttonStyles = { ...buttonStyles, ...styles.noLink }
   }

   // add styles to incoming sx object
   if (buttonProps.sx) {
      buttonProps.sx = Object.assign(buttonProps.sx, buttonStyles)
   }

   let content = onlyIcon ? (
      <Button
         sx={buttonStyles}
         disableRipple={!onClick}
         onClick={onClick}
         {...buttonProps}
      >
         <BadgeIcon badgeKey={badge?.key} {...badgeIconProps} />
      </Button>
   ) : (
      <Button
         startIcon={
            Boolean(showIcon) && (
               <BadgeIcon badgeKey={badge?.key} {...badgeIconProps} />
            )
         }
         sx={buttonStyles}
         disableRipple={!onClick}
         onClick={onClick}
         {...buttonProps}
      >
         {badge?.name}
         {Boolean(showBadgeSuffix) && " Badge"}
      </Button>
   )

   if (iconButton) {
      content = (
         <IconButton
            sx={buttonStyles}
            disableRipple={!onClick}
            onClick={onClick}
            {...buttonProps}
         >
            <BadgeIcon badgeKey={badge?.key} {...badgeIconProps} />
         </IconButton>
      )
   }

   return (
      <Tooltip title={title}>
         <span>{content}</span>
      </Tooltip>
   )
}

type Props = {
   badge: Badge
   isActive?: boolean
   onClick?: () => any
   showIcon?: boolean
   showBadgeSuffix?: boolean
   onlyIcon?: boolean
   activeTooltip?: (badge: Badge) => string
   inactiveTooltip?: (badge: Badge) => string
   badgeIconProps?: any
   buttonProps?: any
   iconButton?: boolean
}

export default memo(BadgeButton, isEqual)
