import { NextSeo, NextSeoProps } from "next-seo"
import { useRouter } from "next/router"
import { facebookAppId } from "../../constants/links"
import { getBaseUrl } from "../helperFunctions/HelperFunctions"

const SEO = ({
   image,
   keywords,
   noIndex: noindex = false,
   ...props
}: SeoProps) => {
   const router = useRouter()
   const SEO: NextSeoProps = {
      ...(keywords && { keywords: keywords.toString() }),
      noindex,
      facebook: {
         appId: facebookAppId,
      },
      canonical: (getBaseUrl() + router.asPath).split("?")[0],
      ...props,
      twitter: {
         cardType: props.twitter?.cardType,
         handle: "@FairyCareer",
         site: "@FairyCareer",
      },
      openGraph: {
         ...props.openGraph,
         ...(image && {
            images: [
               ...(props.openGraph?.images || []),
               {
                  alt: props.title,
                  ...image,
               },
            ],
         }),
         url: getBaseUrl() + router.asPath,
      },
   }

   return <NextSeo {...SEO} />
}
export interface SeoProps extends NextSeoProps {
   id?: string
   image?: {
      width?: number
      height?: number
      type?: string
      url: string
      alt?: string
   }
   keywords?: string
   noIndex?: boolean
}

export default SEO
