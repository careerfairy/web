import { ElementType, FC } from "react"
import { sxStyles } from "types/commonTypes"
import { Box, Button, IconButton } from "@mui/material"
import { ChevronLeft, ChevronRight, IconProps } from "react-feather"
import useIsMobile from "components/custom-hook/useIsMobile"
import { TAB_VALUES } from "./LivestreamAdminDetailTopBarNavigation"

const isDisabledClassName = "isDisabled"

const styles = sxStyles({
   root: {
      display: "flex",
      justifyContent: {
         xs: "left",
         md: "space-between",
      },
      alignItems: "center",
      backgroundColor: "#FFFFFFF2",
      boxShadow: "0px 0px 10px 0px #BBBBC20A",
      padding: {
         xs: "20px 16px",
         md: "20px 32px",
      },
      gap: {
         xs: 2,
      },
   },
   navigationButton: {
      backgroundColor: {
         xs: "#F6F6FA",
         md: "inherit",
      },
      [`&.${isDisabledClassName}`]: {
         opacity: {
            xs: "20%",
            md: "initial",
         },
      },
      padding: {
         xs: 0,
      },
      svg: {
         stroke: (theme) => ({
            xs: "black",
            md: theme.palette.primary.main,
         }),
      },
   },
})

type ButtonOrIconButtonProps = React.ComponentProps<typeof Button> &
   React.ComponentProps<typeof IconButton>

const ButtonOrIconButton: FC<ButtonOrIconButtonProps> = ({
   children,
   ...props
}) => {
   const isMobile = useIsMobile()

   return isMobile ? (
      <IconButton {...props}>{children}</IconButton>
   ) : (
      <Button {...props}>{children}</Button>
   )
}

type ButtonContentProps = {
   label: string
   iconPositionOnDesktop: "left" | "right"
   Icon: ElementType<IconProps>
}

const ButtonContent: FC<ButtonContentProps> = ({
   label,
   iconPositionOnDesktop,
   Icon,
}) => {
   const isMobile = useIsMobile()

   const desktopIconSize = 18
   const mobileIconSize = 32

   return isMobile ? (
      <Icon size={mobileIconSize} />
   ) : (
      <>
         {iconPositionOnDesktop === "left" ? (
            <>
               <Icon size={desktopIconSize} /> {label}
            </>
         ) : (
            <>
               {label} <Icon size={desktopIconSize} />
            </>
         )}
      </>
   )
}

const changeToNewTab = (
   currentTab: TAB_VALUES,
   changeTab: LivestreamAdminDetailBottomBarNavigationProps["changeTab"],
   step: number
): void => {
   const tabValues = Object.values(TAB_VALUES)
   const currentTabIndex = tabValues.indexOf(currentTab)
   const newTab = tabValues[currentTabIndex + step]
   changeTab(newTab)
}

type LivestreamAdminDetailBottomBarNavigationProps = {
   currentTab: TAB_VALUES
   changeTab: (TAB_VALUE) => void
}

const LivestreamAdminDetailBottomBarNavigation: FC<
   LivestreamAdminDetailBottomBarNavigationProps
> = ({ currentTab, changeTab }) => {
   const isBackButtonDisabled = currentTab === TAB_VALUES.GENERAL
   const isNextButtonDisabled = currentTab === TAB_VALUES.JOBS

   return (
      <Box sx={styles.root}>
         <ButtonOrIconButton
            sx={styles.navigationButton}
            disabled={isBackButtonDisabled}
            onClick={() => changeToNewTab(currentTab, changeTab, -1)}
            className={Boolean(isBackButtonDisabled) && isDisabledClassName}
         >
            <ButtonContent
               label={"Back"}
               iconPositionOnDesktop="left"
               Icon={ChevronLeft}
            />
         </ButtonOrIconButton>
         <ButtonOrIconButton
            sx={styles.navigationButton}
            disabled={currentTab === TAB_VALUES.JOBS}
            onClick={() => changeToNewTab(currentTab, changeTab, 1)}
            className={Boolean(isNextButtonDisabled) && isDisabledClassName}
         >
            <ButtonContent
               label={"Next"}
               iconPositionOnDesktop="right"
               Icon={ChevronRight}
            />
         </ButtonOrIconButton>
      </Box>
   )
}

export default LivestreamAdminDetailBottomBarNavigation
