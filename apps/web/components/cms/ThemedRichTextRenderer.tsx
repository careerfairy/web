import React from "react"
import { RichText } from "@graphcms/rich-text-react-renderer"
import { RichTextContent } from "@graphcms/rich-text-types"

import Link from "next/link"
import Image from "next/image"

type Props = {
   rawContent: RichTextContent
}
const ThemedRichTextRenderer = ({ rawContent }: Props) => {
   return (
      <RichText
         content={rawContent}
         renderers={{
            bold: ({ children }) => <b>{children}</b>,
            italic: ({ children }) => <em>{children}</em>,
            underline: ({ children }) => <u>{children}</u>,
            h4: ({ children }) => (
               <h4 className="text-md default-text font-semibold mb-4">
                  {children}
               </h4>
            ),
            h3: ({ children }) => (
               <h3 className="text-xl default-text font-semibold mb-4">
                  {children}
               </h3>
            ),
            p: ({ children }) => (
               <p className="mb-8 default-text">{children}</p>
            ),
            img: ({ title, altText, height, width, src }) => (
               <Image
                  alt={altText || title}
                  height={height}
                  width={width}
                  src={src}
               />
            ),
            a: ({ children, openInNewTab, href, rel, ...rest }) => {
               if (href.match(/^https?:\/\/|^\/\//i)) {
                  return (
                     <a
                        href={href}
                        target={openInNewTab ? "_blank" : "_self"}
                        rel={"noopener noreferrer"}
                        {...rest}
                     >
                        {children}
                     </a>
                  )
               }

               return (
                  <Link href={href}>
                     <a {...rest}>{children}</a>
                  </Link>
               )
            },
         }}
      />
   )
}

export default ThemedRichTextRenderer
