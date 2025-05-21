import {
   Box,
   Button,
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
import { BrandedTooltip } from "../streaming-page/components/BrandedTooltip"
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
   applyText: {
      fontWeight: 400,
      color: (theme) => theme.brand.white[100],
   },
   disabledApplyText: {
      color: (theme) => `${theme.brand.black[700]} !important`,
   },
})

type ChipDropdownProps = {
   label: string
   options?: { id: string; value: string }[]
   selectedOptions?: string[]
   isDialog?: boolean
   /**
    * A render prop for the search UI, receives addedOptions and onDeleteOption
    */
   search?: (
      addedOptions: { id: string; value: string }[],
      onDeleteOption: (id: string) => void
   ) => ReactNode
   handleValueChange: (value: string[]) => void
   onClose?: () => void
   /**
    * Controls if the apply and reset buttons are shown, in this
    * mode the changes are only applied when the apply button is clicked.
    *
    * Passing `false` will not show the apply and reset buttons. Meaning changes are applied immediately.
    * @default true
    */
   showApply?: boolean

   /**
    * If true, the label will be the same as the label prop.
    * @default false
    */
   forceLabel?: boolean
}

export const ChipDropdown = ({
   label,
   options,
   handleValueChange,
   search,
   selectedOptions,
   isDialog,
   showApply = true,
   forceLabel = false,
   onClose,
}: ChipDropdownProps) => {
   const [isOpen, setIsOpen] = useState(false)
   const [isDirty, setIsDirty] = useState(false)
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

   const [addedOptions, setAddedOptions] = useState<
      { id: string; value: string }[]
   >(() => {
      return (
         selectedOptions?.map((option) => ({
            id: option,
            value: options?.find((o) => o.id === option)?.value,
         })) || []
      )
   })

   const [hasSelectedItems, setHasSelectedItems] = useState(
      selectedOptions?.length > 0
   )

   const chipLabel = useMemo(() => {
      if (forceLabel) {
         return label
      }
      if (showApply) {
         if (selectedOptions?.length === 0) {
            return label
         }
         return options
            ?.filter((option) => selectedOptions?.includes(option?.id))
            ?.map((option) => option.value)
            ?.join(", ")
      }
      return hasSelectedItems
         ? options
              ?.filter(
                 (option) =>
                    selectedMap[option.id] &&
                    selectedOptions?.includes(option.id)
              )
              ?.map((option) => option.value)
              ?.join(", ")
         : label
   }, [
      options,
      selectedMap,
      label,
      hasSelectedItems,
      selectedOptions,
      showApply,
      forceLabel,
   ])

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

   const handleChange = useCallback(
      (newSelectedValues: string[]) => {
         handleValueChange(newSelectedValues)
         setHasSelectedItems(newSelectedValues?.length > 0)
         setAddedOptions(
            newSelectedValues?.map((option) => ({
               id: option,
               value: options?.find((o) => o.id === option)?.value,
            })) || []
         )
      },
      [handleValueChange, options]
   )

   const handleOptionClick = (option: string) => {
      setIsDirty(true)
      const newSelectedMap = { ...selectedMap, [option]: !selectedMap[option] }
      const newSelectedValues = Object.keys(newSelectedMap).filter(
         (key) => newSelectedMap[key]
      )

      setSelectedMap(newSelectedMap)
      if (!showApply) {
         handleChange(newSelectedValues)
      }
   }

   const isChecked = useCallback(
      (option: string) => {
         return selectedMap[option] ?? false
      },
      [selectedMap]
   )

   const handleClose = () => {
      setIsOpen(false)
      onClose?.()
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

   const handleApply = useCallback(() => {
      const newSelectedValues = Object.keys(selectedMap).filter(
         (key) => selectedMap[key]
      )

      handleChange(newSelectedValues)
      setIsDirty(false)
   }, [handleChange, selectedMap])

   const handleReset = useCallback(() => {
      setSelectedMap({})
      setIsDirty(false)
      handleChange([])
   }, [handleChange])

   const handleDeleteOption = useCallback(
      (id: string) => {
         // Remove the option from selectedMap
         setSelectedMap((prev) => {
            setAddedOptions((prevAddedOptions) =>
               prevAddedOptions.filter((option) => option.id !== id)
            )
            return { ...prev, [id]: false }
         })
         // If not showApply, update immediately
         if (!showApply) {
            const newSelectedValues = Object.keys(selectedMap).filter(
               (key) => key !== id && selectedMap[key]
            )
            handleChange(newSelectedValues)
         }
         setIsDirty(true)
      },
      [handleChange, selectedMap, showApply]
   )

   return (
      <ClickAwayListener onClickAway={handleClose}>
         <Box ref={anchorRef}>
            <Box>
               <BrandedTooltip title={hasSelectedItems ? chipLabel : ""}>
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
               </BrandedTooltip>
            </Box>
            {isDialog ? (
               <BrandedSwipeableDrawer
                  open={isOpen}
                  onClose={handleClose}
                  onOpen={handleToggle}
               >
                  <ChipContent
                     options={options}
                     search={
                        search ? search(addedOptions, handleDeleteOption) : null
                     }
                     handleOptionClick={handleOptionClick}
                     isChecked={isChecked}
                  />
                  {showApply ? (
                     <Stack spacing={1} p={"16px"}>
                        <Button
                           variant="contained"
                           color={"primary"}
                           onClick={handleApply}
                           disabled={!isDirty}
                        >
                           <Typography
                              variant="brandedBody"
                              sx={[
                                 styles.applyText,
                                 !isDirty && styles.disabledApplyText,
                              ]}
                           >
                              Apply
                           </Typography>
                        </Button>
                        <Button variant="text" onClick={handleReset}>
                           <Typography
                              variant="brandedBody"
                              color="neutral.600"
                              fontWeight={400}
                           >
                              Reset
                           </Typography>
                        </Button>
                     </Stack>
                  ) : null}
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
                              search={
                                 search
                                    ? search(addedOptions, handleDeleteOption)
                                    : null
                              }
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
   "label" | "openDialog" | "handleValueChange" | "search"
> & {
   handleOptionClick?: (option: string) => void
   isChecked: (option: string) => boolean
   search?: ReactNode
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
