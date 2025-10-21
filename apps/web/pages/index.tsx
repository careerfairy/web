import MenuBurger from "components/webflow/MenuBurger"
import parseHtml, {
   domToReact,
   Element,
   HTMLReactParserOptions,
} from "html-react-parser"
import get from "lodash/get"
import { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { ReactElement } from "react"

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

   // Replace nav element with MenuBurger component if the id includes "burger-menu"
   if (node.name === "nav" && attribs.id?.includes("burger-menu")) {
      return <MenuBurger id={attribs.id} />
   }

   // Replace links with Next links
   if (node.name === `a` && isUrlInternal(attribs.href)) {
      let { href } = attribs
      const { style, ...props } = attribs
      href = `${href}`
      if (props.class) {
         props.className = props.class
         delete props.class
      }
      if (!style) {
         return (
            <Link href={href} {...props}>
               {!!node.children &&
                  !!node.children.length &&
                  domToReact(node.children, parseOptions)}
            </Link>
         )
      }

      const styleObj = {}
      if (style) {
         const [property, value] = style.split(":")
         styleObj[property.trim()] = value.trim()
      }
      return (
         <Link href={href} {...props} style={styleObj}>
            {!!node.children &&
               !!node.children.length &&
               domToReact(node.children, parseOptions)}
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
         <div
            style={{
               position: "fixed",
               top: 0,
               left: 0,
               right: 0,
               zIndex: 9999,
               background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
               color: "white",
               padding: "12px 20px",
               textAlign: "center",
               fontWeight: "bold",
               fontSize: "16px",
               boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
         >
            🚀 Live Development Environment - Real-time Testing Active! 🚀
         </div>
         <div style={{ marginTop: "48px" }}>
            {parseHtml(props.bodyContent, parseOptions)}
         </div>
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
      console.error(`Failed to fetch data`)
      return {
         notFound: true,
      }
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
