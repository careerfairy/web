import { Box, Button, Drawer, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useIsMobile from "components/custom-hook/useIsMobile"
import Link from "next/link"
import { FC, useState } from "react"
import { Menu } from "react-feather"
import { sxStyles } from "types/commonTypes"
import B2CDrawer from "./B2CDrawer"

const styles = sxStyles({
   wrapper: {
      "& svg": {
         width: 24,
         height: 24,
         color: "white !important",
      },
   },
   drawer: {
      display: "flex",
      flexDirection: "column",
      m: 4,
      minWidth: "200px",
   },
   secondaryBtn: {
      color: "neutral.500",
   },
   actions: {
      mt: 3,
   },
   link: {
      color: "black !important",
      px: 1.5,
      py: 1,
      "& a": {
         color: "inherit",
         textDecoration: "none",
      },
      "&:hover, &:active": {
         backgroundColor: "rgba(230, 230, 230, 0.5)",
         borderRadius: "12px",
      },
   },
})

type Props = {
   id: string
}

const MenuBurger: FC<Props> = ({ id }) => {
   const { authenticatedUser } = useAuth()
   const isMobile = useIsMobile()
   const [open, setOpen] = useState(false)

   const isB2C = id === "burger-menu-b2c"

   if (!isMobile) {
      return null
   }
   return (
      <Box sx={[styles.wrapper]}>
         <Button onClick={() => setOpen(true)}>
            <Menu color="black" />
         </Button>
         <Drawer open={open} anchor="right" onClose={() => setOpen(false)}>
            <Box sx={styles.drawer}>
               {isB2C ? (
                  <B2CDrawer onCloseDrawer={() => setOpen(false)} />
               ) : (
                  <Typography variant="brandedBody" sx={styles.link}>
                     <Link href={"/employers"}>For employers</Link>
                  </Typography>
               )}
               <Typography variant="brandedBody" sx={styles.link}>
                  <Link href={"/levels"}>Career guide</Link>
               </Typography>
               <Typography variant="brandedBody" sx={styles.link}>
                  <Link href={"/whos-hiring"}>Who&apos;s hiring</Link>
               </Typography>

               {authenticatedUser.isLoaded && authenticatedUser.isEmpty ? (
                  <Stack spacing={1.5} sx={styles.actions}>
                     <Button
                        sx={styles.secondaryBtn}
                        fullWidth
                        variant="outlined"
                        href={"/login"}
                        component={Link}
                     >
                        Log in
                     </Button>
                     <Button
                        fullWidth
                        variant="contained"
                        href={"/signup"}
                        color="primary"
                        component={Link}
                     >
                        Sign Up
                     </Button>
                  </Stack>
               ) : null}
            </Box>
         </Drawer>
      </Box>
   )
}

export default MenuBurger
