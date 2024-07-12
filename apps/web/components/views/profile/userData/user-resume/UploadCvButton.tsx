import { UserData } from "@careerfairy/shared-lib/users"
import Add from "@mui/icons-material/Add"
import ArrowDropDown from "@mui/icons-material/ArrowDropDown"
import DeleteForever from "@mui/icons-material/DeleteForever"
import GetApp from "@mui/icons-material/GetApp"
import {
   Button,
   ButtonGroup,
   ClickAwayListener,
   Grow,
   MenuItem,
   MenuList,
   Paper,
   Popper,
} from "@mui/material"
import { useCallback } from "react"
import FilePickerContainer from "../../../../ssr/FilePickerContainer"

const UploadCvButton = ({
   userData,
   classes,
   anchorRef,
   selectedIndex,
   uploadLogo,
   deleteResume,
   handleToggle,
   handleClose,
   buttonChoices,
   handleMenuItemClick,
   openDropdown,
   disabled = false,
   showOnlyButton = false,
}: Props) => {
   const handleClick = useCallback(
      (event, index) => {
         handleMenuItemClick(event, index)
      },
      [handleMenuItemClick]
   )

   return userData && userData.userResume && !disabled ? (
      <>
         <ButtonGroup
            variant="contained"
            className={classes.buttons}
            ref={anchorRef}
            color="inherit"
            aria-label="split button"
            sx={{ marginTop: showOnlyButton ? "0 !important" : "" }}
         >
            {selectedIndex === 0 && (
               <Button href={userData.userResume} target="_blank">
                  <GetApp className={classes.buttonIcon} fontSize="small" />
                  Download CV
               </Button>
            )}
            {selectedIndex === 1 && (
               <FilePickerContainer
                  extensions={["pdf"]}
                  onChange={uploadLogo}
                  maxSize={20}
                  onError={handleError}
               >
                  <Button
                     startIcon={
                        <Add className={classes.buttonIcon} fontSize="small" />
                     }
                     className={classes.button}
                  >
                     Upload New CV [.pdf]
                  </Button>
               </FilePickerContainer>
            )}
            {selectedIndex === 2 && (
               <Button
                  className={classes.button}
                  onClick={deleteResume}
                  startIcon={<DeleteForever fontSize="small" />}
               >
                  Delete CV
               </Button>
            )}
            <Button
               size="small"
               aria-controls={openDropdown ? "split-button-menu" : undefined}
               aria-expanded={openDropdown ? "true" : undefined}
               aria-label="select merge strategy"
               aria-haspopup="menu"
               onClick={handleToggle}
               className={classes.button}
            >
               <ArrowDropDown />
            </Button>
         </ButtonGroup>

         <Popper
            open={openDropdown}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            disablePortal
         >
            {({ TransitionProps, placement }) => (
               <Grow
                  {...TransitionProps}
                  style={{
                     transformOrigin:
                        placement === "bottom" ? "center top" : "center bottom",
                  }}
               >
                  <Paper>
                     <ClickAwayListener onClickAway={handleClose}>
                        <MenuList id="split-button-menu">
                           {buttonChoices.map((option, index) => (
                              <MenuItem
                                 key={option}
                                 selected={index === selectedIndex}
                                 onClick={(event) => handleClick(event, index)}
                              >
                                 {option}
                              </MenuItem>
                           ))}
                        </MenuList>
                     </ClickAwayListener>
                  </Paper>
               </Grow>
            )}
         </Popper>
      </>
   ) : (
      <FilePickerContainer
         extensions={["pdf"]}
         onChange={uploadLogo}
         maxSize={20}
         onError={handleError}
      >
         <Button
            color="primary"
            variant="contained"
            sx={{
               mt: showOnlyButton ? 0 : 3,
            }}
            startIcon={<Add fontSize="small" />}
            disabled={disabled}
         >
            Upload New CV [.pdf]
         </Button>
      </FilePickerContainer>
   )
}

const handleError = (errorMessage: string) => {
   console.log(errorMessage)
}

type Props = {
   userData: UserData
   openDropdown?: boolean
   disabled?: boolean
   showOnlyButton?: boolean
   classes?: any
   anchorRef?: any
   selectedIndex?: number
   uploadLogo: (logoFile) => void
   deleteResume?: () => void
   handleToggle?: () => void
   handleClose?: (event) => void
   buttonChoices?: any[]
   handleMenuItemClick?: (event, index) => void
}

export default UploadCvButton
