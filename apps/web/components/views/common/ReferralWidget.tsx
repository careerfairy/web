import { Box, IconButton, Tooltip, Typography } from "@mui/material"
import Stack, { StackProps } from "@mui/material/Stack"
import { alpha } from "@mui/material/styles"
import { DefaultTheme } from "@mui/styles"
import { type SystemStyleObject } from "@mui/system"
import { FC } from "react"
import { sxStyles } from "../../../types/commonTypes"
import { SocialIconProps } from "../../custom-hook/useSocials"

const mobileProp = "sm"

interface WidgetButtonProps extends StackProps {
   isImageIcon?: boolean
   iconsColor?: "grey" | "primary" | "secondary"
   noBackgroundColor?: boolean
   iconStyle?: SystemStyleObject<DefaultTheme>
   socials: SocialIconProps[]
   roundedIcons?: boolean
   onSocialClick?: (type: SocialIconProps["type"]) => void
}

const styles = sxStyles({
   socialIcons: {
      mx: "auto",
      color: "secondary.main",
      borderRadius: 2,
      backgroundColor: (theme) => ({
         xs: "transparent",
         [mobileProp]: alpha(theme.palette.grey["400"], 0.1),
      }),
   },
   icon: {
      fontSize: { xs: "2rem", md: "4rem" },
   },
   iconButton: {
      "&:hover": {
         backgroundColor: "transparent",
      },
   },
   socialContainer: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
      alignItems: "center",
      "&:hover": {
         cursor: "pointer",
      },
   },
   imageBox: {
      width: "48px",
   },
   iconText: {
      color: "#505050",
      fontSize: "1.14286rem",
      letterSpacing: "-0.01257rem",
   },
   roundedIcon: {
      "& svg": {
         width: 48,
         height: 48,
      },
   },
})

export const ReferralWidget = ({
   isImageIcon,
   iconsColor = "secondary",
   noBackgroundColor,
   iconStyle,
   socials,
   roundedIcons,
   onSocialClick,
   ...rest
}: WidgetButtonProps) => {
   return (
      <Stack
         direction="row"
         justifyContent={isImageIcon ? "start" : "space-evenly"}
         sx={[
            styles.socialIcons,
            noBackgroundColor && { backgroundColor: "transparent !important" },
         ]}
         spacing={roundedIcons ? 3.5 : 0}
         {...rest}
      >
         {socials.map((icon) =>
            roundedIcons ? (
               <SocialButtonWithText
                  onSocialClick={() => onSocialClick(icon.type)}
                  key={icon.name}
                  {...icon}
               />
            ) : (
               <IconButtonComponent
                  onSocialClick={() => onSocialClick(icon.type)}
                  key={icon.name}
                  iconsColor={iconsColor}
                  iconStyle={iconStyle}
                  {...icon}
               />
            )
         )}
      </Stack>
   )
}

type SocialButtonProps = SocialIconProps & {
   onSocialClick?: () => void
}

const SocialButtonWithText = ({
   name,
   onClick,
   roundedIcon: RoundedIcon,
   onSocialClick,
}: SocialButtonProps) => (
   <Box sx={styles.socialContainer}>
      <IconButton
         sx={styles.roundedIcon}
         onClick={() => {
            onClick()
            if (onSocialClick) {
               onSocialClick()
            }
         }}
      >
         <RoundedIcon />
      </IconButton>
      <Typography sx={styles.iconText}>{name}</Typography>
   </Box>
)

type IconButtonProps = SocialButtonProps & {
   iconStyle?: WidgetButtonProps["iconStyle"]
   iconsColor: WidgetButtonProps["iconsColor"]
}

const IconButtonComponent: FC<IconButtonProps> = ({
   icon: Icon,
   name,
   href,
   onClick,
   iconStyle,
   iconsColor,
   onSocialClick,
}) => (
   <Tooltip arrow title={name}>
      <IconButton
         sx={[
            styles.iconButton,
            {
               color:
                  iconsColor === "grey" ? "common.black" : `${iconsColor}.main`,
               width: {
                  xs: "15%",
                  sm: "unset",
               },
            },
         ]}
         size={"large"}
         onClick={() => {
            onClick()
            if (onSocialClick) {
               onSocialClick()
            }
         }}
         href={href}
      >
         <Icon color={"inherit"} sx={[styles.icon, iconStyle]} />
      </IconButton>
   </Tooltip>
)

export default ReferralWidget
