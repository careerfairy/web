import ScrollToBottom, {useScrollToBottom, useSticky} from "react-scroll-to-bottom";
import React, {useEffect} from "react";

const ScrollElements = ({scrollItems}) => {
    const scrollToBottom = useScrollToBottom();
    const [sticky] = useSticky();
    useEffect(() => {
        if(sticky){
            scrollToBottom()
        }
    }, [scrollItems])

    return (
        <React.Fragment>
            {scrollItems}
        </React.Fragment>
    )

}

const CustomScrollToBottom = ({scrollItems, ...props}) => {
    return (
        <ScrollToBottom {...props}>
            <ScrollElements scrollItems={scrollItems}/>
        </ScrollToBottom>
    )
};

export default CustomScrollToBottom