import { Grid } from "@mui/material"
import Image from "next/image"
import React from "react"

type Props = {
   message: JSX.Element
}

const NoResultsMessage = ({ message }: Props) => {
   return (
      <>
         <Grid xs={12} mt={{ xs: 12, md: 12 }} textAlign="center" item>
            <Image
               src="/empty-search.svg"
               width="300"
               height="200"
               alt="Empty search illustration"
            />
         </Grid>
         <Grid xs={12} mt={4} mx={1} item>
            {message}
         </Grid>
      </>
   )
}

export default NoResultsMessage
