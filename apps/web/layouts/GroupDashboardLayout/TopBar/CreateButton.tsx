import { Button, Fade, menuClasses } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useMenuState from "components/custom-hook/useMenuState"
import { type PopoverMenuProps } from "components/views/common/inputs/BrandedResponsiveMenu"
import { PlusCircle } from "react-feather"
import { CreateMenu } from "../CreateMenu"

const menuProps: Pick<PopoverMenuProps, "sx" | "TransitionComponent"> = {
   sx: {
      [`& .${menuClasses.paper}`]: {
         mt: 1,
      },
   },
   TransitionComponent: Fade,
}

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
            menuProps={menuProps}
         />
      </>
   )
}
