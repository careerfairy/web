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
               <SocialButtonWithText key={icon.name} {...icon} />
            ) : (
               <IconButtonComponent
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

const SocialButtonWithText = ({
   name,
   onClick,
   roundedIcon: RoundedIcon,
}: SocialIconProps) => (
   <Box sx={styles.socialContainer}>
      <IconButton sx={styles.roundedIcon} onClick={onClick}>
         <RoundedIcon />
      </IconButton>
      <Typography sx={styles.iconText}>{name}</Typography>
   </Box>
)

type IconButtonProps = SocialIconProps & {
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
         onClick={onClick}
         href={href}
      >
         <Icon color={"inherit"} sx={[styles.icon, iconStyle]} />
      </IconButton>
   </Tooltip>
)

export default ReferralWidget
