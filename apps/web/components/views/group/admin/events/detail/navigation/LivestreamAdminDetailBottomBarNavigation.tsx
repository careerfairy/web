import { ElementType, FC } from "react"
import { sxStyles } from "types/commonTypes"
import { Box, Button, IconButton } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChevronLeft, ChevronRight, IconProps } from "react-feather"
import { TAB_VALUES } from "./LivestreamAdminDetailTopBarNavigation"

const styles = sxStyles({
   root: {
      position: "sticky",
      bottom: 0,
      right: 0,
      zIndex: 1,
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
   navigationButtonMobile: {
      backgroundColor: "#F6F6FA",
      padding: 0,
      svg: {
         stroke: "black",
      },
   },
   navigationButtonDisabled: {
      opacity: {
         xs: "20%",
         md: "initial",
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
      <Button color="secondary" variant="contained" {...props}>
         {children}
      </Button>
   )
}

type ButtonContentProps = {
   label: string
   Icon: ElementType<IconProps>
}

const ButtonContent: FC<ButtonContentProps> = ({ label, Icon }) => {
   const isMobile = useIsMobile()

   const mobileIconSize = 32

   return isMobile ? <Icon size={mobileIconSize} /> : <>{label}</>
}

const changeToNewTab = (
   currentTab: TAB_VALUES,
   changeTab: LivestreamAdminDetailBottomBarNavigationProps["changeTab"],
   numStepsToMove: number
): void => {
   const tabValues = Object.values(TAB_VALUES)
   const currentTabIndex = tabValues.indexOf(currentTab)
   const newTab = tabValues[currentTabIndex + numStepsToMove]
   changeTab(newTab)
}

type LivestreamAdminDetailBottomBarNavigationProps = {
   currentTab: TAB_VALUES
   changeTab: (TAB_VALUE) => void
}

const LivestreamAdminDetailBottomBarNavigation: FC<
   LivestreamAdminDetailBottomBarNavigationProps
> = ({ currentTab, changeTab }) => {
   const isMobile = useIsMobile()
   const isDesktop = !isMobile

   const isBackButtonDisabled = currentTab === TAB_VALUES.GENERAL
   const isNextButtonDisabled = currentTab === TAB_VALUES.JOBS

   return (
      <Box sx={styles.root}>
         <ButtonOrIconButton
            sx={[
               isMobile && styles.navigationButtonMobile,
               isBackButtonDisabled && styles.navigationButtonDisabled,
            ]}
            disabled={isBackButtonDisabled}
            onClick={() => changeToNewTab(currentTab, changeTab, -1)}
            startIcon={Boolean(isDesktop) && <ChevronLeft />}
         >
            <ButtonContent label={"Back"} Icon={ChevronLeft} />
         </ButtonOrIconButton>
         <ButtonOrIconButton
            sx={[
               isMobile && styles.navigationButtonMobile,
               isNextButtonDisabled && styles.navigationButtonDisabled,
            ]}
            disabled={currentTab === TAB_VALUES.JOBS}
            onClick={() => changeToNewTab(currentTab, changeTab, 1)}
            endIcon={Boolean(isDesktop) && <ChevronRight />}
         >
            <ButtonContent label={"Next"} Icon={ChevronRight} />
         </ButtonOrIconButton>
      </Box>
   )
}

export default LivestreamAdminDetailBottomBarNavigation
