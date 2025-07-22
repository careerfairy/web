import {
   Box,
   CircularProgress,
   Divider,
   List,
   ListItemButton,
   MenuItem,
   MenuProps,
   SwipeableDrawerProps,
   SxProps,
   Typography,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import {
   ComponentType,
   FC,
   Fragment,
   MouseEvent,
   ReactElement,
   ReactEventHandler,
} from "react"
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
   list: {
      py: 0,
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
      p: "16px 20px !important",
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
   options: MenuOption[]
   enableDrawerCancelButton?: boolean
} & Omit<SwipeableDrawerProps, "onOpen">

const MobileDrawer: FC<MobileDrawerProps> = ({
   open,
   options,
   enableDrawerCancelButton,
   onClose,
   ...swipeableDrawerProps
}) => {
   return (
      <BrandedSwipeableDrawer
         onOpen={() => null}
         onClose={onClose}
         open={open}
         sx={styles.mobileDrawer}
         {...swipeableDrawerProps}
      >
         <List sx={styles.list}>
            {options.map((option, index) => {
               const WrapperComponent = option.wrapperComponent || Fragment
               return (
                  <Fragment key={index}>
                     {index !== 0 && <Divider sx={styles.listItemDivider} />}
                     <WrapperComponent>
                        <MobileMenuItem option={option} handleClose={onClose} />
                     </WrapperComponent>
                  </Fragment>
               )
            })}
            {Boolean(enableDrawerCancelButton) && (
               <Fragment>
                  <Divider sx={styles.listItemDivider} />
                  <ListItemButton
                     onClick={onClose}
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

export type PopoverMenuProps = {
   options: MenuOption[]
   placement?: MenuPlacement
} & MenuProps

type MenuPlacement = "top" | "bottom"

const DesktopMenu = ({
   options,
   placement = "bottom",
   sx,
   TransitionComponent,
   onClose,
   ...props
}: PopoverMenuProps) => {
   return (
      <BrandedMenu
         onClose={onClose}
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
         TransitionComponent={TransitionComponent}
         sx={sx}
         {...props}
      >
         {options.map((option, index) => {
            const WrapperComponent = option.wrapperComponent || Fragment
            return (
               <Box key={index}>
                  <WrapperComponent>
                     <DesktopMenuItem
                        option={option}
                        handleClose={(e) => onClose(e, "backdropClick")}
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
   disableSwipeToOpen?: boolean
   menuProps?: Pick<PopoverMenuProps, "sx" | "TransitionComponent">
}

const BrandedResponsiveMenu: FC<MoreMenuProps> = ({
   options,
   isMobileOverride,
   open,
   anchorEl,
   handleClose,
   enableDrawerCancelButton,
   placement,
   disableSwipeToOpen,
   menuProps,
}) => {
   const defaultIsMobile = useIsMobile()
   const isMobile = isMobileOverride ?? defaultIsMobile

   return (
      <Fragment>
         {isMobile ? (
            <MobileDrawer
               options={options}
               open={open}
               onClose={handleClose}
               enableDrawerCancelButton={enableDrawerCancelButton}
               disableSwipeToOpen={disableSwipeToOpen}
            />
         ) : (
            <DesktopMenu
               options={options}
               onClose={handleClose}
               anchorEl={anchorEl}
               open={open}
               placement={placement}
               {...menuProps}
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
   handleClose: ReactEventHandler
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
            !option.keepOpen && handleClose(args)
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
   handleClose: (e?: MouseEvent<HTMLElement>) => void
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
