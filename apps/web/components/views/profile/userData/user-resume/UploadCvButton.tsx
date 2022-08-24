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
import GetApp from "@mui/icons-material/GetApp"
import Add from "@mui/icons-material/Add"
import DeleteForever from "@mui/icons-material/DeleteForever"
import ArrowDropDown from "@mui/icons-material/ArrowDropDown"
import FilePickerContainer from "../../../../ssr/FilePickerContainer"
import { UserData } from "@careerfairy/shared-lib/dist/users"

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
}: Props) => {
   return userData && userData.userResume && !disabled ? (
      <>
         <ButtonGroup
            variant="contained"
            className={classes.buttons}
            ref={anchorRef}
            color="inherit"
            aria-label="split button"
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
                  onError={(errMsg) => console.log(errMsg)}
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
                                 onClick={(event) =>
                                    handleMenuItemClick(event, index)
                                 }
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
         onError={(errMsg) => console.log(errMsg)}
      >
         <Button
            color="primary"
            variant="contained"
            sx={{
               mt: 3,
            }}
            startIcon={<Add fontSize="small" />}
            disabled={disabled}
         >
            Upload New CV [.pdf]
         </Button>
      </FilePickerContainer>
   )
}

type Props = {
   userData: UserData
   openDropdown?: boolean
   disabled?: boolean
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
