import { Box, Button, Drawer, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { FC, useState } from "react"
import { Menu } from "react-feather"
import B2CDrawer from "./B2CDrawer"
import Link from "next/link"
import { sxStyles } from "types/commonTypes"
import { useAuth } from "HOCs/AuthProvider"

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
            <Menu />
         </Button>
         <Drawer open={open} anchor="right" onClose={() => setOpen(false)}>
            <Box sx={styles.drawer}>
               {isB2C ? (
                  <B2CDrawer onCloseDrawer={() => setOpen(false)} />
               ) : (
                  <Link href={"/employers"}>
                     <Typography variant="brandedBody" color={"neutral.700"}>
                        For employers
                     </Typography>
                  </Link>
               )}

               {authenticatedUser.isLoaded && authenticatedUser.isEmpty ? (
                  <Stack spacing={1.5} sx={styles.actions}>
                     <Button
                        sx={styles.secondaryBtn}
                        fullWidth
                        variant="outlined"
                        color="grey"
                        href={`/login`}
                        component={Link}
                     >
                        Log in
                     </Button>

                     <Button
                        fullWidth
                        variant="contained"
                        href={`/signup`}
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
