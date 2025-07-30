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
import { Fragment, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { BrandedCheckbox } from "../../../../common/inputs/BrandedCheckbox"
import { NonSortableHeaderCell } from "./TableHeaderComponents"
import { LivestreamEventStatus } from "./utils"

type StatusFilterOption = {
   value: LivestreamEventStatus
   name: string
}

const statusOptions: StatusFilterOption[] = [
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
   selectedStatuses: LivestreamEventStatus[]
   onStatusFilterChange: (statuses: LivestreamEventStatus[]) => void
}

export const StatusFilterHeader = ({
   selectedStatuses,
   onStatusFilterChange,
}: Props) => {
   const { open, handleClick, handleClose, anchorEl } = useMenuState()

   const [tempSelectedStatuses, setTempSelectedStatuses] =
      useState<LivestreamEventStatus[]>(selectedStatuses)

   const handleStatusToggle = (statusValue: LivestreamEventStatus) => {
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

   return (
      <Fragment>
         <NonSortableHeaderCell
            tooltip="Shows if your live stream is published, still a draft, or available as a recording."
            onClick={handleClick}
            active={open}
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
