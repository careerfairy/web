import {
   Box,
   Chip,
   ClickAwayListener,
   Popper,
   Stack,
   Typography,
} from "@mui/material"
import { ReactNode, useCallback, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronUp } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { BrandedCheckbox } from "./inputs/BrandedCheckbox"
import BrandedSwipeableDrawer from "./inputs/BrandedSwipeableDrawer"

const styles = sxStyles({
   chip: {
      p: "8px 12px 8px 16px",
      "& .MuiChip-label": {
         pl: 0,
         pr: "8px",
         fontSize: "14px",
         fontWeight: "400",
         color: "neutral.700",
      },
      "& svg": {
         m: "0px !important",
         color: (theme) => `${theme.palette.neutral[700]} !important`,
      },
      maxWidth: "170px",
   },
   popper: {
      zIndex: 1,
      width: "353px",
      backgroundColor: "white",
      mt: "8px !important",
      boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.08)",
      borderRadius: "8px",
      overflow: "hidden",
      "& .MuiAutocomplete-inputRoot": {
         display: "none",
      },
      "& .MuiAutocomplete-endAdornment": {
         display: "none",
      },
   },
   chipContentItem: {
      p: "12px",
      background: (theme) => theme.brand.white[100],
      "&:hover": {
         background: (theme) => theme.brand.white[300],
      },
      cursor: "pointer",
   },
   chipContentItemLabel: {
      color: (theme) => theme.palette.neutral[700],
      fontWeight: 400,
   },
   chipWithSelectedItems: {
      background: (theme) => theme.palette.primary[500],
      "&:hover": {
         background: (theme) => theme.palette.primary[600],
      },
      "& .MuiChip-label": {
         color: (theme) => theme.brand.white[50],
      },
      "& svg": {
         color: (theme) => `${theme.brand.white[50]} !important`,
      },
   },
})

type ChipDropdownProps = {
   label: string
   options?: { id: string; value: string }[]
   selectedOptions?: string[]
   isDialog?: boolean
   search?: ReactNode
   handleValueChange: (value: string[]) => void
}

export const ChipDropdown = ({
   label,
   options,
   handleValueChange,
   search,
   selectedOptions,
   isDialog,
}: ChipDropdownProps) => {
   const [isOpen, setIsOpen] = useState(false)
   const anchorRef = useRef<HTMLDivElement>(null)

   const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>(
      () => {
         return (
            selectedOptions?.reduce((acc, option) => {
               acc[option] = true
               return acc
            }, {} as Record<string, boolean>) || {}
         )
      }
   )

   const [hasSelectedItems, setHasSelectedItems] = useState(
      selectedOptions?.length > 0
   )

   const chipLabel = useMemo(() => {
      return hasSelectedItems
         ? options
              ?.filter((option) => selectedMap[option.id])
              ?.map((option) => option.value)
              ?.join(", ")
         : label
   }, [options, selectedMap, label, hasSelectedItems])

   const handleOptionClick = (option: string) => {
      const newSelectedMap = { ...selectedMap, [option]: !selectedMap[option] }
      const newSelectedValues = Object.keys(newSelectedMap).filter(
         (key) => newSelectedMap[key]
      )

      setSelectedMap(newSelectedMap)
      handleValueChange(newSelectedValues)
      setHasSelectedItems(newSelectedValues?.length > 0)
   }

   const isChecked = useCallback(
      (option: string) => {
         return selectedMap[option] ?? false
      },
      [selectedMap]
   )

   const handleClose = () => {
      setIsOpen(false)
   }

   const handleOpen = () => {
      setIsOpen(true)
   }

   return (
      <ClickAwayListener onClickAway={handleClose}>
         <Box>
            <Box ref={anchorRef}>
               <Chip
                  sx={[
                     styles.chip,
                     hasSelectedItems && styles.chipWithSelectedItems,
                  ]}
                  label={chipLabel}
                  deleteIcon={
                     <Box
                        size={16}
                        component={isOpen ? ChevronUp : ChevronDown}
                     />
                  }
                  onDelete={() => setIsOpen((prev) => !prev)}
                  onClick={() => setIsOpen((prev) => !prev)}
               />
            </Box>
            {isDialog ? (
               <BrandedSwipeableDrawer
                  open={isOpen}
                  onClose={handleClose}
                  onOpen={handleOpen}
               >
                  <ChipContent
                     options={options}
                     search={search}
                     handleOptionClick={handleOptionClick}
                     isChecked={isChecked}
                  />
               </BrandedSwipeableDrawer>
            ) : (
               <Popper
                  open={isOpen}
                  anchorEl={anchorRef.current}
                  placement="bottom-start"
                  sx={styles.popper}
               >
                  <ChipContent
                     options={options}
                     search={search}
                     handleOptionClick={handleOptionClick}
                     isChecked={isChecked}
                  />
               </Popper>
            )}
         </Box>
      </ClickAwayListener>
   )
}

type ChipContentProps = Omit<
   ChipDropdownProps,
   "label" | "openDialog" | "handleValueChange"
> & {
   handleOptionClick?: (option: string) => void
   isChecked: (option: string) => boolean
}

const ChipContent = ({
   options,
   search,
   handleOptionClick,
   isChecked,
}: ChipContentProps) => {
   return (
      <Stack p={0} maxHeight={300} overflow="auto">
         {search}
         <Box>
            {options?.map((option) => (
               <ChipContentItem
                  key={option.id}
                  label={option.value}
                  checked={isChecked(option.id)}
                  onClick={() => {
                     handleOptionClick?.(option.id)
                  }}
               />
            ))}
         </Box>
      </Stack>
   )
}

type ChipContentItemProps = {
   onClick?: () => void
   checked?: boolean
   label: string
}

const ChipContentItem = ({ onClick, label, checked }: ChipContentItemProps) => {
   return (
      <Stack
         direction="row"
         justifyContent="space-between"
         alignItems="center"
         onClick={onClick}
         sx={styles.chipContentItem}
      >
         <Typography variant="brandedBody" sx={styles.chipContentItemLabel}>
            {label}
         </Typography>
         <BrandedCheckbox
            sx={{ p: 0, width: "24px", height: "24px" }}
            checked={checked}
         />
      </Stack>
   )
}
