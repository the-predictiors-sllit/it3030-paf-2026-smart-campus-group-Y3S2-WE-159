"use client";
import { motion } from "motion/react";
import { ImagesSlider } from "../ui/images-slider";
import classroom1 from "@/assets/classroom1.jpg";
import proj1 from "@/assets/proj1.jpeg";
import lib1 from "@/assets/lib1.jpeg";
import lab1 from "@/assets/lab1.jpg";

export const HomeImageSlider = () => {
    const images = [
        classroom1.src,
        proj1.src,  
        lib1.src, 
        lab1.src, 
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
                <button className="px-4 py-2 backdrop-blur-sm border bg-primary/10 border-primary/20 text-white mx-auto text-center rounded-full relative mt-4">
                    <span>Book resource Now</span>
                    <div className="absolute inset-x-0  h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-primary to-transparent" />
                </button>
            </motion.div>
        </ImagesSlider>
    );
}
