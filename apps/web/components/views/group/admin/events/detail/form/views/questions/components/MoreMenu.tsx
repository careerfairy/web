import { sxStyles } from "@careerfairy/shared-ui"
import {
   Box,
   Divider,
   IconButton,
   MenuItem,
   SwipeableDrawer,
   SxProps,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useMenuState from "components/custom-hook/useMenuState"
import BrandedMenu from "components/views/common/inputs/BrandedMenu"
import { MouseEvent, ReactElement, useCallback, useState } from "react"
import { X as DeleteIcon, Edit2 as EditIcon, MoreVertical } from "react-feather"

const styles = sxStyles({
   icon: {
      display: "flex",
      alignSelf: "center",
      height: "16px",
      width: "16px",
      mr: 1,
      svg: {
         height: "16px",
      },
   },
   deleteMenuItem: {
      color: "error.main",
      py: "12px",
   },
   menu: {
      "& .MuiPaper-root": {
         borderRadius: "6px",
      },
   },
   drawer: {
      ".MuiPaper-root": {
         ":before": {
            content: '""',
            display: "block",
            margin: "auto",
            marginTop: "10px",
            marginBottom: "10px",
            width: "92px",
            height: "3px",
            backgroundColor: "#E1E1E1",
            borderRadius: "10px",
         },
         borderTopLeftRadius: 12,
         borderTopRightRadius: 12,
      },
   },
})

type MobileDrawerProps = {
   isDrawerOpen: boolean
   handleCloseDrawer: (event: MouseEvent<HTMLElement>) => void
} & MoreMenuProps

const MobileDrawer = ({
   isDrawerOpen,
   handleCloseDrawer,
   options,
}: MobileDrawerProps) => {
   return (
      <SwipeableDrawer
         anchor="bottom"
         onClose={handleCloseDrawer}
         onOpen={() => null}
         open={isDrawerOpen}
         sx={styles.drawer}
      >
         {options.map((option, index) => (
            <MenuItem
               key={index}
               onClick={option.handleClick}
               sx={option.menuItemSxProps}
            >
               <Box sx={styles.icon}>{option.icon}</Box>
               {option.label}
            </MenuItem>
         ))}
      </SwipeableDrawer>
   )
}

type Option = {
   label: string
   icon: ReactElement
   handleClick: (args: unknown) => void
   menuItemSxProps?: SxProps
}

type MoreMenuProps = {
   options: Option[]
}

const MoreMenu = ({ options }: MoreMenuProps) => {
   const isMobile = useIsMobile()
   const { anchorEl, handleClick, handleClose, open } = useMenuState()
   const [isDrawerOpen, setIsDrawerOpen] = useState(false)

   const menuClick = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         handleClick(event)
      },
      [handleClick]
   )

   const handleCloseMenu = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         event.stopPropagation()
         handleClose()
      },
      [handleClose]
   )

   const handleOpenDrawer = useCallback((event: MouseEvent<HTMLElement>) => {
      event.stopPropagation()
      setIsDrawerOpen(true)
   }, [])

   const handleCloseDrawer = useCallback((event: MouseEvent<HTMLElement>) => {
      event.stopPropagation()
      setIsDrawerOpen(false)
   }, [])

   if (isMobile) {
      return (
         <>
            <IconButton onClick={handleOpenDrawer} size="small">
               <MoreVertical />
            </IconButton>
            <MobileDrawer
               options={options}
               isDrawerOpen={isDrawerOpen}
               handleCloseDrawer={handleCloseDrawer}
            />
         </>
      )
   }

   return (
      <>
         <IconButton onClick={menuClick} size="small">
            <MoreVertical />
         </IconButton>
         <BrandedMenu
            onClose={handleCloseMenu}
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
            sx={styles.menu}
         >
            {options.map((option, index) => (
               <Box key={index}>
                  <MenuItem
                     onClick={(args) => {
                        handleCloseMenu(args)
                        option.handleClick(args)
                     }}
                     sx={option.menuItemSxProps}
                  >
                     <Box sx={styles.icon}>{option.icon}</Box>
                     {option.label}
                  </MenuItem>
                  {Boolean(options.length - 1 !== index) && <Divider />}
               </Box>
            ))}
         </BrandedMenu>
      </>
   )
}

type MoreMenuWithEditAndRemoveProps = {
   handleEdit: (args: unknown) => void
   handleRemove: (args: unknown) => void
   labels?: string[]
}

const defaultLabels = ["Edit details", "Remove item"]

const MoreMenuWithEditAndRemoveOptions = ({
   handleEdit,
   handleRemove,
   labels = defaultLabels,
}: MoreMenuWithEditAndRemoveProps) => {
   const options: MoreMenuProps["options"] = [
      {
         label: labels[0],
         icon: <EditIcon color="#6B6B7F" />,
         handleClick: handleEdit,
      },
      {
         label: labels[1],
         icon: <DeleteIcon />,
         handleClick: handleRemove,
         menuItemSxProps: styles.deleteMenuItem,
      },
   ]

   return <MoreMenu options={options} />
}

export default MoreMenuWithEditAndRemoveOptions
