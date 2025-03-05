'use server';

import { VerifyLoginPayloadParams } from "thirdweb/auth";
import { thirdwebAuth } from "../utils/thirdwebAuth";
import { cookies } from "next/headers";

export const generatePayload = thirdwebAuth.generatePayload;

export async function login(
    payload: VerifyLoginPayloadParams
) {
    const verifiedPayload = await thirdwebAuth.verifyPayload(payload);

    if(verifiedPayload.valid){
        const jwt = await thirdwebAuth.generateJWT({
            payload: verifiedPayload.payload,
        });
        cookies().set('jwt',jwt);
    }
}

export async function isLoggedIn() {
    const jwt = cookies().get('jwt');
    if(!jwt?.value){
        return false;
    }

    const authResult = await thirdwebAuth.verifyJWT({
        jwt: jwt.value,
    });

    if(!authResult.valid){
        return false;
    }

    return true;
}

export async function logout() {
    cookies().delete('jwt');
}