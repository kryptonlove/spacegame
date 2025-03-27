import { cookies } from "next/headers";
import { thirdwebAuth } from "../utils/thirdwebAuth";
import { hasAccess } from "../actions/conditions";
import Link from "next/link";
import { GatedContent } from "./GatedContent";

export default async function GatedPage() {
    const jwt = cookies().get('jwt');

    if(!jwt?.value){
        return <MustLogin />
    }

    const authResult = await thirdwebAuth.verifyJWT({
        jwt: jwt.value,

    });

    if(!authResult.valid){
        return <MustLogin />
    }

    const address = authResult.parsedJWT.sub;

    if(!address) {
        throw new Error("No address found");
    }

    const _hasAccess = await hasAccess(address);

    if(!_hasAccess) {
        return <NotAllowed/>
    }

    return <GatedContent />

}

const MustLogin = () => {
    return (
        <div className="flex flex-col min-h-[100vh] items-center justify-center p-4 text-center">
            <p>You are not logged in.</p>
            <Link href="/">
            <button className="mt-4 bg-zinc-100 text-black px-4 py-2 rounded-md">Go to login</button>
            </Link>
        </div>
    )
};

const NotAllowed = () => {
    return (
        <div className="flex flex-col min-h-[100vh] items-center justify-center p-4 text-center">
            <p>You do not own SHMIGGLE PASS NFT</p>
            <Link href="/">
            <button className="mt-4 bg-zinc-100 text-black px-4 py-2 rounded-md">Go to login</button>
            </Link>
            <Link href="/claim-nft">
            <button className="mt-4 bg-zinc-100 text-black px-4 py-2 rounded-md">Claim PASS</button>
            </Link>

        </div>
    )
}