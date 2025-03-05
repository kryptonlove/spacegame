import { createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { client } from "../client"

const privateKey = process.env.THIRDWEB_PRIVATE_KEY || "";

if(!privateKey){
    throw new Error("THIRDWEB_PRIVATE_KEY is required");
}

export const thirdwebAuth = createAuth({
    domain: process.env.NEXT_PUBLIC_THIRDWEB_DOMAIN || "",
    adminAccount: privateKeyToAccount({
        client: client,
        privateKey: privateKey,
    }),
})