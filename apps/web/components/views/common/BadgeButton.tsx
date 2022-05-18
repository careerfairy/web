import { Button, Tooltip } from "@mui/material"
import React, { memo } from "react"
import { Badge } from "@careerfairy/shared-lib/dist/badges/badges"
import BadgeIcon from "../common/BadgeIcon"
import isEqual from "react-fast-compare"

const styles = {
   disabled: {
      filter: "grayscale(1)",
   },
   noLink: {
      cursor: "default",
   },
}

const defaultActiveTooltip = (badge: Badge) =>
   `You've been granted the ${badge.name} Level ${badge.level} Badge! (${badge.requirements[0].description}) Congrats!`
const defaultInactiveTooltip = (badge: Badge) =>
   `You need to ${badge.requirements[0].description} to activate this badge.`

const BadgeButton = ({
   badge,
   isActive = true,
   onClick,
   showIcon = true,
   showBadgeSuffix = true,
   onlyIcon = false,
   activeTooltip = defaultActiveTooltip,
   inactiveTooltip = defaultInactiveTooltip,
   badgeIconProps = {},
   buttonProps = {},
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

   return (
      <Tooltip title={title}>
         <span>
            {onlyIcon ? (
               <Button
                  sx={buttonStyles}
                  disableRipple={!onClick}
                  onClick={onClick}
                  {...buttonProps}
               >
                  <BadgeIcon badgeKey={badge.key} {...badgeIconProps} />
               </Button>
            ) : (
               <Button
                  startIcon={
                     showIcon && (
                        <BadgeIcon badgeKey={badge.key} {...badgeIconProps} />
                     )
                  }
                  sx={buttonStyles}
                  disableRipple={!onClick}
                  onClick={onClick}
                  {...buttonProps}
               >
                  {badge.name}
                  {showBadgeSuffix && " Badge"}
               </Button>
            )}
         </span>
      </Tooltip>
   )
}

type Props = {
   badge: Badge
   isActive?: boolean
   onClick?: () => {}
   showIcon?: boolean
   showBadgeSuffix?: boolean
   onlyIcon?: boolean
   activeTooltip?: (badge: Badge) => string
   inactiveTooltip?: (badge: Badge) => string
   badgeIconProps?: any
   buttonProps?: any
}

export default memo(BadgeButton, isEqual)
