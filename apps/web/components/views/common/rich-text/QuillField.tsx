import { useField } from "formik"
import React from "react"
import CustomRichTextEditor from "./CustomRichTextEditor"

type Props = {
   name: string
}

const QuillField: React.FC<Props> = ({ name }) => {
   const [field, meta, helpers] = useField(name)

   return (
      <>
         <CustomRichTextEditor
            value={field.value}
            onChange={(value) => helpers.setValue(value)}
            onBlur={() => helpers.setTouched(true)}
         />
         {meta.touched && meta.error ? (
            <div className="error">{meta.error}</div>
         ) : null}
      </>
   )
}

export default QuillField
