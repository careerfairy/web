import {
   BottomNavigationAction,
   Box,
   BottomNavigation as MuiBottomNavigation,
   SvgIconProps,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { useRouter } from "next/router"
import {
   ComponentType,
   Fragment,
   useCallback,
   useEffect,
   useState,
} from "react"
import { PlusSquare as CreateIcon, IconProps } from "react-feather"
import { useMeasure } from "react-use"
import { useGroup } from "."
import useMenuState from "../../components/custom-hook/useMenuState"
import { ContentIcon } from "../../components/views/common/icons/ContentIcon"
import { DashboardIcon } from "../../components/views/common/icons/DashboardIcon"
import { JobsIcon } from "../../components/views/common/icons/JobsIcon"
import { CreateMenu } from "./CreateMenu"
import { useGroupDashboard } from "./GroupDashboardLayoutProvider"
import { MobileFullScreenMenu } from "./MobileFullScreenMenu"

const StyledBottomNavigation = styled(MuiBottomNavigation)(({ theme }) => ({
   position: "fixed",
   bottom: 0,
   left: 0,
   right: 0,
   width: "100%",
   height: "64px",
   backgroundColor: theme.brand.white[50],
   borderTop: `1px solid ${theme.brand.white[500]}`,
   zIndex: 1000,
   padding: "0 16px",
   [theme.breakpoints.up("md")]: {
      display: "none", // Hide on desktop
   },
   "& .MuiBottomNavigationAction-root": {
      padding: "10px 4px",
      minWidth: "auto",
      "&.Mui-selected": {
         color: theme.palette.neutral[800],
         "& .MuiBottomNavigationAction-label": {
            fontWeight: 600,
         },
      },
      "&:not(.Mui-selected)": {
         color: theme.brand.black[700],
         "& .MuiBottomNavigationAction-label": {
            fontWeight: 400,
         },
      },
   },
   "& .MuiBottomNavigationAction-label": {
      fontSize: "10px",
      lineHeight: 1.6,
      "&.Mui-selected": {
         fontSize: "10px", // Keep same size when selected
      },
   },
   "& .MuiSvgIcon-root": {
      width: "24px",
      height: "24px",
   },
}))

const MenuAvatar = styled(CircularLogo)(({ theme }) => ({
   border: `1px solid ${theme.brand.white[400]}`,
}))

const navItems = [
   {
      id: "dashboard",
      label: "Dashboard",
      iconComponent: DashboardIcon,
      pathname: `/group/[groupId]/admin`,
   },
   {
      id: "content",
      label: "Content",
      iconComponent: ContentIcon,
      pathname: `/group/[groupId]/admin/content/live-streams`,
      activePathPrefix: `/group/[groupId]/admin/content`,
   },
   {
      id: "create",
      label: "Create",
      iconComponent: CreateIcon,
      pathname: `/group/[groupId]/admin/create-stream`,
   },
   {
      id: "jobs",
      label: "Jobs",
      iconComponent: JobsIcon,
      pathname: `/group/[groupId]/admin/jobs/[[...jobId]]`,
   },
] satisfies NavItemData[]

type NavItemData = {
   id: string
   label: string
   iconComponent: ComponentType<SvgIconProps> | ComponentType<IconProps>
   pathname: string
   activePathPrefix?: string
}

const noLinkActiveValue = ""

export const MobileBottomNavigation = () => {
   const router = useRouter()
   const [value, setValue] = useState<string>(noLinkActiveValue)
   const { toggleMobileFullScreenMenu, setMobileFullScreenMenu } =
      useGroupDashboard()

   const { group } = useGroup()

   const {
      anchorEl: createMenuAnchorEl,
      open: createMenuOpen,
      handleClick: handleCreateMenuOpen,
      handleClose: handleCreateMenuClose,
   } = useMenuState()
   const [bottomNavigationRef, { height }] = useMeasure<HTMLDivElement>()

   // Get group ID from router for navigation
   const groupId = router.query.groupId as string

   const getActiveValue = useCallback(() => {
      const currentPath = router.pathname
      for (const item of navItems) {
         if (
            item.activePathPrefix &&
            currentPath.startsWith(item.activePathPrefix)
         ) {
            return item.id
         }
         if (currentPath === item.pathname) {
            return item.id
         }
      }
      return noLinkActiveValue
   }, [router.pathname])

   useEffect(() => {
      setValue(getActiveValue())
   }, [getActiveValue, router.pathname])

   const handleChange = (event: React.SyntheticEvent, newValue: string) => {
      switch (newValue) {
         case "create": {
            setMobileFullScreenMenu(false)
            handleCreateMenuOpen(event as React.MouseEvent<HTMLElement>)
            break
         }
         case "menu": {
            toggleMobileFullScreenMenu()
            return
         }
         default: {
            const selectedItem = navItems.find((item) => item.id === newValue)
            if (!selectedItem) return

            setMobileFullScreenMenu(false)
            setValue(newValue)
            router.push(
               {
                  pathname: selectedItem.pathname,
                  query: {
                     groupId,
                  },
               },
               undefined,
               { shallow: true }
            )
            break
         }
      }
   }

   const renderIcon = (item: NavItemData, isActive: boolean) => {
      const IconComponent = item.iconComponent
      return <IconComponent fill={isActive ? "currentColor" : "none"} />
   }

   return (
      <Fragment>
         {/* Offset for the bottom navigation */}
         <Box height={height} />

         <StyledBottomNavigation
            value={value}
            onChange={handleChange}
            showLabels
            ref={bottomNavigationRef}
         >
            {navItems.map((item) => {
               const isActive = value === item.id
               return (
                  <BottomNavigationAction
                     key={item.id}
                     label={item.label}
                     value={item.id}
                     icon={renderIcon(item, isActive)}
                  />
               )
            })}

            {/* Menu item with avatar */}
            <BottomNavigationAction
               label="Menu"
               value="menu"
               icon={<MenuAvatar src={group?.logoUrl} alt="logo" size={24} />}
            />
         </StyledBottomNavigation>

         {/* Create Menu */}
         <CreateMenu
            open={createMenuOpen}
            anchorEl={createMenuAnchorEl}
            handleClose={handleCreateMenuClose}
            isMobileOverride
         />
         <MobileFullScreenMenu bottomNavigationHeight={height + 1} />
      </Fragment>
   )
}
