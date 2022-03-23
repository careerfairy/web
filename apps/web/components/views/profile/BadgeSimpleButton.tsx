import { Button, Tooltip, useMediaQuery } from "@mui/material"
import React from "react"
import { Badge } from "@careerfairy/shared-lib/dist/badges"
import BadgeIcon from "../common/BadgeIcon"

const styles = {
   disabled: {
      filter: "grayscale(1)",
   },
}

const BadgeSimpleButton = ({ badge, isActive, onClick }: Props) => {
   const title = isActive
      ? `You've been granted the ${badge.name} Badge! (${badge.achievementDescription}) Congrats!`
      : `You need to ${badge.achievementDescription} to activate this badge.`

   const isXS = useMediaQuery((theme: any) => theme.breakpoints.down("sm"))

   return (
      <Tooltip title={title}>
         <span>
            {isXS ? (
               <Button
                  variant="outlined"
                  sx={isActive ? {} : styles.disabled}
                  onClick={onClick}
               >
                  <BadgeIcon badgeKey={badge.key} />
               </Button>
            ) : (
               <Button
                  variant="outlined"
                  startIcon={<BadgeIcon badgeKey={badge.key} />}
                  sx={isActive ? {} : styles.disabled}
                  onClick={onClick}
               >
                  {badge.name} Badge
               </Button>
            )}
         </span>
      </Tooltip>
   )
}

type Props = {
   badge: Badge
   isActive: boolean
   onClick?: () => {}
}

export default BadgeSimpleButton
