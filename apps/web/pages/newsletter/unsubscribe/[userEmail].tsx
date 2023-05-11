import React from "react"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import useSWR from "swr"

import { Container, LinearProgress, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"

import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../../../components/custom-hook/utils/useFunctionsSWRFetcher"
import { MainLogo } from "../../../components/logos"

type UnsubscribeProps = InferGetServerSidePropsType<typeof getServerSideProps>

const UnsubscribePage = (props: UnsubscribeProps) => {
   return (
      <Container maxWidth={"md"}>
         <Stack marginTop={4} alignItems={"center"} width={"100%"} spacing={1}>
            <MainLogo />
            <View {...props} />
         </Stack>
      </Container>
   )
}

const View = (props: UnsubscribeProps) => {
   const { userEmail, signature } = props
   const fetcher = useFunctionsSWR()

   const { data, isValidating, error } = useSWR(
      [
         "unsubscribeFromMarketingEmails_eu",
         {
            email: userEmail,
            signature,
         },
      ],
      fetcher,
      {
         ...reducedRemoteCallsOptions,
         suspense: false,
         revalidateOnFocus: false,
      }
   )

   if (isValidating) {
      return <LinearProgress />
   }

   return (
      <Typography align={"center"}>
         {data ? "You successfully unsubscribed from our newsletter" : ""}
         {error ? `You do not have permission to perform this action` : ""}
      </Typography>
   )
}

export const getServerSideProps = async ({
   params,
   query,
}: GetServerSidePropsContext<{
   userEmail: string
}>) => {
   return {
      props: {
         userEmail: params.userEmail,
         signature: (query?.signature as string) || "",
      },
   }
}

export default UnsubscribePage
