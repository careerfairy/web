import { Button, menuClasses } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useMenuState from "components/custom-hook/useMenuState"
import { PlusCircle } from "react-feather"
import { CreateMenu } from "../CreateMenu"

export const CreateButton = () => {
   const { anchorEl, open, handleClick, handleClose } = useMenuState()

   const isMobile = useIsMobile()

   if (isMobile) {
      return null
   }

   return (
      <>
         <Button
            onClick={handleClick}
            color="secondary"
            variant="outlined"
            endIcon={<PlusCircle />}
            sx={[
               open && {
                  backgroundColor: "secondary.100",
               },
            ]}
         >
            Create
         </Button>

         <CreateMenu
            open={open}
            anchorEl={anchorEl}
            handleClose={handleClose}
            menuSx={{
               [`& .${menuClasses.paper}`]: {
                  mt: 1,
               },
            }}
         />
      </>
   )
}
