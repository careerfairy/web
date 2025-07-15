// material-ui
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import MenuRoundedIcon from "@mui/icons-material/MenuRounded"
import { Box, Typography } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"

// project imports
import { useRouter } from "next/router"
import { Fragment, ReactNode, useMemo } from "react"
import useIsMobile from "../../../components/custom-hook/useIsMobile"
import { getMaxLineStyles } from "../../../components/helperFunctions/HelperFunctions"
import { sxStyles } from "../../../types/commonTypes"
import { useGroupDashboard } from "../GroupDashboardLayoutProvider"
import { MobileProfileDrawer } from "./MobileProfileDrawer"
import NotificationsButton from "./NotificationsButton"
import { ProfileAvatar } from "./ProfileAvatar"

// framer motion
import { motion } from "framer-motion"

const getStyles = (hasNavigationBar?: boolean) =>
   sxStyles({
      root: {
         display: "flex",
         flexWrap: "wrap",
         flex: 1,
         alignItems: "center",
         px: {
            xs: 2,
            sm: 3,
         },
         py: {
            xs: 0,
            md: 2,
         },
         paddingBottom: hasNavigationBar ? "0 !important" : "initial",
         backdropFilter: "blur(8px)",
         backgroundColor: "rgba(247, 248, 252, 0.9)",
      },
      leftSection: {
         display: "flex",
      },
      btnWrapper: {
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
         mr: 1,
      },
      menuButton: {
         borderRadius: 3,
         overflow: "hidden",
      },
      title: {
         fontSize: {
            xs: "1.2rem",
            sm: "2rem",
         },
         ...getMaxLineStyles(1),
      },
      floatingButton: {
         position: "fixed",
         bottom: 20,
         right: 20,
      },
   })

type Props = {
   title: ReactNode
   topBarAction?: ReactNode
   navigation?: ReactNode
}

const titleVariants = {
   initial: { opacity: 0, x: -10 },
   animate: { opacity: 1, x: 0 },
   exit: { opacity: 0, x: 10 },
}

const TopBar = ({ title, topBarAction, navigation }: Props) => {
   const isMobile = useIsMobile()
   const { layout } = useGroupDashboard()
   const { asPath } = useRouter()

   const drawerPresent = !isMobile && layout.leftDrawerOpen

   const styles = getStyles(Boolean(navigation))

   const titleKey = useMemo(() => {
      return typeof title === "string" ? title : asPath
   }, [asPath, title])

   return (
      <Fragment>
         <Box sx={styles.root}>
            {/* toggler button */}
            {!drawerPresent && !isMobile ? <MobileToggleButton /> : null}
            <Box
               component={motion.div}
               key={titleKey}
               variants={titleVariants}
               initial="initial"
               animate="animate"
               exit="exit"
               transition={{ duration: 0.2, ease: "easeOut" }}
               sx={styles.leftSection}
            >
               <Typography role="heading" fontWeight={600} sx={styles.title}>
                  {title}
               </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" alignItems="center" spacing={1.5}>
               {topBarAction}
               {/* notification & profile */}
               <NotificationsButton />
               <ProfileAvatar />
            </Stack>
            {Boolean(navigation) && navigation}
         </Box>
         {Boolean(isMobile) && <MobileProfileDrawer />}
      </Fragment>
   )
}

const MobileToggleButton = () => {
   const { toggleLeftDrawer } = useGroupDashboard()
   const styles = getStyles()

   return (
      <Box sx={styles.btnWrapper}>
         <IconButton
            onClick={toggleLeftDrawer}
            sx={styles.menuButton}
            edge={"start"}
         >
            <MenuRoundedIcon />
         </IconButton>
      </Box>
   )
}

export const BackLink = ({ children }: { children: ReactNode }) => {
   const router = useRouter()

   return (
      <Box
         sx={{
            cursor: "pointer",
         }}
         onClick={() => {
            router.back()
         }}
      >
         <ArrowBackIosIcon />
         {children}
      </Box>
   )
}

export default TopBar
