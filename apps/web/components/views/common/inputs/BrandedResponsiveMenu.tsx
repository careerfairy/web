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
import { FC, Fragment, ReactElement } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"
import BrandedMenu from "./BrandedMenu"
import BrandedSwipeableDrawer from "./BrandedSwipeableDrawer"
import useIsMobile from "components/custom-hook/useIsMobile"

const LOADER_SIZE = 15

const styles = sxStyles({
   icon: {
      display: "flex",
      alignSelf: "center",
      my: "auto",
      mr: 1,
      svg: {
         width: "18px",
         height: "18px",
         fontSize: "18px",
      },
   },
   menuItem: {
      position: "relative",
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
   singleMenuItem: {
      p: "16px !important",
   },
   drawerMenuItem: {
      p: "17px 20px !important",
      position: "relative",
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
})

export type MenuOption = {
   label: string
   icon?: ReactElement
   handleClick: (args: unknown) => void | Promise<void>
   menuItemSxProps?: SxProps
   disabled?: boolean
   loading?: boolean
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
   enableDrawerCancelButton = true,
}) => {
   return (
      <BrandedSwipeableDrawer
         onClose={handleClose}
         onOpen={() => null}
         open={open}
      >
         <List>
            {options.map((option, index) => (
               <Fragment key={index}>
                  {index !== 0 && <Divider sx={styles.listItemDivider} />}
                  <ListItemButton
                     key={index}
                     onClick={async (args) => {
                        try {
                           await option.handleClick(args)
                        } catch (error) {
                           console.error(error)
                        }
                        handleClose()
                     }}
                     sx={combineStyles(
                        [
                           styles.drawerMenuItem,
                           option.loading && styles.listItemLoading,
                        ],
                        option.menuItemSxProps
                     )}
                     disabled={option.disabled || option.loading}
                  >
                     <Box sx={styles.icon}>{option.icon}</Box>
                     <Typography variant="medium">{option.label}</Typography>
                     {Boolean(option.loading) && <Loader />}
                  </ListItemButton>
               </Fragment>
            ))}
            {Boolean(enableDrawerCancelButton) && (
               <Fragment>
                  <Divider sx={styles.listItemDivider} />
                  <ListItemButton sx={[styles.drawerMenuItem]}>
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
}
const DesktopMenu: FC<PopoverMenuProps> = ({
   options,
   handleClose,
   anchorEl,
   open,
}) => {
   const singleOption = options.length == 1
   return (
      <BrandedMenu
         onClose={handleClose}
         anchorEl={anchorEl}
         open={open}
         anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
         }}
         transformOrigin={{
            vertical: "top",
            horizontal: "right",
         }}
         TransitionProps={{
            unmountOnExit: true,
         }}
      >
         {options.map((option, index) => (
            <Box key={index}>
               <MenuItem
                  onClick={async (args) => {
                     try {
                        await option.handleClick(args)
                     } catch (error) {
                        console.error(error)
                     }
                     handleClose()
                  }}
                  disabled={option.disabled || option.loading}
                  sx={combineStyles(
                     [
                        styles.menuItem,
                        option.loading && styles.listItemLoading,
                        singleOption && styles.singleMenuItem,
                        index !== options.length - 1 && styles.borderBottom,
                     ],
                     option.menuItemSxProps
                  )}
               >
                  <Box sx={styles.icon}>{option.icon}</Box>
                  <Typography variant="xsmall">{option.label}</Typography>
                  {Boolean(options.length - 1 !== index) && <Divider />}
                  {Boolean(option.loading) && <Loader />}
               </MenuItem>
            </Box>
         ))}
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
}

const BrandedResponsiveMenu: FC<MoreMenuProps> = ({
   options,
   isMobileOverride,
   open,
   anchorEl,
   handleClose,
   enableDrawerCancelButton,
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
            />
         )}
      </Fragment>
   )
}

const Loader = () => {
   return <CircularProgress sx={styles.loader} size={LOADER_SIZE} />
}

export default BrandedResponsiveMenu
