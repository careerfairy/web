import React, { forwardRef } from "react"
import PropTypes from "prop-types"
import Head from "next/head"

const Page = forwardRef(({ children, title = "", ...rest }, ref) => {
   return (
      <>
         <Head>
            <title>{title}</title>
         </Head>
         {children}
      </>
   )
})

Page.displayName = "Page"

Page.propTypes = {
   children: PropTypes.node.isRequired,
   title: PropTypes.string.isRequired,
}

export default Page
