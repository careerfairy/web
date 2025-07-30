import {
   Box,
   Button,
   Menu,
   MenuItem,
   MenuProps,
   Stack,
   Typography,
} from "@mui/material"
import { Fragment, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { LivestreamStatusFilter } from "../../../../../custom-hook/live-stream/useGroupLivestreamsWithStats"
import { BrandedCheckbox } from "../../../../common/inputs/BrandedCheckbox"
import { NonSortableHeaderCell } from "./TableHeaderComponents"

type StatusFilterOption = {
   value: LivestreamStatusFilter
   name: string
}

const statusOptions: StatusFilterOption[] = [
   {
      value: LivestreamStatusFilter.PUBLISHED,
      name: "Published",
   },
   { value: LivestreamStatusFilter.DRAFT, name: "Draft" },
   { value: LivestreamStatusFilter.RECORDED, name: "Recorded" },
   {
      value: LivestreamStatusFilter.RECORDING_NOT_AVAILABLE,
      name: "Recording not available",
   },
]

const styles = sxStyles({
   menuPaper: {
      borderRadius: "6px",
      border: "1px solid",
      borderColor: (theme) => theme.brand.white[500],
      boxShadow: "0px 0px 8px 0px rgba(20,20,20,0.06)",
      backgroundColor: (theme) => theme.brand.white[100],
      width: 294,
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
   selectedStatuses: LivestreamStatusFilter[]
   onStatusFilterChange: (statuses: LivestreamStatusFilter[]) => void
}

export const StatusFilterHeader = ({
   selectedStatuses,
   onStatusFilterChange,
}: Props) => {
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
   const [tempSelectedStatuses, setTempSelectedStatuses] =
      useState<LivestreamStatusFilter[]>(selectedStatuses)

   const isOpen = Boolean(anchorEl)

   const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget)
      setTempSelectedStatuses(selectedStatuses)
   }

   const handleClose = () => {
      setAnchorEl(null)
   }

   const handleStatusToggle = (statusValue: LivestreamStatusFilter) => {
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
            active={isOpen}
         >
            Status
         </NonSortableHeaderCell>

         <Menu
            anchorEl={anchorEl}
            open={isOpen}
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
