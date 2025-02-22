import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";

import image1 from "../../../public/image1.png";
import image2 from "../../../public/image2.png";
import bags from "../../../public/bags.png";
import plane from "../../../public/plane.png";
import house from "../../../public/house.png";

import { Card, CardDescription, CardTitle } from "../ui/card";
import { WorldMapDemo } from "../Worldmapdemo";
import { SparklesText } from "../magicui/sparkles-text";

export const HeroSectionDemo = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-teal-100 to-white px-5 md:px-10">
        {/* Navbar */}
        <div className="flex justify-between items-center py-4">
          <h1 className="text-teal-500 text-2xl md:text-3xl font-poppins font-bold">
            TravelSafe!
          </h1>
          <Button variant="default">
            <Link href="/auth/signup">
              <span className=" text-white">
                Signup
              </span>
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center mt-8 md:mt-12">
          <div className="text-center md:text-left md:w-1/2 text-3xl md:text-5xl font-bold">
            <SparklesText
              className="font-semibold"
              text="Explore The Beautiful World..! Safely..."
            />
          </div>
          <div className="md:w-1/2 mt-6 md:mt-0 flex justify-center">
            <Image
              src={image1}
              className="w-full max-w-sm md:max-w-md"
              alt="image"
            />
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="flex flex-col md:flex-row items-center mt-10">
          <div className="flex justify-center md:justify-start md:w-1/2">
            <Image
              src={image2}
              className="w-full max-w-sm md:max-w-md"
              alt="image2"
            />
          </div>
          <div className="md:w-1/2 mt-6 md:mt-0 text-center md:text-left">
            <span className="text-2xl font-semibold">Why Choose Us</span>
            <p className="mt-2 text-sm md:text-base">
              Enjoy different experiences in every place you visit and discover
              new and affordable adventures.
            </p>

            <div className="mt-4 space-y-4">
              {[
                { img: plane, title: "Location Bases Support" },
                { img: house, title: "Live Alerts and Report Based Awards" },
                { img: bags, title: "Local Feed" },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="p-4 bg-white border border-neutral-100 shadow-lg flex items-center space-x-4 cursor-pointer"
                >
                  <Image
                    src={item.img}
                    alt={item.title}
                    className="w-10 h-10"
                  />
                  <div>
                    <CardTitle className="text-sm">{item.title}</CardTitle>
                    <CardDescription className="text-neutral-500">
                      Vitae donec pellentesque a aliquam et ultricies auctor.
                    </CardDescription>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* World Map Section */}
      <div className="mt-10">
        <WorldMapDemo />
      </div>
    </>
  );
};

export default HeroSectionDemo;
