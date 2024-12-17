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
import { SlideUpTransition } from "components/views/common/transitions"
import { useState } from "react"
import {
   ChevronLeft,
   ChevronRight,
   FileText,
   Lock,
   Shield,
   User,
   X,
   XCircle,
} from "react-feather"
import { sxStyles } from "types/commonTypes"
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
         md: "unset",
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
]

export const SettingsDialog = ({ open, handleClose }: Props) => {
   const [drawerOpen, setDrawerOpen] = useState(true)
   const theme = useTheme()
   const [selectedOption, setSelectedOption] = useState<SettingsOptions>(
      menuSettings.at(0)
   )

   const isMobile = useIsMobile()

   const onBackButtonClick = () => {
      setDrawerOpen(true)
   }

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
            <Stack
               direction="row"
               sx={{ position: "relative", overflow: "hidden" }}
            >
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
                  <Box sx={styles.drawer}>
                     <Box>
                        <Stack>
                           <Stack
                              direction={"row"}
                              sx={styles.settingsHeader}
                              spacing={2}
                           >
                              {isMobile ? (
                                 <ChevronLeft size={24} onClick={handleClose} />
                              ) : null}
                              <Typography
                                 variant="brandedH3"
                                 sx={styles.settingsText}
                              >
                                 Settings
                              </Typography>
                           </Stack>
                           <List sx={{ py: 0 }}>
                              {menuSettings.map((option, index) => (
                                 <ListItem
                                    key={`${option}-${index}`}
                                    disablePadding
                                    onClick={() => {
                                       setSelectedOption(option)
                                       setDrawerOpen(false)
                                    }}
                                 >
                                    <ListItemButton
                                       sx={[
                                          styles.menuItemButton,
                                          selectedOption === option
                                             ? styles.menuItemButtonSelected
                                             : null,
                                       ]}
                                    >
                                       <ListItemIcon
                                          sx={[
                                             styles.menuItemIcon,
                                             selectedOption === option
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
                                    setSelectedOption("delete-account")
                                    setDrawerOpen(false)
                                 }}
                              >
                                 <ListItemButton
                                    sx={[
                                       styles.deleteAccountButton,
                                       selectedOption === "delete-account"
                                          ? styles.deleteAccountButtonSelected
                                          : null,
                                    ]}
                                 >
                                    <ListItemIcon sx={styles.deleteAccountIcon}>
                                       {SETTINGS_OPTIONS["delete-account"].icon}
                                    </ListItemIcon>
                                    <ListItemText
                                       sx={styles.deleteAccountTextWrapper}
                                    >
                                       <Typography
                                          variant="brandedBody"
                                          sx={styles.deleteAccountText}
                                       >
                                          {
                                             SETTINGS_OPTIONS["delete-account"]
                                                .label
                                          }
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
               </Slide>

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
                        condition={!isMobile || (isMobile && !drawerOpen)}
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
                                    {SETTINGS_OPTIONS[selectedOption].label}
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
                              {SETTINGS_OPTIONS[selectedOption].component}
                           </Box>
                        </Stack>
                     </ConditionalWrapper>
                  </Box>
               </Slide>
            </Stack>
         </DialogContent>
      </Dialog>
   )
}
