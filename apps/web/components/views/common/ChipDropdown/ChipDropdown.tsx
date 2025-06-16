import {
   Box,
   Button,
   Chip,
   ClickAwayListener,
   Popper,
   Stack,
   SxProps,
   Theme,
   Typography,
} from "@mui/material"
import { useTextTruncation } from "components/custom-hook/utils/useTextTruncation"
import { AnimatePresence, motion } from "framer-motion"
import React, {
   ReactNode,
   useCallback,
   useEffect,
   useId,
   useMemo,
   useReducer,
   useRef,
} from "react"
import { ChevronDown } from "react-feather"
import { combineStyles, sxStyles } from "types/commonTypes"
import { BrandedTooltip } from "../../streaming-page/components/BrandedTooltip"
import { BrandedCheckbox } from "../inputs/BrandedCheckbox"
import BrandedSwipeableDrawer from "../inputs/BrandedSwipeableDrawer"
import { StyledHiddenInput } from "../inputs/StyledHiddenInput"
import { useChipDropdownContext } from "./ChipDropdownContext"
import { SearchInputPlugin } from "./plugins/SearchInputPlugin"

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
      backgroundColor: "neutral.50",
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
      overflow: "scroll",
      width: "353px",
      transformOrigin: "top",
      maxHeight: "500px",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": {
         display: "none",
      },
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
      maxWidth: "250px !important",
   },
   applyText: {
      fontWeight: 400,
      color: (theme) => theme.brand.white[100],
   },
   disabledApplyText: {
      color: (theme) => `${theme.brand.black[700]} !important`,
   },
   dialogContentRoot: {
      justifyContent: "space-between",
   },
   paper: {
      maxHeight: "90dvh",
   },
   searchContainer: {
      position: "sticky",
      top: 0,
      zIndex: 1,
      backgroundColor: (theme) =>
         theme.brand.white[100] || theme.palette.background.paper,
   },
   chipContentRoot: {
      scrollbarWidth: "thin",
      flexGrow: 1,
      overflowY: "auto",
      p: 0,
   },
})

type ChipOptions = {
   id: string
   value: string
}

type SelectionOptions = {
   selectedOptions: ChipOptions["value"][]
   onChange: (selectedOptions: ChipOptions["value"][]) => void
   /**
    * Controls if the apply and reset buttons are shown, in this
    * mode the changes are only applied when the apply button is clicked.
    *
    * Passing `false` will not show the apply and reset buttons. Meaning changes are applied immediately.
    * @default true
    */
   showApply?: boolean
   onApply?: () => void
}

type ChipDropdownUI = {
   /**
    * When required parameters are provided, the search input will be rendered.
    *
    * @param locationSearchValue - The value of the search input.
    * @param setLocationSearchValue - The function to set the value of the search input.
    * @param placeholder - The placeholder of the search input.
    */
   search?: {
      locationSearchValue: string
      setLocationSearchValue: (value: string) => void
      placeholder?: string
   }

   /**
    * Custom styles for the dialog component, applies only to the dialog mode, rendered as a swipeable drawer.
    * @default undefined
    *
    */
   dialog?: {
      rootSx?: SxProps<Theme>
      paperSx?: SxProps<Theme>
      contentSx?: SxProps<Theme>
   }
   /**
    * If true, the dropdown will be a dialog.
    * @default false
    */
   isDialog?: boolean
   /**
    * If true, the label will be the same as the label prop.
    * @default false
    */
   forceLabel?: boolean
   /**
    * If true, the dropdown will close when the apply button is clicked.
    * @default true
    */
   closeOnApply?: boolean
   popperSx?: SxProps<Theme>
}

export type SearchInputPluginProps = {
   searchValue: string
   setSearchValue: (value: string) => void
   searchInputRef?: React.MutableRefObject<HTMLInputElement>
   currentAddedOptions: ChipOptions[]
   onDeleteOption: (id: ChipOptions["id"]) => void
   placeholder?: string
}

type ChipDropdownProps = {
   label: string
   options?: ChipOptions[]
   selection: SelectionOptions
   ui?: ChipDropdownUI
   onClose?: () => void
   focusSearchInputOnOpenDialog?: boolean
   onOpen?: () => void
}

type ChipDropdownState = {
   isOpen: boolean
   isDirty: boolean
   selectedMap: Record<string, boolean>
}

type ChipDropdownAction =
   | { type: "TOGGLE_OPEN" }
   | { type: "CLOSE_DROPDOWN" }
   | { type: "CLICK_OPTION"; payload: { optionId: string; showApply: boolean } }
   | { type: "APPLY_CHANGES"; payload: { closeOnApply: boolean } }
   | { type: "RESET_CHANGES" }
   | {
        type: "DELETE_OPTION"
        payload: { optionId: string; showApply: boolean }
     }
   | {
        type: "SYNC_EXTERNAL_SELECTION"
        payload: { selectedOptions?: string[] }
     }

const initialStateFactory = (
   initialSelectedOptions?: string[]
): ChipDropdownState => ({
   isOpen: false,
   isDirty: false,
   selectedMap:
      initialSelectedOptions?.reduce((acc, option) => {
         acc[option] = true
         return acc
      }, {} as Record<string, boolean>) || {},
})

const chipDropdownReducer = (
   state: ChipDropdownState,
   action: ChipDropdownAction
): ChipDropdownState => {
   switch (action.type) {
      case "TOGGLE_OPEN":
         return { ...state, isOpen: !state.isOpen }
      case "CLOSE_DROPDOWN":
         return { ...state, isOpen: false }
      case "CLICK_OPTION": {
         const newSelectedMap = {
            ...state.selectedMap,
            [action.payload.optionId]:
               !state.selectedMap[action.payload.optionId],
         }
         return {
            ...state,
            selectedMap: newSelectedMap,
            isDirty: true,
         }
      }
      case "APPLY_CHANGES":
         return {
            ...state,
            isDirty: false,
            isOpen: action.payload.closeOnApply ? false : state.isOpen,
         }
      case "RESET_CHANGES":
         return {
            ...state,
            selectedMap: {},
            isDirty: false,
         }
      case "DELETE_OPTION": {
         const newSelectedMap = {
            ...state.selectedMap,
            [action.payload.optionId]: false,
         }
         return {
            ...state,
            selectedMap: newSelectedMap,
            isDirty: true,
         }
      }
      case "SYNC_EXTERNAL_SELECTION":
         return {
            ...state,
            isDirty: false,
            selectedMap:
               action.payload.selectedOptions?.reduce((acc, optionId) => {
                  acc[optionId] = true
                  return acc
               }, {} as Record<string, boolean>) || {},
         }
      default:
         return state
   }
}

export const ChipDropdown = ({
   label,
   options,
   selection,
   ui,
   onClose,
   onOpen,
   focusSearchInputOnOpenDialog = false,
}: ChipDropdownProps) => {
   const {
      selectedOptions,
      onChange: handleValueChange,
      showApply = true,
      onApply,
   } = selection
   const {
      search,
      dialog,
      isDialog,
      forceLabel,
      closeOnApply = true,
      popperSx,
   } = ui || {}
   const anchorRef = useRef<HTMLDivElement>(null)
   const searchInputRef = useRef<HTMLInputElement>(null)
   const id = useId()
   const { openDropdownId, setOpenDropdownId } = useChipDropdownContext()
   const proxyInputRef = useRef<HTMLInputElement>(null)

   const isIOS = useMemo(
      () =>
         typeof window !== "undefined" &&
         /iPad|iPhone|iPod/.test(navigator.userAgent),
      []
   )

   const initialSelectedOptions = useMemo(
      () => selection.selectedOptions,
      [selection.selectedOptions]
   )

   const [state, dispatch] = useReducer(
      chipDropdownReducer,
      initialSelectedOptions,
      initialStateFactory
   )
   const { isOpen, isDirty, selectedMap } = state

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

   const itemsToTruncate = useMemo(() => {
      if (forceLabel) return [label]

      const idsToConsider = showApply
         ? selectedOptions || []
         : Object.keys(selectedMap).filter((key) => selectedMap[key])

      if (idsToConsider.length === 0) return [label]

      const names = idsToConsider
         .map((id) => options?.find((opt) => opt.id === id)?.value)
         .filter(Boolean) as string[]
      return names.length > 0 ? names : [label]
   }, [forceLabel, label, options, selectedMap, selectedOptions, showApply])

   const [
      textContainerCallbackRef,
      { truncatedText, plusCount, shouldShowTooltip: tooltipRequired },
   ] = useTextTruncation(itemsToTruncate, ", ")

   const displayChipLabel = useMemo(() => {
      if (forceLabel) return label
      if (itemsToTruncate.length === 0) return label
      return (
         truncatedText ??
         (itemsToTruncate.length > 0 ? itemsToTruncate.join(", ") : label)
      )
   }, [forceLabel, label, itemsToTruncate, truncatedText])

   const tooltipFullLabel = useMemo(() => {
      const currentSelectedIds = showApply
         ? selectedOptions || []
         : Object.keys(selectedMap).filter((key) => selectedMap[key])

      if (currentSelectedIds.length === 0 || !options) {
         return ""
      }

      const selectedNames = currentSelectedIds
         .map((id) => options.find((opt) => opt.id === id)?.value)
         .filter(Boolean)

      return selectedNames.join(", ")
   }, [options, selectedMap, selectedOptions, showApply])

   const isChecked = useCallback(
      (option: string) => {
         return selectedMap[option] ?? false
      },
      [selectedMap]
   )

   const handleActualOptionClick = useCallback(
      (optionId: string) => {
         dispatch({ type: "CLICK_OPTION", payload: { optionId, showApply } })

         if (!showApply) {
            const newSelectedMapAfterClick = {
               ...selectedMap,
               [optionId]: !selectedMap[optionId],
            }
            const newSelectedValues = Object.keys(
               newSelectedMapAfterClick
            ).filter((key) => newSelectedMapAfterClick[key])
            handleValueChange(newSelectedValues)
         }
      },
      [selectedMap, showApply, handleValueChange, dispatch]
   )

   const handleClose = useCallback(() => {
      dispatch({ type: "CLOSE_DROPDOWN" })
      onClose?.()
   }, [onClose])

   const handleToggle = () => {
      dispatch({ type: "TOGGLE_OPEN" })
      if (!isOpen) {
         setOpenDropdownId(id)
      } else {
         if (openDropdownId === id) {
            setOpenDropdownId(null)
         }
      }
   }

   const handleProxyFocus = () => {
      if (!isOpen) {
         handleToggle()
      }

      proxyInputRef.current?.blur()
   }

   const handleChipClick = () => {
      const isDialogWithSearch = isDialog && search
      if (isIOS && isDialogWithSearch && !isOpen) {
         proxyInputRef.current?.focus()
      } else {
         handleToggle()
      }
   }

   const handleApply = useCallback(() => {
      const newSelectedValues = Object.keys(selectedMap).filter(
         (key) => selectedMap[key]
      )
      handleValueChange(newSelectedValues)
      dispatch({ type: "APPLY_CHANGES", payload: { closeOnApply } })
      onApply?.()
   }, [selectedMap, handleValueChange, onApply, closeOnApply])

   const handleReset = useCallback(() => {
      dispatch({ type: "RESET_CHANGES" })
      handleValueChange([])
   }, [handleValueChange, dispatch])

   const handleDeleteOption = useCallback(
      (idToDelete: string) => {
         dispatch({
            type: "DELETE_OPTION",
            payload: { optionId: idToDelete, showApply },
         })

         if (!showApply) {
            const newSelectedMapAfterDelete = {
               ...selectedMap,
               [idToDelete]: false,
            }
            const newSelectedValues = Object.keys(
               newSelectedMapAfterDelete
            ).filter((key) => newSelectedMapAfterDelete[key])
            handleValueChange(newSelectedValues)
         }
      },
      [selectedMap, showApply, handleValueChange, dispatch]
   )

   useEffect(() => {
      if (openDropdownId !== null && openDropdownId !== id && isOpen) {
         dispatch({ type: "CLOSE_DROPDOWN" })
      }
   }, [openDropdownId, id, isOpen])

   useEffect(() => {
      dispatch({
         type: "SYNC_EXTERNAL_SELECTION",
         payload: { selectedOptions: selection.selectedOptions },
      })
   }, [selection.selectedOptions, dispatch])

   useEffect(() => {
      if (isOpen && focusSearchInputOnOpenDialog && searchInputRef.current) {
         searchInputRef.current.focus({ preventScroll: true })
      }
   }, [isOpen, focusSearchInputOnOpenDialog])

   return (
      <ClickAwayListener onClickAway={handleClose}>
         <Box ref={anchorRef} sx={{ position: "relative" }}>
            <BrandedTooltip title={tooltipRequired ? tooltipFullLabel : ""}>
               <Chip
                  sx={[
                     styles.chip,
                     chipShouldBeStyledAsSelected &&
                        styles.chipWithSelectedItems,
                  ]}
                  label={
                     <Box sx={{ position: "relative" }}>
                        {/* Sizer Element */}
                        <Typography
                           component="span"
                           aria-hidden="true"
                           sx={{
                              visibility: "hidden",
                              whiteSpace: "nowrap",
                              // Inherits font styles from .MuiChip-label
                           }}
                        >
                           {label} {/* Original label for sizing only */}
                        </Typography>
                        {/* Actual Display Element */}
                        <Typography
                           ref={textContainerCallbackRef}
                           component="span"
                           sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              display: "flex", // Added to allow alignment of text and plusCount
                              alignItems: "center",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              // minWidth removed, sizing is handled by the sizer
                           }}
                        >
                           {displayChipLabel}
                           {plusCount !== null && plusCount > 0 && (
                              <Typography
                                 component="span"
                                 sx={{
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                 }}
                              >
                                 {`, +${plusCount}`}
                              </Typography>
                           )}
                        </Typography>
                     </Box>
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
                  onDelete={(event) => {
                     event.stopPropagation()
                     handleToggle()
                  }}
                  onClick={handleChipClick}
               />
            </BrandedTooltip>
            {isIOS && isDialog && search ? (
               <StyledHiddenInput
                  ref={proxyInputRef}
                  onFocus={handleProxyFocus}
                  aria-hidden="true"
                  tabIndex={-1}
               />
            ) : null}
            {isDialog ? (
               <BrandedSwipeableDrawer
                  anchor="bottom"
                  open={isOpen}
                  onClose={handleClose}
                  onOpen={handleToggle}
                  PaperProps={{
                     sx: combineStyles(styles.paper, dialog?.paperSx),
                  }}
                  onTransitionEnd={(event) => {
                     // The transition might fire for multiple properties (e.g., opacity for backdrop, transform for paper).
                     // We only want to react to one of them to prevent the logic from running twice.
                     // The `transform` property is a good candidate as it relates to the drawer sliding in.
                     if (event.propertyName !== "transform") {
                        return
                     }
                     // alert("end: transition")
                     if (isOpen) {
                        onOpen?.()
                     }
                  }}
               >
                  <Stack
                     sx={combineStyles(
                        styles.dialogContentRoot,
                        dialog?.rootSx
                     )}
                     justifyContent="space-between"
                  >
                     <Stack>
                        {search ? (
                           <Box p={"12px"} sx={styles.searchContainer}>
                              <SearchInputPlugin
                                 searchValue={search.locationSearchValue}
                                 setSearchValue={search.setLocationSearchValue}
                                 searchInputRef={searchInputRef}
                                 currentAddedOptions={currentAddedOptions}
                                 onDeleteOption={handleDeleteOption}
                                 placeholder={search.placeholder ?? "Search"}
                              />
                           </Box>
                        ) : null}
                        <ChipContent
                           options={options}
                           handleOptionClick={handleActualOptionClick}
                           isChecked={isChecked}
                           rootSx={dialog?.contentSx}
                        />
                     </Stack>
                     {showApply ? (
                        <Stack
                           spacing={1}
                           p={"16px"}
                           borderTop={(theme) =>
                              `1px solid ${theme.brand.white[500]}`
                           }
                           sx={{
                              position: "sticky",
                              bottom: 0,
                              zIndex: 1,
                              backgroundColor: (theme) =>
                                 theme.brand.white[100] ||
                                 theme.palette.background.paper,
                           }}
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
                  </Stack>
               </BrandedSwipeableDrawer>
            ) : (
               <Popper
                  open={Boolean(anchorRef.current)}
                  anchorEl={anchorRef.current}
                  placement="bottom-start"
                  sx={combineStyles(styles.popper, popperSx)}
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
                           <Stack>
                              {search ? (
                                 <Box p={"12px"} sx={styles.searchContainer}>
                                    <SearchInputPlugin
                                       searchValue={search.locationSearchValue}
                                       setSearchValue={
                                          search.setLocationSearchValue
                                       }
                                       currentAddedOptions={currentAddedOptions}
                                       onDeleteOption={handleDeleteOption}
                                       placeholder={
                                          search.placeholder ?? "Search"
                                       }
                                       searchInputRef={searchInputRef}
                                    />
                                 </Box>
                              ) : null}
                              <ChipContent
                                 options={options}
                                 handleOptionClick={handleActualOptionClick}
                                 isChecked={isChecked}
                              />
                           </Stack>
                        </motion.div>
                     ) : null}
                  </AnimatePresence>
               </Popper>
            )}
         </Box>
      </ClickAwayListener>
   )
}

type ChipContentInternalProps = {
   options?: ChipOptions[]
   handleOptionClick: (optionId: ChipOptions["id"]) => void
   isChecked: (optionId: ChipOptions["id"]) => boolean
   search?: ReactNode
   rootSx?: SxProps<Theme>
}

const ChipContentInternal = ({
   options,
   handleOptionClick,
   isChecked,
   rootSx,
}: ChipContentInternalProps) => {
   return (
      <Stack sx={combineStyles(styles.chipContentRoot, rootSx)}>
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

export const ChipContent = ChipContentInternal

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
