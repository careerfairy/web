import React from "react"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import { Button, Tooltip, TooltipProps, Typography } from "@mui/material"
import SaveIcon from "@mui/icons-material/Save"
import IconButton from "@mui/material/IconButton"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import Link from "../../../common/Link"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import {
   careerSkillsLinkWithContext,
   My_Recruiters_NoAccess,
} from "../../../../../constants/contextInfoCareerSkills"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   tooltip: {
      backgroundColor: "background.paper",
      color: "text.primary",
      boxShadow: (theme: DefaultTheme) => theme.legacy.boxShadows.dark_8_25_10,
      padding: 1,
      borderRadius: "10px",
   },
})

export const SaveRecruiterButtonNoAccess = () => {
   const { isLoggedOut } = useAuth()

   const isMobile = useIsMobile()
   const requiredBadge = UserPresenter.saveRecruitersRequiredBadge()

   const openProfilePage = () => {
      const win = window.open(
         careerSkillsLinkWithContext(My_Recruiters_NoAccess),
         "_blank"
      )
      win.focus()
   }

   let popoverContent = (
      <Typography sx={{ p: 1 }}>
         You have to unlock the{" "}
         <Link href="#" onClick={openProfilePage}>
            {requiredBadge.name} Badge Level {requiredBadge.level}
         </Link>{" "}
         to access this feature.
      </Typography>
   )

   if (isLoggedOut) {
      popoverContent = (
         <Typography sx={{ p: 1 }}>
            You must be logged in to save a speaker.
         </Typography>
      )
   }

   return (
      <>
         <WrapperTooltip title={popoverContent} position="bottom">
            <span>
               <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={true}
               >
                  {isMobile ? "Save" : "Save Speaker"}
               </Button>
            </span>
         </WrapperTooltip>
         <WrapperTooltip title={popoverContent}>
            <IconButton
               aria-owns={open ? "mouse-over-popover" : undefined}
               aria-haspopup="true"
               sx={{
                  marginLeft: "5px",
               }}
               onClick={openProfilePage}
            >
               <InfoOutlinedIcon />
            </IconButton>
         </WrapperTooltip>
      </>
   )
}

const WrapperTooltip = ({
   children,
   title,
   position = "right",
}: {
   children: TooltipProps["children"]
   title: TooltipProps["title"]
   position?: TooltipProps["placement"]
}) => {
   return (
      <Tooltip
         title={title}
         placement={position}
         componentsProps={{
            tooltip: {
               sx: styles.tooltip,
            },
            arrow: {
               sx: {
                  color: "background.paper",
               },
            },
         }}
      >
         {children}
      </Tooltip>
   )
}
