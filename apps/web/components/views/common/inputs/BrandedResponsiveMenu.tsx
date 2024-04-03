import {
   Box,
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
   singleMenuItem: {
      p: "16px !important",
   },
   drawerMenuItem: {
      p: "17px 20px !important",
   },
   listItemDivider: {
      borderColor: (theme) => theme.brand.black[300],
   },
})

type MenuOption = {
   label: string
   icon?: ReactElement
   handleClick: (args: unknown) => void | Promise<void>
   menuItemSxProps?: SxProps
   disabled?: boolean
}

type MobileDrawerProps = {
   open: boolean
   handleClose: () => void
   options: MenuOption[]
}

const MobileDrawer: FC<MobileDrawerProps> = ({
   open,
   handleClose,
   options,
}) => {
   return (
      <BrandedSwipeableDrawer
         onClose={handleClose}
         onOpen={() => null}
         open={open}
      >
         <List>
            {options.map((option, index) => (
               <>
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
                        styles.drawerMenuItem,
                        option.menuItemSxProps
                     )}
                  >
                     <Box sx={styles.icon}>{option.icon}</Box>
                     <Typography variant="medium">{option.label}</Typography>
                  </ListItemButton>
               </>
            ))}
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
                  disabled={option.disabled}
                  sx={combineStyles(
                     singleOption && styles.singleMenuItem,
                     option.menuItemSxProps
                  )}
               >
                  <Box sx={styles.icon}>{option.icon}</Box>
                  <Typography variant="xsmall">{option.label}</Typography>
               </MenuItem>
               {Boolean(options.length - 1 !== index) && <Divider />}
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
}

const BrandedResponsiveMenu: FC<MoreMenuProps> = ({
   options,
   isMobileOverride,
   open,
   anchorEl,
   handleClose,
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

export default BrandedResponsiveMenu
