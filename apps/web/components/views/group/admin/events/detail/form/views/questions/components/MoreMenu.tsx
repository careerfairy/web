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
import { Dispatch, ReactElement, SetStateAction, useState } from "react"
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
   setIsDrawerOpen: Dispatch<SetStateAction<boolean>>
} & MoreMenuProps

const MobileDrawer = ({
   isDrawerOpen,
   setIsDrawerOpen,
   options,
}: MobileDrawerProps) => {
   return (
      <SwipeableDrawer
         anchor="bottom"
         onClose={() => setIsDrawerOpen(false)}
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

   if (isMobile) {
      return (
         <>
            <IconButton onClick={() => setIsDrawerOpen(true)} size="small">
               <MoreVertical />
            </IconButton>
            <MobileDrawer
               options={options}
               isDrawerOpen={isDrawerOpen}
               setIsDrawerOpen={setIsDrawerOpen}
            />
         </>
      )
   }

   return (
      <>
         <IconButton onClick={handleClick} size="small">
            <MoreVertical />
         </IconButton>
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
            sx={styles.menu}
         >
            {options.map((option, index) => (
               <Box key={index}>
                  <MenuItem
                     onClick={(args) => {
                        handleClose()
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
