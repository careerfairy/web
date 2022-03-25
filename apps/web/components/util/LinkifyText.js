import React from "react"
import Linkify from "react-linkify"

const componentDecorator = (href, text, key) => (
   <a href={href} key={key} target="_blank">
      {text}
   </a>
)

const LinkifyText = ({ children }) => {
   return <Linkify componentDecorator={componentDecorator}>{children}</Linkify>
}

export default LinkifyText
