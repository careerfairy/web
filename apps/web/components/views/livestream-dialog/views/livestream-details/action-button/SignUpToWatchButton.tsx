import React, { FC } from "react"
import { useRouter } from "next/router"
import { useActionButtonContext } from "./ActionButtonProvider"
import { Button, Typography } from "@mui/material"
import styles from "./Styles"
import Link from "../../../../common/Link"
import { FloatingButtonWrapper } from "./ActionButton"

const SignUpToWatchButton: FC = () => {
   const { asPath } = useRouter()

   const { isFloating } = useActionButtonContext()

   return (
      <FloatingButtonWrapper isFloating={isFloating}>
         <Button
            id="register-button"
            color="primary"
            sx={styles.btn}
            variant={"contained"}
            fullWidth
            href={`/signup?absolutePath=${asPath}`}
            component={Link}
            disableElevation
            data-testid="livestream-signup-watch-button"
            size="large"
         >
            Sign Up to Watch
         </Button>
         {isFloating ? null : (
            <Typography sx={{ textAlign: "center", marginTop: 2 }}>
               Already have an account?{" "}
               <Link color="inherit" href={`/login?absolutePath=${asPath}`}>
                  Log In
               </Link>
            </Typography>
         )}
      </FloatingButtonWrapper>
   )
}

export default SignUpToWatchButton
