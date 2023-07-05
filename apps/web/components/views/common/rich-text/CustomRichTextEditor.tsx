import React, { forwardRef, useMemo } from "react"
import ReactQuill, { ReactQuillProps } from "react-quill"
import { useField } from "formik"
import "react-quill/dist/quill.snow.css" // import the styles
import { useMountedState } from "react-use"

type Props = {} & ReactQuillProps

const CustomRichTextEditor = forwardRef<ReactQuill, Props>((props, ref) => {
   const isMounted = useMountedState()

   function imageHandler() {
      const input = document.createElement("input")
      input.setAttribute("type", "file")
      input.setAttribute("accept", "image/*")
      input.click()
      input.onchange = async () => {
         if (!input.files) return
         const cursorPosition =
            this.quill.selection.cursor.selection.lastRange.index
         // upload your file here
         const link =
            "https://i.imgur.com/m8wOp65_d.webp?maxwidth=300&shape=thumb&fidelity=high"
         this.quill.editor.insertEmbed(cursorPosition, "image", link)
      }
   }

   const modules = useMemo(
      () => ({
         toolbar: {
            container: TOOLBAR_OPTIONS,
            handlers: {
               image: imageHandler,
            },
         },
      }),
      []
   )
   return isMounted() ? (
      <ReactQuill {...props} theme="snow" modules={modules} ref={ref} />
   ) : null
})

CustomRichTextEditor.displayName = "CustomRichTextEditor"

// set some default props because we don't want all the features enabled
const modules: ReactQuillProps["modules"] = {}

const TOOLBAR_OPTIONS = [
   [{ header: [1, 2, false] }],
   ["bold", "italic", "underline", "strike", "blockquote"],
   [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
   ],
   ["link", ["clean"]],
]

export default CustomRichTextEditor
