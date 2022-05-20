import React, { FC } from "react"
import Box from "@mui/material/Box"
import FooterV2 from "../components/views/footer/FooterV2"
import GenericHeader from "../components/views/header/GenericHeader"
import GenericDrawer from "../components/views/navbar/GenericDrawer"
import Page from "../components/views/common/Page"

type Props = {}
const WishListLayout: FC<Props> = ({ children }) => {
   return (
      <Page backgroundColor={"white"}>
         <GenericHeader transparent />
         <GenericDrawer />
         <Box component={"main"}>{children}</Box>
         <FooterV2 sx={{ mt: "auto" }} />
      </Page>
   )
}

export default WishListLayout
