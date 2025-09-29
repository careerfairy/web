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
import { OfflineEventStatus } from "./utils"

type StatusFilterOption = {
   value: OfflineEventStatus
   name: string
}

const statusOptions: StatusFilterOption[] = [
   {
      value: OfflineEventStatus.UPCOMING,
      name: "Upcoming",
   },
   { value: OfflineEventStatus.DRAFT, name: "Draft" },
   { value: OfflineEventStatus.PAST, name: "Past" },
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

type Props = {
   selectedStatuses: OfflineEventStatus[]
   onStatusFilterChange: (statuses: OfflineEventStatus[]) => void
   width?: number | string
}

export const StatusFilterHeader = ({
   selectedStatuses,
   onStatusFilterChange,
   width,
}: Props) => {
   const { open, handleClick, handleClose, anchorEl } = useMenuState()

   const [tempSelectedStatuses, setTempSelectedStatuses] =
      useState<OfflineEventStatus[]>(selectedStatuses)

   // Keep dropdown selections fresh and reset un-applied changes when menu is closed and re-opened
   useEffect(() => {
      if (!open) {
         setTempSelectedStatuses(selectedStatuses)
      }
   }, [selectedStatuses, open])

   const handleStatusToggle = (statusValue: OfflineEventStatus) => {
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
            tooltip="Shows if your offline event is published, still a draft, or has already taken place."
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

            {statusOptions.map((option) => {
               const isChecked = tempSelectedStatuses.includes(option.value)
               return (
                  <MenuItem
                     key={option.value}
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
