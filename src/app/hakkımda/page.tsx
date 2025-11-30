"use client";
import React from "react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Input } from "@/components/ui/input";

function BackgroundBeamsDemo() {
  return (
    <div className="h-[40rem] w-full rounded-md bg-background relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="relative z-10 text-lg md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground text-center font-sans font-bold">
          B2 Sports Academy
        </h1>

        <p className="text-muted-foreground max-w-lg mx-auto my-2 text-sm text-center relative z-10">
          2024 yılından bu yana faaliyet gösteren B2 Sports Academy, MMA, Kickboks, Capoeira,
          Personal Training ve Functional Fitness alanlarında profesyonel eğitim sunan bir
          akademidir. Amacımız, her bireyin potansiyelini keşfetmesine, disiplin ve özgüven
          kazanmasına katkı sağlamaktır.
        </p>

        <Input
          type="email"
          placeholder="İletişim için e-posta adresinizi girin"
          className="w-full mt-4 relative z-10"
        />
      </div>
      <BackgroundBeams />
    </div>
  );
}

export default function HakkımdaPage() {
  return (
    <div className="min-h-screen bg-black">
      <BackgroundBeamsDemo />
    </div>
  );
}
