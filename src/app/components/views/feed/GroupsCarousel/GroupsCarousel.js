import React, {useEffect, useRef} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import GroupCarouselCard from "./GroupCarouselCard";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import Slider from "react-slick";
import {Button, IconButton} from "@material-ui/core";


const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        "& .slick-track": {
            marginLeft: 0
        },
        "& .slick-next:before, .slick-prev:before": {
            content: "'' !important"
        }
    },
    button: {
        height: 90,
        borderRadius: 20,
        marginTop: 3,
    },
}));

function NextArrow({className, style, onClick}) {
    return (
        <div
            className={className}
            style={{
                ...style,
                display: 'block',
                position: "absolute",
                zIndex: 20,
                right: 20,
                top: 34
            }}
            onClick={onClick}
        >
            <IconButton>
                <NavigateNextIcon color="primary" fontSize="large"/>
            </IconButton>
        </div>
    );
}
function PrevArrow({className, style, onClick}) {
    return (
        <div
            className={className}
            style={{
                ...style,
                display: 'block',
                position: "absolute",
                zIndex: 20,
                left: 0,
                top: 34
            }}
            onClick={onClick}
        >
            <IconButton>
                <NavigateBeforeIcon color="primary" fontSize="large"/>
            </IconButton>
        </div>
    );
}

// function PrevArrow(props) {
//     const {className, style, onClick} = props;
//     return (
//         <div
//             className={className}
//             style={{...style, display: "block", background: "red", position: "absolute", left: 0, zIndex: 10}}
//             onClick={onClick}
//         />
//     );
// }

const GroupsCarousel = ({groupIds, handleSetGroup, mobile, groupData}) => {

    const classes = useStyles()


    const renderGroupCards = groupIds.map(id => {
        return <GroupCarouselCard groupData={groupData} key={id} handleSetGroup={handleSetGroup} groupId={id}/>
    })
    const handleHowMany = (defaultNum) => {
        let num = defaultNum
        if (renderGroupCards.length < defaultNum) {
            num = renderGroupCards.length + 1
        }
        return num
    }
    const settings = {
        centerMode: true,
        centerPadding: "60px",
        infinite: true,
        slidesToScroll: 2,
        slidesToShow: mobile ? 2 : handleHowMany(4),
        speed: 500,
        nextArrow: <NextArrow/>,
        prevArrow: <PrevArrow/>
    };


    const onlyOne = renderGroupCards.length < 2
    console.log("onlyOne", onlyOne);

    return (
        <div>
            <Slider className={classes.root} {...settings}>
                {renderGroupCards}
                <Button className={classes.button} color="primary">
                    Follow more
                </Button>
            </Slider>
        </div>
    )

};

export default GroupsCarousel;
