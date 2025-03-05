'use client';

import { TransactionButton, useActiveAccount } from "thirdweb/react"
import { LoginButton } from "../components/LoginButton"
import { claimTo } from "thirdweb/extensions/erc1155"
import { defineChain, getContract } from "thirdweb"
import { baseSepolia } from "thirdweb/chains"
import { client } from "../client"
import Link from "next/link"

export default function NftClaim() {
    const account = useActiveAccount();

    return (
     <div>
        <div className="p-4 pb-10 min-h-[100vh] flex flex-col items-center justify-center container max-w-screen-lg mx-auto">
            <p className="text-2xl">Claim NFT</p>
            <p className="mt-4">You can claim the access NFT here</p>
            <div className="my-6">
                <LoginButton />
            </div>
            <TransactionButton
            transaction={() => claimTo({
                contract: getContract({
                    client: client,
                    chain: defineChain(baseSepolia),
                    address: "0xf522A9AB4CD863684cF4c9Bd3141EcEA57156004"
                }),
                to: account?.address || "",
                quantity: 1n,
                tokenId: 0n,
            })}
            onTransactionConfirmed={async () => {
                alert("NFT claimed");
            }}
            >Claim NFT</TransactionButton>
            <Link href={"/gated-content"}>
            <button className="mt-4 bg-zinc-100 text-black px-4 py-2 rounded-md">
                Got to gated page
            </button>
            </Link>
        </div>
     </div>   
    )
}