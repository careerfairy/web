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
import React, {
   ReactNode,
   useCallback,
   useEffect,
   useId,
   useLayoutEffect,
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
         display: "flex",
         alignItems: "center",
         overflow: "hidden",
         minWidth: 0,
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
         background: (theme) => theme.brand.black[100],
      },
      cursor: "pointer",
   },
   chipContentItemChecked: {
      background: (theme) => theme.brand.white[300],
      "&:hover": {
         background: (theme) => theme.brand.white[400],
      },
   },
   chipContentItemLabel: {
      fontSize: {
         md: "14px",
         sm: "16px",
         xs: "16px",
      },
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
      currentAddedOptions: { id: string; value: string }[],
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
   onApply?: () => void
   /**
    * If true, the label will be the same as the label prop.
    * @default false
    */
   forceLabel?: boolean
   closeOnApply?: boolean
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
   onApply,
   closeOnApply = true,
}: ChipDropdownProps) => {
   const [isOpen, setIsOpen] = useState(false)
   const [isDirty, setIsDirty] = useState(false)
   const anchorRef = useRef<HTMLDivElement>(null)
   const id = useId()

   const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>(
      () =>
         selectedOptions?.reduce((acc, option) => {
            acc[option] = true
            return acc
         }, {} as Record<string, boolean>) || {}
   )

   useEffect(() => {
      const newSelectedMap =
         selectedOptions?.reduce((acc, optionId) => {
            acc[optionId] = true
            return acc
         }, {} as Record<string, boolean>) || {}
      setSelectedMap(newSelectedMap)
      setIsDirty(false)
   }, [selectedOptions])

   const currentAddedOptions = useMemo(() => {
      if (!options) return []
      return Object.keys(selectedMap)
         .filter((id) => selectedMap[id])
         .map((id) => {
            const option = options.find((opt) => opt.id === id)
            return option ? { id, value: option.value } : null
         })
         .filter(Boolean) as { id: string; value: string }[]
   }, [selectedMap, options])

   const chipShouldBeStyledAsSelected = useMemo(() => {
      if (showApply) {
         return (selectedOptions?.length || 0) > 0
      }
      return Object.values(selectedMap).some(Boolean)
   }, [selectedOptions, selectedMap, showApply])

   const displayChipLabel = useMemo(() => {
      if (forceLabel) return label

      const idsToDisplayNamesFor = showApply
         ? selectedOptions || []
         : Object.keys(selectedMap).filter((key) => selectedMap[key])

      if (idsToDisplayNamesFor.length === 0) return label

      const names = idsToDisplayNamesFor
         .map((id) => options?.find((opt) => opt.id === id)?.value)
         .filter(Boolean)
         .join(", ")
      return names || label
   }, [forceLabel, label, options, selectedMap, selectedOptions, showApply])

   const chipLabelTextRef = useRef<HTMLSpanElement>(null)
   const [truncatedLabelText, setTruncatedLabelText] = useState<string | null>(
      null
   )
   const [plusNCount, setPlusNCount] = useState<number | null>(null)

   const tooltipFullLabel = useMemo(() => {
      const currentSelectedIds = showApply
         ? selectedOptions || []
         : Object.keys(selectedMap).filter((key) => selectedMap[key])

      if (currentSelectedIds.length === 0 || !options) {
         return ""
      }

      const selectedNames = currentSelectedIds
         .map((id) => options.find((opt) => opt.id === id)?.value)
         .filter(Boolean) // Filter out any undefined names

      return selectedNames.join(", ")
   }, [options, selectedMap, selectedOptions, showApply])

   useLayoutEffect(() => {
      const textElement = chipLabelTextRef.current
      const labelContainer = textElement?.parentElement

      if (!textElement || !labelContainer || forceLabel || !options) {
         setTruncatedLabelText(null)
         setPlusNCount(null)
         return
      }

      const currentSelectedIds = showApply
         ? selectedOptions || []
         : Object.keys(selectedMap).filter((key) => selectedMap[key])

      if (currentSelectedIds.length === 0) {
         setTruncatedLabelText(null)
         setPlusNCount(null)
         return
      }

      const relevantOptionsValues = currentSelectedIds
         .map((id) => options.find((opt) => opt.id === id)?.value)
         .filter((value): value is string => typeof value === "string")

      if (relevantOptionsValues.length === 0) {
         setTruncatedLabelText(null)
         setPlusNCount(null)
         return
      }

      const fullText = relevantOptionsValues.join(", ")
      const availableWidth = labelContainer.clientWidth

      textElement.style.whiteSpace = "nowrap"
      textElement.textContent = fullText

      const doesFullTextFit = textElement.scrollWidth <= availableWidth
      textElement.style.whiteSpace = ""

      if (doesFullTextFit) {
         setTruncatedLabelText(null)
         setPlusNCount(null)
         textElement.textContent = fullText
      } else {
         const tempMeasureSpan = document.createElement("span")
         const computedStyles = window.getComputedStyle(textElement)
         tempMeasureSpan.style.position = "absolute"
         tempMeasureSpan.style.left = "-9999px"
         tempMeasureSpan.style.top = "-9999px"
         tempMeasureSpan.style.visibility = "hidden"
         tempMeasureSpan.style.whiteSpace = "nowrap"
         tempMeasureSpan.style.fontFamily = computedStyles.fontFamily
         tempMeasureSpan.style.fontSize = computedStyles.fontSize
         tempMeasureSpan.style.fontWeight = computedStyles.fontWeight
         tempMeasureSpan.style.letterSpacing = computedStyles.letterSpacing
         tempMeasureSpan.style.padding = computedStyles.padding
         document.body.appendChild(tempMeasureSpan)

         let bestFitText = ""
         let bestFitCount: number | null = null
         let foundOptimalFit = false

         for (let k = relevantOptionsValues.length - 1; k >= 1; k--) {
            const currentItemsText = relevantOptionsValues
               .slice(0, k)
               .join(", ")
            const hiddenCount = relevantOptionsValues.length - k
            const plusNString = `, +${hiddenCount}`

            tempMeasureSpan.textContent = plusNString
            const plusNWidth = tempMeasureSpan.offsetWidth

            textElement.textContent = currentItemsText
            if (textElement.scrollWidth + plusNWidth <= availableWidth) {
               bestFitText = currentItemsText
               bestFitCount = hiddenCount
               foundOptimalFit = true
               break
            }
         }

         if (!foundOptimalFit && relevantOptionsValues.length > 0) {
            bestFitText = relevantOptionsValues[0]
            const hiddenCount = relevantOptionsValues.length - 1
            bestFitCount = hiddenCount > 0 ? hiddenCount : null
         }

         setTruncatedLabelText(bestFitText)
         setPlusNCount(bestFitCount)
         document.body.removeChild(tempMeasureSpan)
         textElement.textContent = bestFitText
      }
   }, [
      displayChipLabel,
      forceLabel,
      options,
      selectedMap,
      selectedOptions,
      showApply,
      label,
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

   const handleOptionClick = useCallback(
      (optionId: string) => {
         setIsDirty(true)
         const newSelectedMap = {
            ...selectedMap,
            [optionId]: !selectedMap[optionId],
         }
         setSelectedMap(newSelectedMap)

         if (!showApply) {
            const newSelectedValues = Object.keys(newSelectedMap).filter(
               (key) => newSelectedMap[key]
            )
            handleValueChange(newSelectedValues)
         }
      },
      [selectedMap, showApply, handleValueChange]
   )

   const isChecked = useCallback(
      (option: string) => {
         return selectedMap[option] ?? false
      },
      [selectedMap]
   )

   const handleClose = useCallback(() => {
      setIsOpen(false)
      onClose?.()
   }, [onClose])

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
      handleValueChange(newSelectedValues)
      setIsDirty(false)
      onApply?.()
      if (closeOnApply) {
         handleClose()
      }
   }, [selectedMap, handleValueChange, onApply, closeOnApply, handleClose])

   const handleReset = useCallback(() => {
      setSelectedMap({})
      setIsDirty(false)
      handleValueChange([])
   }, [handleValueChange])

   const handleDeleteOption = useCallback(
      (idToDelete: string) => {
         const newSelectedMap = { ...selectedMap, [idToDelete]: false }
         setSelectedMap(newSelectedMap)
         setIsDirty(true)

         if (!showApply) {
            const newSelectedValues = Object.keys(newSelectedMap).filter(
               (key) => newSelectedMap[key]
            )
            handleValueChange(newSelectedValues)
         }
      },
      [selectedMap, showApply, handleValueChange]
   )

   return (
      <ClickAwayListener onClickAway={handleClose}>
         <Box ref={anchorRef}>
            <Box>
               <BrandedTooltip
                  title={chipShouldBeStyledAsSelected ? tooltipFullLabel : ""}
               >
                  <Chip
                     sx={[
                        styles.chip,
                        chipShouldBeStyledAsSelected &&
                           styles.chipWithSelectedItems,
                     ]}
                     label={
                        <>
                           <Typography
                              ref={chipLabelTextRef}
                              component="span"
                              sx={{
                                 whiteSpace: "nowrap",
                                 overflow: "hidden",
                                 textOverflow: "ellipsis",
                                 minWidth: 0,
                              }}
                           >
                              {truncatedLabelText ?? displayChipLabel}
                           </Typography>
                           {plusNCount !== null && plusNCount > 0 && (
                              <Typography
                                 component="span"
                                 sx={{
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                 }}
                              >
                                 {`, +${plusNCount}`}
                              </Typography>
                           )}
                        </>
                     }
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
                        search
                           ? search(currentAddedOptions, handleDeleteOption)
                           : null
                     }
                     handleOptionClick={handleOptionClick}
                     isChecked={isChecked}
                  />
                  {showApply ? (
                     <Stack
                        spacing={1}
                        p={"16px"}
                        borderTop={(theme) =>
                           `1px solid ${theme.brand.white[500]}`
                        }
                     >
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
                                    ? search(
                                         currentAddedOptions,
                                         handleDeleteOption
                                      )
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
   handleOptionClick: (optionId: string) => void
   isChecked: (optionId: string) => boolean
   search?: ReactNode
}

const ChipContentInternal = ({
   options,
   search,
   handleOptionClick,
   isChecked,
}: ChipContentProps) => {
   return (
      <Stack
         p={0}
         maxHeight={"452px"}
         overflow="auto"
         sx={{ scrollbarWidth: "thin" }}
      >
         {search ? <Box p={"12px"}>{search}</Box> : null}
         <Box>
            {options?.map((option) => (
               <ChipContentItem
                  key={option.id}
                  id={option.id}
                  label={option.value}
                  checked={isChecked(option.id)}
                  onItemClick={handleOptionClick}
               />
            ))}
         </Box>
      </Stack>
   )
}

export const ChipContent = React.memo(ChipContentInternal)

type ChipContentItemProps = {
   onItemClick: (id: string) => void
   checked?: boolean
   label: string
   id: string
}

const ChipContentItemInternal = ({
   onItemClick,
   label,
   checked,
   id,
}: ChipContentItemProps) => {
   const handleClick = useCallback(() => {
      onItemClick(id)
   }, [onItemClick, id])

   return (
      <Stack
         direction="row"
         justifyContent="space-between"
         alignItems="center"
         onClick={handleClick}
         sx={[styles.chipContentItem, checked && styles.chipContentItemChecked]}
      >
         <Typography sx={styles.chipContentItemLabel}>{label}</Typography>
         <BrandedCheckbox
            sx={{ p: 0, width: "24px", height: "24px" }}
            checked={checked}
         />
      </Stack>
   )
}

export const ChipContentItem = React.memo(ChipContentItemInternal)
