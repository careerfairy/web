import React, { useCallback, useEffect } from "react"
import HeaderContent from "./HeaderContent"
import DrawerContent from "./DrawerContent"
import { useTheme } from "@mui/material/styles"
import { useMediaQuery } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "../../store/actions"
import { leftMenuSelector } from "../../store/selectors/groupDashboardSelectors"
import GenericLayout from "../GenericLayout"

type Props = {
   children: React.ReactNode
   headerTitle: string
}
const DashboardLayout = ({ children, headerTitle }: Props) => {
   const theme = useTheme()
   const matchDownMd = useMediaQuery(theme.breakpoints.down("md"))
   const dispatch = useDispatch()

   // Handle left drawer
   const leftDrawerOpened = useSelector(leftMenuSelector)

   const setDrawer = useCallback(
      (open: boolean) => dispatch(actions.setGroupDashboardDrawer(open)),
      [dispatch]
   )

   const handleLeftDrawerToggle = useCallback(() => {
      setDrawer(!leftDrawerOpened)
   }, [leftDrawerOpened, setDrawer])

   useEffect(() => {
      setDrawer(!matchDownMd)
   }, [matchDownMd, setDrawer])

   return (
      <GenericLayout
         headerContent={
            <HeaderContent
               title={headerTitle}
               drawerOpen={leftDrawerOpened}
               handleLeftDrawerToggle={handleLeftDrawerToggle}
            />
         }
         drawerContent={<DrawerContent />}
         drawerOpen={leftDrawerOpened}
         setDrawer={setDrawer}
         toggleDrawer={handleLeftDrawerToggle}
      >
         {children}
      </GenericLayout>
   )
}

export default DashboardLayout
