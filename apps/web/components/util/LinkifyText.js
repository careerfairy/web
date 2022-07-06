import React from "react"
import Linkify from "react-linkify"

const componentDecorator = (href, text, key) => (
   <a
      href={href}
      key={key}
      target="_blank"
      style={{ wordBreak: "break-word" }}
      rel="noreferrer"
   >
      {text}
   </a>
)

const LinkifyText = ({ children }) => {
   return <Linkify componentDecorator={componentDecorator}>{children}</Linkify>
}

export default LinkifyText
