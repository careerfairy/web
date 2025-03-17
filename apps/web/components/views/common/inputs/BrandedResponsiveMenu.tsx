import {
   Box,
   CircularProgress,
   Divider,
   List,
   ListItemButton,
   MenuItem,
   SxProps,
   Typography,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ComponentType, FC, Fragment, ReactElement } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"
import BrandedMenu from "./BrandedMenu"
import BrandedSwipeableDrawer from "./BrandedSwipeableDrawer"

const LOADER_SIZE = 15

const styles = sxStyles({
   icon: {
      display: "flex",
      alignSelf: "center",
      my: "auto",
      mr: 1.5,
      svg: {
         width: "16px",
         height: "16px",
         m: "0 !important",
      },
   },
   iconMobile: {
      svg: {
         width: "18px",
         height: "18px",
      },
   },
   menuItem: {
      position: "relative",
      color: (theme) => theme.palette.neutral[700],
      p: "10px 16px !important",
   },
   listItemLoading: {
      "& .MuiTypography-root": {
         opacity: 0.5,
      },
      "& svg": {
         opacity: 0.5,
      },
   },
   borderBottom: {
      borderBottom: "1px solid",
      borderColor: (theme) => theme.brand.black[300],
   },
   drawerMenuItem: {
      p: "17px 20px !important",
      position: "relative",
      color: (theme) => theme.palette.neutral[700],
   },
   listItemDivider: {
      borderColor: (theme) => theme.brand.black[300],
   },
   loader: {
      position: "absolute",
      top: `calc(50% - ${LOADER_SIZE / 2}px)`,
      left: `calc(50% - ${LOADER_SIZE / 2}px)`,
      transform: "translate(-50%, -50%)",
      color: (theme) => theme.brand.black[600],
   },
   mobileDrawer: {
      //Assures mobile drawer can be opened inside of modals
      zIndex: (theme) => theme.zIndex.modal + 1,
   },
})

export type MenuOption = {
   label: string
   icon?: ReactElement
   handleClick: (args: unknown) => void | Promise<void>
   menuItemSxProps?: SxProps
   disabled?: boolean
   loading?: boolean
   color?: string
   /** An optional component to wrap around the menu item e.g. a file uploader. */
   wrapperComponent?: ComponentType<{ children?: ReactElement }>
   /** If true, keeps the menu open after clicking the option. Defaults to false. */
   keepOpen?: boolean
}

type MobileDrawerProps = {
   open: boolean
   handleClose: () => void
   options: MenuOption[]
   enableDrawerCancelButton?: boolean
}

const MobileDrawer: FC<MobileDrawerProps> = ({
   open,
   handleClose,
   options,
   enableDrawerCancelButton,
}) => {
   return (
      <BrandedSwipeableDrawer
         onClose={handleClose}
         onOpen={() => null}
         open={open}
         sx={styles.mobileDrawer}
      >
         <List>
            {options.map((option, index) => {
               const WrapperComponent = option.wrapperComponent || Fragment
               return (
                  <Fragment key={index}>
                     {index !== 0 && <Divider sx={styles.listItemDivider} />}
                     <WrapperComponent>
                        <MobileMenuItem
                           option={option}
                           handleClose={handleClose}
                        />
                     </WrapperComponent>
                  </Fragment>
               )
            })}
            {Boolean(enableDrawerCancelButton) && (
               <Fragment>
                  <Divider sx={styles.listItemDivider} />
                  <ListItemButton
                     onClick={handleClose}
                     sx={[styles.drawerMenuItem]}
                  >
                     <Typography variant="medium">Cancel</Typography>
                  </ListItemButton>
               </Fragment>
            )}
         </List>
      </BrandedSwipeableDrawer>
   )
}

type PopoverMenuProps = {
   options: MenuOption[]
   handleClose: () => void
   anchorEl: HTMLElement | null
   open: boolean
   placement?: MenuPlacement
}

type MenuPlacement = "top" | "bottom"

const DesktopMenu: FC<PopoverMenuProps> = ({
   options,
   handleClose,
   anchorEl,
   open,
   placement = "bottom",
}) => {
   return (
      <BrandedMenu
         onClose={handleClose}
         anchorEl={anchorEl}
         open={open}
         anchorOrigin={{
            vertical: placement == "bottom" ? "bottom" : "top",
            horizontal: placement == "bottom" ? "right" : "left",
         }}
         transformOrigin={{
            vertical: placement == "bottom" ? "top" : "bottom",
            horizontal: placement == "bottom" ? "right" : "left",
         }}
         TransitionProps={{
            unmountOnExit: true,
         }}
      >
         {options.map((option, index) => {
            const WrapperComponent = option.wrapperComponent || Fragment
            return (
               <Box key={index}>
                  <WrapperComponent>
                     <DesktopMenuItem
                        option={option}
                        handleClose={handleClose}
                        hasDivider={index !== options.length - 1}
                     />
                  </WrapperComponent>
               </Box>
            )
         })}
      </BrandedMenu>
   )
}

export type MoreMenuProps = {
   options: MenuOption[]
   isMobileOverride?: boolean
   open: boolean
   anchorEl: HTMLElement | null
   handleClose: () => void
   enableDrawerCancelButton?: boolean
   placement?: MenuPlacement
}

const BrandedResponsiveMenu: FC<MoreMenuProps> = ({
   options,
   isMobileOverride,
   open,
   anchorEl,
   handleClose,
   enableDrawerCancelButton,
   placement,
}) => {
   const defaultIsMobile = useIsMobile()
   const isMobile = isMobileOverride ?? defaultIsMobile

   return (
      <Fragment>
         {isMobile ? (
            <MobileDrawer
               options={options}
               open={open}
               handleClose={handleClose}
               enableDrawerCancelButton={enableDrawerCancelButton}
            />
         ) : (
            <DesktopMenu
               options={options}
               handleClose={handleClose}
               anchorEl={anchorEl}
               open={open}
               placement={placement}
            />
         )}
      </Fragment>
   )
}

const Loader = () => {
   return <CircularProgress sx={styles.loader} size={LOADER_SIZE} />
}

type MobileMenuItemProps = {
   option: MenuOption
   handleClose: () => void
}

const MobileMenuItem: FC<MobileMenuItemProps> = ({ option, handleClose }) => {
   return (
      <ListItemButton
         onClick={async (args) => {
            try {
               await option.handleClick(args)
            } catch (error) {
               console.error(error)
            }
            !option.keepOpen && handleClose()
         }}
         sx={combineStyles(
            [
               styles.drawerMenuItem,
               option.loading && styles.listItemLoading,
               !!option.color && { color: option.color },
            ],
            option.menuItemSxProps
         )}
         disabled={option.disabled || option.loading}
      >
         <Box sx={[styles.icon, styles.iconMobile]}>{option.icon}</Box>
         <Typography variant="brandedBody">{option.label}</Typography>
         {Boolean(option.loading) && <Loader />}
      </ListItemButton>
   )
}

type DesktopMenuItemProps = {
   option: MenuOption
   handleClose: () => void
   hasDivider: boolean
}

const DesktopMenuItem: FC<DesktopMenuItemProps> = ({
   option,
   handleClose,
   hasDivider,
}) => {
   return (
      <MenuItem
         onClick={async (args) => {
            try {
               await option.handleClick(args)
            } catch (error) {
               console.error(error)
            }
            !option.keepOpen && handleClose()
         }}
         disabled={option.disabled || option.loading}
         sx={combineStyles(
            [
               styles.menuItem,
               option.loading && styles.listItemLoading,
               hasDivider && styles.borderBottom,
               option.color && { color: option.color },
            ],
            option.menuItemSxProps
         )}
      >
         <Box sx={styles.icon}>{option.icon}</Box>
         <Typography variant="small">{option.label}</Typography>
         {hasDivider ? <Divider /> : null}
         {Boolean(option.loading) && <Loader />}
      </MenuItem>
   )
}

export default BrandedResponsiveMenu
