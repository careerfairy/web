import { Box, Button, IconButton, SwipeableDrawer } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ElementType, FC, useState } from "react"
import { ChevronLeft, ChevronRight, IconProps, Info } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useLivestreamCreationContext } from "../LivestreamCreationContext"
import InvalidAlertDialog from "../form/InvalidAlertDialog"
import { InvalidAlertTooltipContent } from "../form/InvalidAlertTooltip"
import { TAB_VALUES } from "../form/commons"

const styles = sxStyles({
   root: {
      position: "sticky",
      bottom: 0,
      right: 0,
      zIndex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
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
   buttonsWrapper: {
      display: "flex",
      width: {
         xs: "initial",
         md: "100%",
      },
      justifyContent: {
         xs: "left",
         md: "space-between",
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

const LivestreamAdminDetailBottomBarNavigation = () => {
   const isMobile = useIsMobile()
   const { tabValue, navPreviousTab, navNextTab, shouldShowAlertIndicator } =
      useLivestreamCreationContext()

   const isDesktop = !isMobile

   const isBackButtonDisabled = tabValue === TAB_VALUES.GENERAL
   const isNextButtonDisabled = tabValue === TAB_VALUES.JOBS

   return (
      <Box sx={styles.root}>
         <Box sx={styles.buttonsWrapper}>
            <ButtonOrIconButton
               sx={[
                  isMobile && styles.navigationButtonMobile,
                  isBackButtonDisabled && styles.navigationButtonDisabled,
               ]}
               disabled={isBackButtonDisabled}
               onClick={navPreviousTab}
               startIcon={Boolean(isDesktop) && <ChevronLeft />}
               variant="outlined"
            >
               <ButtonContent label={"Back"} Icon={ChevronLeft} />
            </ButtonOrIconButton>
            <ButtonOrIconButton
               sx={[
                  isMobile && styles.navigationButtonMobile,
                  isNextButtonDisabled && styles.navigationButtonDisabled,
               ]}
               disabled={isNextButtonDisabled}
               onClick={navNextTab}
               endIcon={Boolean(isDesktop) && <ChevronRight />}
            >
               <ButtonContent label={"Next"} Icon={ChevronRight} />
            </ButtonOrIconButton>
         </Box>
         <InvalidAlertDialog />
         {Boolean(isMobile && shouldShowAlertIndicator) && (
            <InvalidAlertMobile />
         )}
      </Box>
   )
}

const InvalidAlertMobile = () => {
   const [isDrawerOpen, setIsDrawerOpen] = useState(false)

   return (
      <Box>
         <IconButton sx={{ padding: 0 }} onClick={() => setIsDrawerOpen(true)}>
            <Info color="#FE9B0E" />
         </IconButton>
         <SwipeableDrawer
            anchor="bottom"
            onClose={() => setIsDrawerOpen(false)}
            onOpen={() => null}
            open={isDrawerOpen}
            sx={{
               ".MuiPaper-root": {
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  paddingBottom: 3,
               },
               ul: {
                  display: "flex",
                  flexDirection: "column",
               },
               "* > *": {
                  textAlign: "center",
                  alignItems: "center",
               },
            }}
         >
            <InvalidAlertTooltipContent
               handleOkClick={() => setIsDrawerOpen(false)}
            />
         </SwipeableDrawer>
      </Box>
   )
}

export default LivestreamAdminDetailBottomBarNavigation
