import React, {createRef, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import Slider from "react-slick";
import NextLivestreamsCard from "./NextLivestreamsCard";


const useStyles = makeStyles((theme) => ({
    root: {
        zIndex: 1000,
        position: "sticky",
        top: 0
    },
    slider: {
        boxShadow: "0 0 5px grey",
        width: "100%",
        "& .slick-next:before, .slick-prev:before": {
            content: "'' !important",
            display: "none"
        },
        background: "rgb(44, 66, 81)",

    },
    button: {
        height: 90,
        borderRadius: 20,
        marginTop: "auto",
    },
    next: {
        display: 'block',
        position: "absolute",
        zIndex: 20,
        right: 0,
        WebkitTransform: "translate(-50%,-50%)",
        transform: "translate(-50%,-50%)",
        top: "50%",
    },
    prev: {
        display: 'block',
        position: "absolute",
        zIndex: 20,
        left: 57,
        WebkitTransform: "translate(-50%,-50%)",
        transform: "translate(-50%,-50%)",
        top: "50%",
    },
    icon: {
        color: "black",
        backgroundColor: "white",
        borderRadius: "50%",
        opacity: 0.5
    }
}));

const SingleCarousel = ({handleSetGroup, mobile, groupData, handleResetGroup, user}) => {
    const classes = useStyles()
    const customSlider = createRef()

    const [activeSlide, setActiveSlide] = useState(0)

    const singleSettings = {
        initialSlide: 0,
        centerMode: true,
        centerPadding: "60px",
        focusOnSelect: true,
        swipeToSlide: true,
        infinite: true,
        arrows: false,
        slidesToScroll: 1,
        slidesToShow: 1,
        speed: 500,
        beforeChange: (current, next) => setActiveSlide(next),
    }

    return (
        <div className={classes.root}>
            <Slider ref={customSlider} className={classes.slider} {...singleSettings}>
                <NextLivestreamsCard mobile={mobile} handleSetGroup={handleSetGroup} groupData={groupData}
                                     position={true}
                                     handleResetGroup={handleResetGroup} activeSlide={activeSlide}/>
            </Slider>
        </div>
    )
};

export default SingleCarousel;
