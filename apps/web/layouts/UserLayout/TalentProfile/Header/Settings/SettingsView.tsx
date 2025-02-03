import {
   Box,
   Dialog,
   DialogContent,
   Divider,
   List,
   ListItem,
   ListItemButton,
   ListItemIcon,
   ListItemText,
   Slide,
   Stack,
   Typography,
   useTheme,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { ConditionalWrapper as WrapConditionally } from "components/views/common/ConditionalWrapper"
import { SlideUpTransition } from "components/views/common/transitions"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
   AlertCircle,
   ChevronLeft,
   ChevronRight,
   FileText,
   Lock,
   Shield,
   User,
   X,
   XCircle,
} from "react-feather"
import { useDispatch, useSelector } from "react-redux"
import { setDirty } from "store/reducers/profileSettingsReducer"
import { isSettingFormDirty } from "store/selectors/profileSettingsSelectors"
import { sxStyles } from "types/commonTypes"
import { TAB_VALUES } from "../../TalentProfileView"
import { DeleteAccount } from "./DeleteAccount"
import { Password } from "./Password"
import { PersonalInfo } from "./PersonalInfo"
import { Privacy } from "./Privacy"
import { YourCV } from "./YourCV"

const styles = sxStyles({
   dialogPaper: {
      maxWidth: "unset",
   },
   drawer: {
      position: "relative",
      borderRight: "none",
      backgroundColor: (theme) => ({
         md: theme.brand.white[300],
         sm: theme.brand.white[100],
      }),
      height: {
         md: "629px",
         sm: "100%",
      },
      width: {
         md: "239px",
         sm: "100%",
         xs: "100%",
      },
   },
   contentRoot: {
      width: {
         sm: "100%",
         xs: "100%",
         md: "700px",
      },
   },
   settingsText: {
      fontWeight: 600,
      color: "neutral.800",
   },
   settingsHeader: {
      alignItems: "center",
      ml: {
         md: "32px",
         sm: "24px",
         xs: "16px",
      },
      mt: {
         md: "32px",
         sm: 2,
         xs: 2,
      },
      mb: "24px",
   },
   selectedOptionText: {
      fontWeight: 600,
      color: "neutral.800",
   },
   divider: {
      borderColor: "neutral.50",
      my: "20px",
      ml: {
         md: 4,
         sm: 0,
         xs: 0,
      },
   },
   menuItemButton: {
      py: {
         md: 1.5,
         sm: 3,
         xs: 3,
      },
      color: {
         md: "neutral.400",
         sm: "neutral.800",
         xs: "neutral.800",
      },
   },
   menuItemButtonSelected: {
      "& *": {
         color: "neutral.800",
      },
      backgroundColor: {
         md: "neutral.50",
         sm: "none",
         xs: "none",
      },
      opacity: {
         md: 0.6,
         sm: 1,
         xs: 1,
      },
   },
   menuItemIcon: {
      pl: {
         md: 2,
         sm: 0,
         xs: 0,
      },
      color: {
         md: "neutral.400",
         sm: "neutral.800",
         xs: "neutral.800",
      },
   },
   menuItemIconSelected: {
      pl: 2,
   },
   menuItemText: {
      fontWeight: 400,
      ml: {
         md: -0.5,
         sm: -2,
         xs: -3,
      },
   },
   deleteAccountButton: {
      py: {
         md: 1.5,
         sm: 3,
         xs: 3,
      },
      color: (theme) => theme.brand.error[600],
   },
   deleteAccountButtonSelected: {
      backgroundColor: {
         md: "neutral.50",
         sm: "none",
         xs: "none",
      },
   },
   deleteAccountIcon: {
      pl: {
         md: 2,
         sm: 0,
         xs: 0,
      },
      color: (theme) => theme.brand.error[600],
   },
   deleteAccountText: {
      fontWeight: 400,
   },
   contentBox: {
      px: {
         md: 4,
         sm: 2,
         xs: 2,
      },
   },
   contentBoxMobile: {
      width: "100dvw",
      px: {
         md: 4,
         sm: 2,
         xs: 2,
      },
   },
   deleteAccountTextWrapper: {
      ml: {
         md: -0.5,
         sm: -3,
         xs: -3,
      },
   },
   selectedOptionHeader: {
      alignItems: "center",
      pt: {
         md: 4,
         sm: 2,
         xs: 2,
      },
      pb: 2,
      px: {
         md: 4,
         sm: 2,
         xs: 2,
      },
   },
   closeButton: {
      cursor: "pointer",
      width: 32,
      height: 32,
   },
   dialog: {
      zIndex: (theme) => theme.zIndex.modal,
   },
   alertIcon: {
      color: (theme) => theme.brand.tq[500],
      width: "48px !important",
      height: "48px !important",
   },
})

const SETTINGS_OPTIONS = {
   "personal-info": {
      label: "Personal info",
      icon: <User />,
      component: <PersonalInfo />,
   },
   "your-cv": {
      label: "Your CV",
      icon: <FileText />,
      component: <YourCV />,
   },
   privacy: {
      label: "Privacy",
      icon: <Shield />,
      component: <Privacy />,
   },
   password: {
      label: "Password",
      icon: <Lock />,
      component: <Password />,
   },
   "delete-account": {
      label: "Delete account",
      icon: <XCircle />,
      component: <DeleteAccount />,
   },
}

type SettingsOptions = keyof typeof SETTINGS_OPTIONS

type Props = {
   open: boolean
   handleClose: () => void
}

const menuSettings: SettingsOptions[] = [
   "personal-info",
   "your-cv",
   "privacy",
   "password",
   "delete-account",
]

const mainMenuSettings: SettingsOptions[] = [
   menuSettings.at(0),
   menuSettings.at(1),
   menuSettings.at(2),
   menuSettings.at(3),
]

export const SettingsDialog = ({ open, handleClose: onClose }: Props) => {
   const isMobile = useIsMobile()
   const router = useRouter()
   const dispatch = useDispatch()
   const settingFormIsDirty = useSelector(isSettingFormDirty)

   const [switchingTab, setSwitchingTab] = useState<SettingsOptions | null>(
      null
   )

   const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
      useState<boolean>(false)

   const getTabValue = useCallback(
      (tab: SettingsOptions | null) => {
         return tab && menuSettings.includes(tab)
            ? tab
            : !isMobile
            ? menuSettings.at(0)
            : null
      },
      [isMobile]
   )

   const queryTab = router.query.tab as SettingsOptions

   const [currentTab, setCurrentTab] = useState<SettingsOptions | null>(() =>
      getTabValue(queryTab)
   )

   const handleClose = useCallback(() => {
      if (settingFormIsDirty && !isConfirmDialogOpen && currentTab)
         setIsConfirmDialogOpen(true)
      else {
         setIsConfirmDialogOpen(false)
         onClose()
      }
   }, [onClose, settingFormIsDirty, isConfirmDialogOpen, currentTab])

   const drawerOpen = useMemo(() => {
      return Boolean(!currentTab)
   }, [currentTab])

   const theme = useTheme()

   const onBack = useCallback(() => {
      setCurrentTab(null)
      setSwitchingTab(null)
      dispatch(setDirty({ setting: "personalInfo", dirty: false }))
      delete router.query["tab"]

      router.push(
         {
            pathname: TAB_VALUES.settings.value,
            query: router.query,
         },
         undefined,
         { shallow: true }
      )
   }, [router, dispatch])

   const onBackButtonClick = useCallback(() => {
      if (settingFormIsDirty && !isConfirmDialogOpen) {
         setIsConfirmDialogOpen(true)
      } else {
         onBack()
      }
   }, [onBack, settingFormIsDirty, isConfirmDialogOpen])

   useEffect(() => {
      const tab = router.query.tab as SettingsOptions
      setCurrentTab(getTabValue(tab))
   }, [router, getTabValue])

   const goToTab = useCallback(
      (option: SettingsOptions) => {
         setCurrentTab(option)
         setSwitchingTab(null)
         router.push({
            pathname: TAB_VALUES.settings.value,
            query: {
               ...router.query,
               tab: option,
            },
         })
      },
      [router]
   )

   const onTabClick = useCallback(
      (option: SettingsOptions) => {
         if (settingFormIsDirty && !isConfirmDialogOpen) {
            setSwitchingTab(option)
            setIsConfirmDialogOpen(true)
         } else {
            goToTab(option)
         }
      },
      [goToTab, settingFormIsDirty, isConfirmDialogOpen]
   )

   return (
      <Dialog
         open={open}
         fullScreen={isMobile}
         onClose={handleClose}
         closeAfterTransition={false}
         disableEscapeKeyDown={false}
         PaperProps={{
            sx: styles.dialogPaper,
         }}
         TransitionComponent={SlideUpTransition}
      >
         <DialogContent sx={{ p: 0 }}>
            <Stack spacing={1.5}>
               <ConfirmationDialog
                  open={isConfirmDialogOpen ? Boolean(currentTab) : false}
                  title={"Make it count"}
                  description={
                     "Leaving now will discard the changes you've made to your personal information. Are you sure you want to exit?"
                  }
                  icon={<Box component={AlertCircle} sx={styles.alertIcon} />}
                  primaryAction={{
                     text: "Keep editing",
                     callback: () => setIsConfirmDialogOpen(false),
                     variant: "contained",
                  }}
                  secondaryAction={{
                     text: "Exit and discard",
                     color: "grey",
                     callback: () => {
                        setIsConfirmDialogOpen(false)

                        if (switchingTab && !isMobile) {
                           setSwitchingTab(null)
                           dispatch(
                              setDirty({
                                 setting: "personalInfo",
                                 dirty: false,
                              })
                           )
                           goToTab(switchingTab)
                           return
                        }

                        if (isMobile) onBack()
                        else handleClose()
                     },
                     variant: "outlined",
                  }}
                  handleClose={() => {}}
                  hideCloseIcon
                  sx={styles.dialog}
               />
               <Stack
                  direction="row"
                  sx={{ position: "relative", overflow: "hidden" }}
               >
                  <WrapConditionally
                     condition={isMobile}
                     wrapper={(children) => {
                        return (
                           <Slide
                              direction="right"
                              in={drawerOpen || !isMobile}
                              mountOnEnter
                              unmountOnExit
                              timeout={200}
                              style={{ willChange: "transform" }}
                              easing={{
                                 enter: theme.transitions.easing.easeIn,
                                 exit: theme.transitions.easing.easeIn,
                              }}
                           >
                              <Box width={"100%"}>{children}</Box>
                           </Slide>
                        )
                     }}
                  >
                     <SettingsSideDrawer
                        handleClose={handleClose}
                        setSwitchingTab={setSwitchingTab}
                        onTabClick={onTabClick}
                        currentTab={currentTab}
                     />
                  </WrapConditionally>
                  {currentTab ? (
                     <WrapConditionally
                        condition={isMobile}
                        wrapper={(children) => {
                           return (
                              <Slide
                                 direction="left"
                                 in={!drawerOpen || !isMobile}
                                 mountOnEnter
                                 unmountOnExit
                                 timeout={200}
                                 style={{ willChange: "transform" }}
                                 easing={{
                                    enter: theme.transitions.easing.easeIn,
                                    exit: theme.transitions.easing.easeIn,
                                 }}
                              >
                                 <Box>
                                    <ConditionalWrapper
                                       condition={
                                          !isMobile || (isMobile && !drawerOpen)
                                       }
                                    >
                                       {children}
                                    </ConditionalWrapper>
                                 </Box>
                              </Slide>
                           )
                        }}
                     >
                        <Stack sx={styles.contentRoot} spacing={1}>
                           <Stack
                              direction="row"
                              justifyContent={"space-between"}
                              sx={styles.selectedOptionHeader}
                           >
                              <Stack
                                 direction="row"
                                 spacing={1.5}
                                 alignItems={"center"}
                              >
                                 {isMobile ? (
                                    <ChevronLeft
                                       size={24}
                                       onClick={onBackButtonClick}
                                    />
                                 ) : null}
                                 <Typography
                                    variant="brandedH3"
                                    sx={styles.selectedOptionText}
                                 >
                                    {SETTINGS_OPTIONS[currentTab].label}
                                 </Typography>
                              </Stack>
                              {!isMobile ? (
                                 <Box
                                    sx={styles.closeButton}
                                    component={X}
                                    onClick={handleClose}
                                 />
                              ) : null}
                           </Stack>
                           <Box
                              py={0}
                              sx={[
                                 styles.contentBox,
                                 isMobile ? styles.contentBoxMobile : null,
                              ]}
                           >
                              {SETTINGS_OPTIONS[currentTab].component}
                           </Box>
                        </Stack>
                     </WrapConditionally>
                  ) : null}
               </Stack>
            </Stack>
         </DialogContent>
      </Dialog>
   )
}

type SettingsSideDrawerProps = {
   handleClose: () => void
   setSwitchingTab: (option: SettingsOptions) => void
   onTabClick: (option: SettingsOptions) => void
   currentTab: SettingsOptions | null
}

const SettingsSideDrawer = ({
   handleClose,
   setSwitchingTab,
   onTabClick,
   currentTab,
}: SettingsSideDrawerProps) => {
   const isMobile = useIsMobile()
   const theme = useTheme()

   return (
      <Box sx={styles.drawer}>
         <Box>
            <Stack>
               <Stack direction={"row"} sx={styles.settingsHeader} spacing={2}>
                  {isMobile ? (
                     <ChevronLeft size={24} onClick={handleClose} />
                  ) : null}
                  <Typography variant="brandedH3" sx={styles.settingsText}>
                     Settings
                  </Typography>
               </Stack>
               <List sx={{ py: 0 }}>
                  {mainMenuSettings.map((option, index) => (
                     <ListItem
                        key={`${option}-${index}`}
                        disablePadding
                        onClick={() => {
                           setSwitchingTab(option)
                           onTabClick(option)
                        }}
                     >
                        <ListItemButton
                           sx={[
                              styles.menuItemButton,
                              currentTab === option
                                 ? styles.menuItemButtonSelected
                                 : null,
                           ]}
                           disableRipple={isMobile}
                        >
                           <ListItemIcon
                              sx={[
                                 styles.menuItemIcon,
                                 currentTab === option
                                    ? styles.menuItemIconSelected
                                    : null,
                              ]}
                           >
                              {SETTINGS_OPTIONS[option].icon}
                           </ListItemIcon>
                           <ListItemText>
                              <Typography
                                 variant="brandedBody"
                                 sx={styles.menuItemText}
                              >
                                 {SETTINGS_OPTIONS[option].label}
                              </Typography>
                           </ListItemText>
                           {isMobile ? (
                              <ChevronRight
                                 size={24}
                                 color={theme.palette.neutral[400]}
                              />
                           ) : null}
                        </ListItemButton>
                     </ListItem>
                  ))}

                  <Divider sx={styles.divider} />
                  <ListItem
                     key={"delete-account-button"}
                     disablePadding
                     onClick={() => {
                        setSwitchingTab("delete-account")
                        onTabClick("delete-account")
                     }}
                  >
                     <ListItemButton
                        sx={[
                           styles.deleteAccountButton,
                           currentTab === "delete-account"
                              ? styles.deleteAccountButtonSelected
                              : null,
                        ]}
                        disableRipple={isMobile}
                     >
                        <ListItemIcon sx={styles.deleteAccountIcon}>
                           {SETTINGS_OPTIONS["delete-account"].icon}
                        </ListItemIcon>
                        <ListItemText sx={styles.deleteAccountTextWrapper}>
                           <Typography
                              variant="brandedBody"
                              sx={styles.deleteAccountText}
                           >
                              {SETTINGS_OPTIONS["delete-account"].label}
                           </Typography>
                        </ListItemText>
                        {isMobile ? (
                           <ChevronRight
                              size={24}
                              color={theme.palette.neutral[400]}
                           />
                        ) : null}
                     </ListItemButton>
                  </ListItem>
               </List>
            </Stack>
         </Box>
      </Box>
   )
}
