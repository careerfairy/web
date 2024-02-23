import ReactQuill, {ReactQuillProps} from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import 'react-quill/dist/quill.snow.css';
import {forwardRef} from "react";

export type CustomRichTextEditorProps = ReactQuillProps & {
    name: string;
    disabled?: boolean;
    onChange: (event: { target: { name: string; value: string } }) => void;
    onBlur: (event: { target: { name: string} }) => void;
}

// eslint-disable-next-line react/display-name
const CustomRichTextEditor = forwardRef<ReactQuill, CustomRichTextEditorProps>((props, ref) => {
  const {name, disabled, onChange, onBlur } = props
  
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
        });
      }}
      onBlur={() => { 
        onBlur({
          target: {
            name: name,
          },
        });
      }}
      modules={modules}
      readOnly={disabled}
    >
      {props.children}
    </ReactQuill>
  )
});



// set some default props because we don't want all the features enabled
const modules = {
  toolbar: [
    [{'header': [1, 2, false]}],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['clean']
  ],
}

export default CustomRichTextEditor