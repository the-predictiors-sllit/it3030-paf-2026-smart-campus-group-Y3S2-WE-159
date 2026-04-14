"use client";
import { motion } from "motion/react";
import React from "react";
import { ImagesSlider } from "../ui/images-slider";

export const HomeImageSlider = () => {
    const images = [
        "/classroom1.jpg",
        "https://images.pexels.com/photos/36244514/pexels-photo-36244514.jpeg",
        "https://images.pexels.com/photos/5515483/pexels-photo-5515483.jpeg", 
        "https://images.pexels.com/photos/3747481/pexels-photo-3747481.jpeg", 
        "https://images.pexels.com/photos/36279882/pexels-photo-36279882.jpeg", 
    ];
    return (
        <ImagesSlider className="h-[40rem] rounded-lg" images={images}>
            <motion.div
                initial={{
                    opacity: 0,
                    y: -80,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.6,
                }}
                className="z-50 flex flex-col justify-center items-center"
            >
                <motion.p className="font-bold text-xl md:text-6xl text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-4">
                    Access every resource in  <br /> one click.
                </motion.p>
                <button className="px-4 py-2 backdrop-blur-sm border bg-emerald-300/10 border-emerald-500/20 text-white mx-auto text-center rounded-full relative mt-4">
                    <span>Book resource Now</span>
                    <div className="absolute inset-x-0  h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-emerald-500 to-transparent" />
                </button>
            </motion.div>
        </ImagesSlider>
    );
}
