import { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import parseHtml, {
   domToReact,
   Element,
   HTMLReactParserOptions,
} from "html-react-parser"
import get from "lodash/get"
import React, { ReactElement } from "react"

// Determines if URL is internal or external
function isUrlInternal(link: string): boolean {
   if (
      !link ||
      link.indexOf(`https:`) === 0 ||
      link.indexOf(`#`) === 0 ||
      link.indexOf(`http`) === 0 ||
      link.indexOf(`://`) === 0
   ) {
      return false
   }
   return true
}

// Replaces DOM nodes with React components
function replace(node: Element): ReactElement | false {
   const attribs = node.attribs || {}

   // Replace links with Next links
   if (node.name === `a` && isUrlInternal(attribs.href)) {
      let { href, style, ...props } = attribs
      href = `${href}`
      if (props.class) {
         props.className = props.class
         delete props.class
      }
      if (!style) {
         return (
            <Link href={href}>
               <a {...props}>
                  {!!node.children &&
                     !!node.children.length &&
                     domToReact(node.children, parseOptions)}
               </a>
            </Link>
         )
      }

      let styleObj = {}
      if (style) {
         const [property, value] = style.split(":")
         styleObj[property.trim()] = value.trim()
      }
      return (
         <Link href={href}>
            <a {...props} href={href} style={styleObj}>
               {!!node.children &&
                  !!node.children.length &&
                  domToReact(node.children, parseOptions)}
            </a>
         </Link>
      )
   }

   // Make Google Fonts scripts work
   if (node.name === `script`) {
      let content = get(node, `children.0.data`, ``)
      if (content && content.trim().indexOf(`WebFont.load(`) === 0) {
         content = `setTimeout(function(){${content}}, 1)`
         return (
            <script
               {...attribs}
               dangerouslySetInnerHTML={{ __html: content }}
            ></script>
         )
      }
   }

   return false
}

const parseOptions: HTMLReactParserOptions = { replace }

interface WebflowProps {
   headContent: string
   bodyContent: string
}

const WebflowPage: NextPage<WebflowProps> = (props) => {
   return (
      <>
         <Head>{parseHtml(props.headContent, parseOptions)}</Head>
         {parseHtml(props.bodyContent, parseOptions)}
      </>
   )
}

export default WebflowPage

const getStaticProps: GetStaticProps = async (ctx) => {
   // Import modules in here that aren't needed in the component
   const cheerio = await import(`cheerio`)
   const axios = (await import(`axios`)).default

   // Use path to determine Webflow path
   let url = get(ctx, `params.path`, [])
   url = Array.isArray(url) ? url.join(`/`) : url
   if (url.charAt(0) !== `/`) {
      url = `/${url}`
   }

   const fetchUrl = process.env.WEBFLOW_URL + url

   // Fetch HTML
   const res = await axios(fetchUrl).catch((err) => {
      console.error(err)
   })

   if (!res) {
      throw new Error("Failed to fetch data")
   }

   const html = res.data

   // Parse HTML with Cheerio
   const $ = cheerio.load(html)

   // Convert back to HTML strings
   const bodyContent = $(`body`).html()
   const headContent = $(`head`).html()

   // Send HTML to component via props
   return {
      revalidate: 60, // Re-build the webflow pages every 60 seconds, any new pages will be added to the build automatically
      props: {
         bodyContent,
         headContent,
      },
   }
}

export { getStaticProps }
