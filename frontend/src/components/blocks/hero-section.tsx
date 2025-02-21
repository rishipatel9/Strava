import React from "react";
import Image from "next/image";
import logo from "../../../public/logo.png";
import l1 from "../../../public/places/l1.png";
import l2 from "../../../public/places/l2.png";
import l3 from "../../../public/places/l3.png";
import places from "../../../public/places.png";
import text from "../../../public/text.png";
import { Button } from "../ui/button";
import Link from "next/link";

export const HeroSectionDemo = () => {
  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-8 lg:px-20 xl:px-40 font-sans text-gray-900">
      {/* Logo */}
      <div className="w-full flex justify-start py-4">
        <Image src={logo} alt="logo" className="w-32 lg:w-40" />
      </div>

      {/* Places Image */}
      <div className="mt-16 w-full flex justify-center">
        <Image src={places} alt="places" className="w-3/4 max-w-xl" />
      </div>

      {/* Text Image */}
      <div className="mt-4 w-full flex justify-center">
        <Image src={text} alt="text" className="w-2/3 max-w-lg" />
      </div>

      {/* Heading */}
      <div className="mt-4 text-center px-4 lg:px-20">
        <h1 className="text-xl lg:text-2xl font-semibold leading-snug">
          Worried about Your Safety During your Travel? We’ve got you covered.
        </h1>
      </div>

      {/* Button */}
      <div className="mt-6 w-full flex justify-center">
        <Button className="bg-blue-600 text-white px-6 py-3 rounded-3xl text-lg font-medium shadow-md transition hover:bg-blue-700 w-48">
          <Link href="/auth/signup">
            <span>Login</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};