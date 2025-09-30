import {
   Box,
   Button,
   IconButton,
   SwipeableDrawer,
   Typography,
   useTheme,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ElementType, useState } from "react"
import { ChevronLeft, ChevronRight, IconProps, Info } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useOfflineEventCreationContext } from "../OfflineEventCreationContext"
import { PublishButton } from "../PublishButton"

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
      backgroundColor: (theme) => theme.brand.white[400],
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
   swipeableDrawer: {
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
   },
})

type ButtonOrIconButtonProps = React.ComponentProps<typeof Button> &
   React.ComponentProps<typeof IconButton>

const ButtonOrIconButton = ({
   children,
   ...props
}: ButtonOrIconButtonProps) => {
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

const ButtonContent = ({ label, Icon }: ButtonContentProps) => {
   const isMobile = useIsMobile()

   const mobileIconSize = 32

   return isMobile ? <Icon size={mobileIconSize} /> : <>{label}</>
}

const OfflineEventAdminDetailBottomBarNavigation = () => {
   const isMobile = useIsMobile()
   const { navPreviousTab, navNextTab, shouldShowAlertIndicator } =
      useOfflineEventCreationContext()

   const isDesktop = !isMobile

   // For now, only one tab, so both buttons are disabled
   const isBackButtonDisabled = true
   const isNextButtonDisabled = true

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
               id="general.next"
               disabled={isNextButtonDisabled}
               onClick={navNextTab}
               endIcon={Boolean(isDesktop) && <ChevronRight />}
            >
               <ButtonContent label={"Next"} Icon={ChevronRight} />
            </ButtonOrIconButton>
         </Box>
         {Boolean(isMobile) && <PublishButton />}
         {Boolean(isMobile && shouldShowAlertIndicator) && (
            <InvalidAlertMobile />
         )}
      </Box>
   )
}

const InvalidAlertMobile = () => {
   const [isDrawerOpen, setIsDrawerOpen] = useState(false)
   const theme = useTheme()

   return (
      <Box>
         <IconButton sx={{ padding: 0 }} onClick={() => setIsDrawerOpen(true)}>
            <Info color={theme.brand.warning[600]} />
         </IconButton>
         <SwipeableDrawer
            anchor="bottom"
            onClose={() => setIsDrawerOpen(false)}
            onOpen={() => null}
            open={isDrawerOpen}
            sx={styles.swipeableDrawer}
         >
            <Box sx={{ p: 2 }}>
               <Typography variant="medium">
                  Please fill in all required fields before proceeding.
               </Typography>
            </Box>
         </SwipeableDrawer>
      </Box>
   )
}

export default OfflineEventAdminDetailBottomBarNavigation
