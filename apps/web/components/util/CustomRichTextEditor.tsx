import ReactQuill, {ReactQuillProps} from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import 'react-quill/dist/quill.snow.css';
import {forwardRef} from "react"; // import the styles

export type CustomRichTextEditorProps = ReactQuillProps & {
    setFieldValue: (field: string, name: string) => void;
    name: string;
    disabled?: boolean;
    minRows?: number;
    rows?: number;
    placeholder?: string;
}

// eslint-disable-next-line react/display-name
const CustomRichTextEditor = forwardRef<ReactQuill, CustomRichTextEditorProps>((props, ref) => {
        const { setFieldValue, name, disabled, placeholder } = props
        
        return (
            <ReactQuill
                {...props}
                theme="snow"
                ref={ref}
                onChange={(values) => setFieldValue(name, values)}
                modules={modules}
                readOnly={disabled}
                placeholder={placeholder}
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