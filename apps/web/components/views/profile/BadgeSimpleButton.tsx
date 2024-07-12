import { Badge } from "@careerfairy/shared-lib/badges/badges"
import { Button, Tooltip, useMediaQuery } from "@mui/material"
import BadgeIcon from "../common/BadgeIcon"

const styles = {
   disabled: {
      filter: "grayscale(1)",
   },
   noLink: {
      cursor: "default",
   },
}

const BadgeSimpleButton = ({ badge, isActive, onClick }: Props) => {
   const title = isActive
      ? `You've been granted the ${badge.name} Badge! (${badge.requirements[0].description}) Congrats!`
      : `You need to ${badge.requirements[0].description} to activate this badge.`

   const isXS = useMediaQuery((theme: any) => theme.breakpoints.down("sm"))

   let buttonStyles = isActive ? {} : styles.disabled
   if (!onClick) {
      buttonStyles = { ...buttonStyles, ...styles.noLink }
   }

   return (
      <Tooltip title={title}>
         <span>
            {isXS ? (
               <Button
                  variant="outlined"
                  sx={buttonStyles}
                  disableRipple={!onClick}
                  onClick={onClick}
               >
                  <BadgeIcon badgeKey={badge.key} />
               </Button>
            ) : (
               <Button
                  variant="outlined"
                  startIcon={<BadgeIcon badgeKey={badge.key} />}
                  sx={buttonStyles}
                  disableRipple={!onClick}
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
   onClick?: () => object
}

export default BadgeSimpleButton
