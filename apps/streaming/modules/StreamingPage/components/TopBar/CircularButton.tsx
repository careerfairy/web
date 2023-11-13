import { IconButton, styled } from "@mui/material"

export const CircularButton = styled(IconButton)(({ theme }) => ({
   borderRadius: "50%",
   height: 32,
   width: 32,
   backgroundColor: theme.palette.background.paper,
   [theme.breakpoints.up("tablet")]: {
      height: 40,
      width: 40,
   },
   "& svg": {
      fontSize: 20,
      height: 20,
      width: 20,
   },
   border: `1px solid ${theme.brand.black[400]}`,
}))
