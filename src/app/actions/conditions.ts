import { defineChain, getContract } from "thirdweb";
import { client } from "../client";
import { balanceOf } from "thirdweb/extensions/erc1155";
import { baseSepolia } from "thirdweb/chains";

export async function hasAccess(
    address: string,
): Promise<boolean> {
    const quantityRequired = 1n;

    const contract = getContract({
        client: client,
        chain: defineChain(baseSepolia),
        address: "0xf522A9AB4CD863684cF4c9Bd3141EcEA57156004"
    });

    const ownedBalance = await balanceOf({
        contract: contract,
        owner: address,
        tokenId: 0n
    });
    
    return ownedBalance >= quantityRequired;
}