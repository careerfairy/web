import { forwardRef, useMemo } from "react"
import ReactQuill, { Quill, ReactQuillProps } from "react-quill"
import "react-quill/dist/quill.bubble.css"
import "react-quill/dist/quill.snow.css"

export type CustomRichTextEditorProps = ReactQuillProps & {
   name: string
   disabled?: boolean
   onChange: (event: { target: { name: string; value: string } }) => void
   onBlur: (event: { target: { name: string } }) => void
   enableImages?: boolean
}
const Delta = Quill.import("delta")

// eslint-disable-next-line react/display-name
const CustomRichTextEditor = forwardRef<ReactQuill, CustomRichTextEditorProps>(
   (props, ref) => {
      const { name, disabled, onChange, onBlur, enableImages = false } = props

      const modules = useMemo(() => getModules(enableImages), [enableImages])
      return (
         <ReactQuill
            {...props}
            theme="snow"
            ref={ref}
            onChange={(value) => {
               onChange({
                  target: {
                     name: name,
                     value: value,
                  },
               })
            }}
            onBlur={() => {
               onBlur({
                  target: {
                     name: name,
                  },
               })
            }}
            modules={modules}
            readOnly={disabled}
         >
            {props.children}
         </ReactQuill>
      )
   }
)

const getModules = (enableImages: boolean) => {
   // set some default props because we don't want all the features enabled
   const modules = {
      toolbar: [
         [{ header: [1, 2, false] }],
         ["bold", "italic", "underline", "strike", "blockquote"],
         [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
         ],
         ["clean"],
      ],
      clipboard: {
         matchVisual: false, // Disable Quill's default clipboard pasting style matching
         matchers: [
            ...(!enableImages ? ([["img", () => new Delta()]] as any) : []),
            [
               Node.ELEMENT_NODE,
               function (node, delta) {
                  return delta.compose(
                     new Delta().retain(delta.length(), {
                        color: false,
                        background: false,
                     })
                  )
               },
            ],
         ],
      },
   }

   return modules
}

export default CustomRichTextEditor
