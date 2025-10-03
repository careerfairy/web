import {
   Box,
   Button,
   Menu,
   MenuItem,
   MenuProps,
   Stack,
   Typography,
} from "@mui/material"
import useMenuState from "components/custom-hook/useMenuState"
import { Fragment, useEffect, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { BrandedCheckbox } from "../../../../common/inputs/BrandedCheckbox"
import { NonSortableHeaderCell } from "./TableHeaderComponents"
import { LivestreamEventStatus } from "./utils"

type StatusFilterOption<T = LivestreamEventStatus> = {
   value: T
   name: string
}

// Default status options for livestream events
const defaultLivestreamStatusOptions: StatusFilterOption<LivestreamEventStatus>[] =
   [
      {
         value: LivestreamEventStatus.UPCOMING,
         name: "Published",
      },
      { value: LivestreamEventStatus.DRAFT, name: "Draft" },
      { value: LivestreamEventStatus.RECORDING, name: "Recorded" },
      {
         value: LivestreamEventStatus.NOT_RECORDED,
         name: "Recording not available",
      },
   ]

const styles = sxStyles({
   menuPaper: {
      borderRadius: "6px",
      border: (theme) => `1px solid ${theme.brand.white[500]}`,
      backgroundColor: (theme) => theme.brand.white[100],
      width: 294,
      marginLeft: "-46px",
      marginTop: "2px",
      boxShadow: "0px 0px 8px 0px rgba(20,20,20,0.06)",
      filter: "none",
   },
   menuHeader: {
      px: 2,
      py: 1.5,
      borderBottom: "1px solid",
      borderColor: (theme) => theme.brand.white[400],
   },
   menuItem: {
      p: 2,
      backgroundColor: (theme) => theme.brand.white[50],
      "&:hover": {
         backgroundColor: (theme) => theme.brand.black[100],
      },
   },
   menuItemActive: {
      p: 2,
      backgroundColor: (theme) => theme.brand.white[300],
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[400],
      },
   },
   menuFooter: {
      borderTop: (theme) => `1px solid ${theme.brand.white[400]}`,
      px: 2,
      py: 1,
   },
   checkboxUnchecked: {
      "& .MuiCheckbox-root": {
         backgroundColor: (theme) => theme.palette.neutral[50],
         "&:hover": {
            backgroundColor: (theme) => theme.palette.neutral[100],
         },
      },
   },
   checkboxChecked: {
      "& .MuiCheckbox-root": {
         backgroundColor: (theme) => theme.brand.purple[50],
      },
   },
   statusFilterHeader: {
      pl: 1,
   },
})

const slotProps: MenuProps["slotProps"] = {
   paper: {
      sx: styles.menuPaper,
   },
}

const menuListProps: MenuProps["MenuListProps"] = {
   sx: {
      p: 0,
   },
}

type Props<T = LivestreamEventStatus> = {
   selectedStatuses: T[]
   onStatusFilterChange: (statuses: T[]) => void
   statusOptions?: StatusFilterOption<T>[]
   tooltip?: string
   width?: number | string
}

export const StatusFilterHeader = <T = LivestreamEventStatus,>({
   selectedStatuses,
   onStatusFilterChange,
   statusOptions = defaultLivestreamStatusOptions as StatusFilterOption<T>[],
   tooltip = "Shows if your live stream is published, still a draft, or available as a recording.",
   width,
}: Props<T>) => {
   const { open, handleClick, handleClose, anchorEl } = useMenuState()

   const [tempSelectedStatuses, setTempSelectedStatuses] =
      useState<T[]>(selectedStatuses)

   // Keep dropdown selections fresh and reset un-applied changes when menu is closed and re-opened
   useEffect(() => {
      if (!open) {
         setTempSelectedStatuses(selectedStatuses)
      }
   }, [selectedStatuses, open])

   const handleStatusToggle = (statusValue: T) => {
      setTempSelectedStatuses((prev) =>
         prev.includes(statusValue)
            ? prev.filter((status) => status !== statusValue)
            : [...prev, statusValue]
      )
   }

   const handleApply = () => {
      onStatusFilterChange(tempSelectedStatuses)
      handleClose()
   }

   const hasActiveFilter = selectedStatuses.length > 0

   return (
      <Fragment>
         <NonSortableHeaderCell
            tooltip={tooltip}
            onClick={handleClick}
            active={open || hasActiveFilter}
            width={width}
            sx={styles.statusFilterHeader}
         >
            Status
         </NonSortableHeaderCell>

         <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={slotProps}
            anchorOrigin={{
               vertical: "bottom",
               horizontal: "left",
            }}
            transformOrigin={{
               vertical: "top",
               horizontal: "left",
            }}
            MenuListProps={menuListProps}
         >
            <Box sx={styles.menuHeader}>
               <Typography variant="small" color="neutral.800">
                  Show status
               </Typography>
            </Box>

            {statusOptions.map((option, index) => {
               const isChecked = tempSelectedStatuses.includes(option.value)
               return (
                  <MenuItem
                     key={index}
                     sx={isChecked ? styles.menuItemActive : styles.menuItem}
                     onClick={() => handleStatusToggle(option.value)}
                     disableRipple
                     dense
                  >
                     <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                     >
                        <Typography variant="small" color="neutral.800">
                           {option.name}
                        </Typography>
                        <Box
                           sx={
                              isChecked
                                 ? styles.checkboxChecked
                                 : styles.checkboxUnchecked
                           }
                        >
                           <BrandedCheckbox checked={isChecked} sx={{ p: 0 }} />
                        </Box>
                     </Stack>
                  </MenuItem>
               )
            })}

            <Stack
               sx={styles.menuFooter}
               direction="row"
               justifyContent="flex-end"
            >
               <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={handleApply}
               >
                  Apply
               </Button>
            </Stack>
         </Menu>
      </Fragment>
   )
}
