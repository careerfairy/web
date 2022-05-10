import { NextSeo, NextSeoProps } from "next-seo"
import { useRouter } from "next/router"
import { getBaseUrl } from "../helperFunctions/HelperFunctions"

const SEO = ({
   id,
   image,
   keywords,
   noIndex: noindex = false,
   ...props
}: Props) => {
   const router = useRouter()

   const SEO = {
      ...(keywords && { keywords: keywords.toString() }),
      noindex,
      openGraph: {
         ...(image && {
            images: [
               {
                  alt: props.title,
                  ...image,
               },
            ],
         }),
         url: getBaseUrl() + router.asPath,
         ...props,
      },
      ...props,
   }

   return <NextSeo {...SEO} />
}
interface Props extends NextSeoProps {
   id?: string
   image?: {
      width?: number
      height?: number
      type?: string
      url: string
   }
   keywords?: string
   noIndex?: boolean
}

export default SEO
