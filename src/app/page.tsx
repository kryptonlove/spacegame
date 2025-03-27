'use client';

import Image from "next/image";
import { useActiveAccount } from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { LoginButton } from "./components/LoginButton";
import Link from "next/link";

// export const metadata = {
//   title: 'Space Flush',
//   description: 'Game by Mr. Diggle & his frens',
// };

export default function Home() {
  const account = useActiveAccount();

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />

        <div className="flex justify-center mb-20">
          <LoginButton />
        </div>
        
        {account && (
          <div className="text-center">
            <p>You are looged in</p>
            <Link href="/gated-content">
            <button className="mt-4 bg-zinc-100 text-black px-4 py-2 rounded-md">
              Go to gated content
            </button>
            </Link>
          </div> 
        )}
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <Image
        src={thirdwebIcon}
        alt=""
        className="size-[150px] md:size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />
      <h1 className="text-2xl md:text-6m font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        Space Flush
      </h1>
      <p className="text-center">Connect your wallet to claim Shmiggle Pass on Base and unlock the first minigame by Mr. Diggle and his frens. Some on-chain actions may apply.</p>
    </header>
  );
}