import {
   Box,
   Chip,
   ClickAwayListener,
   Popper,
   Stack,
   Typography,
} from "@mui/material"
import { AnimatePresence, motion } from "framer-motion"
import {
   ReactNode,
   useCallback,
   useEffect,
   useId,
   useMemo,
   useRef,
   useState,
} from "react"
import { ChevronDown } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { BrandedCheckbox } from "./inputs/BrandedCheckbox"
import BrandedSwipeableDrawer from "./inputs/BrandedSwipeableDrawer"

const popperContentVariants = {
   closed: {
      opacity: 0,
      scaleY: 0,
      transition: { duration: 0.15, ease: "easeInOut" },
   },
   open: {
      opacity: 1,
      scaleY: 1,
      transition: { duration: 0.15, ease: "easeInOut" },
   },
}

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
      // zIndex: 1,
      mt: "8px !important",
   },
   popperContentWrapper: {
      backgroundColor: "white",
      boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.08)",
      borderRadius: "8px",
      overflow: "hidden",
      width: "353px",
      transformOrigin: "top",
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
   const id = useId()

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

   useEffect(() => {
      const handler = (e: CustomEvent) => {
         if (e.detail !== id) setIsOpen(false)
      }
      window.addEventListener("chipdropdown-open", handler as EventListener)
      return () =>
         window.removeEventListener(
            "chipdropdown-open",
            handler as EventListener
         )
   }, [id])

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

   const handleToggle = () => {
      if (isOpen) {
         setIsOpen(false)
      } else {
         window.dispatchEvent(
            new CustomEvent("chipdropdown-open", { detail: id })
         )
         setIsOpen(true)
      }
   }

   return (
      <ClickAwayListener onClickAway={handleClose} key={label}>
         <Box ref={anchorRef}>
            <Box>
               <Chip
                  sx={[
                     styles.chip,
                     hasSelectedItems && styles.chipWithSelectedItems,
                  ]}
                  label={chipLabel}
                  deleteIcon={
                     <motion.div
                        initial={false}
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        style={{ display: "flex" }}
                     >
                        <Box size={16} component={ChevronDown} />
                     </motion.div>
                  }
                  onDelete={handleToggle}
                  onClick={handleToggle}
               />
            </Box>
            {isDialog ? (
               <BrandedSwipeableDrawer
                  open={isOpen}
                  onClose={handleClose}
                  onOpen={handleToggle}
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
                  open={Boolean(anchorRef.current)}
                  anchorEl={anchorRef.current}
                  placement="bottom-start"
                  sx={styles.popper}
               >
                  <AnimatePresence>
                     {isOpen ? (
                        <motion.div
                           key="popper-content"
                           initial="closed"
                           animate="open"
                           exit="closed"
                           variants={popperContentVariants}
                           style={styles.popperContentWrapper}
                        >
                           <ChipContent
                              options={options}
                              search={search}
                              handleOptionClick={handleOptionClick}
                              isChecked={isChecked}
                           />
                        </motion.div>
                     ) : null}
                  </AnimatePresence>
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
         {search ? <Box p={"12px"}>{search}</Box> : null}
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
