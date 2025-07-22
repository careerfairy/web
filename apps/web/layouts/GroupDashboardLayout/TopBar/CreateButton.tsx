import { Button } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useMenuState from "components/custom-hook/useMenuState"
import { Fragment } from "react"
import { PlusCircle } from "react-feather"
import { CreateMenu } from "../CreateMenu"

export const CreateButton = () => {
   const { anchorEl, open, handleClick, handleClose } = useMenuState()

   const isMobile = useIsMobile()

   if (isMobile) {
      return null
   }

   return (
      <Fragment>
         <Button
            onClick={handleClick}
            color="secondary"
            variant="outlined"
            endIcon={<PlusCircle />}
         >
            Create
         </Button>

         <CreateMenu
            open={open}
            anchorEl={anchorEl}
            handleClose={handleClose}
         />
      </Fragment>
   )
}
