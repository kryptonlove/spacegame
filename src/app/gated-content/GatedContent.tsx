'use client';

import { useEffect, useRef, useState } from "react";
import { LoginButton } from "../components/LoginButton";
import { initPhaserGame } from "../game/phaser-game";

export const GatedContent = () => {
    const gameRef = useRef<HTMLDivElement>(null);
    const [gameLoaded, setGameLoaded] = useState(false);

    useEffect(() => {
        if (gameRef.current) {
            const gameInstance = initPhaserGame(gameRef.current);
            setGameLoaded(true);
            return () => {
                gameInstance?.destroy(true);
                setGameLoaded(false);
            };
        }
    }, []);

    return (
        <div className="relative min-h-[100vh] flex flex-col items-center justify-center bg-gray-800"
        style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle,rgb(255, 169, 0),rgb(0, 0, 0))",
        }}
        >
            <div className="p-4 pb-10 min-h-[100vh] flex flex-col items-center justify-center container max-w-[430px] mx-auto"> {/* Фиксируем ширину */}
            <LoginButton />
            {!gameLoaded && <p className="mt-4 text-lg font-semibold">Loading game...</p>}
            <div ref={gameRef} className="absolute top-0 left-0 w-full h-full"></div>
            </div>

        </div>
        

    );
};
