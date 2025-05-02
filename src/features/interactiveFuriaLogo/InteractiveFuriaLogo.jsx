import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import Container from "../../components/container/Container";
import Image from "../../components/image/Image";

import XLogo from '../../assets/x-logo.svg';
import InstagramLogo from '../../assets/instagram-logo.svg';
import TikTokLogo from '../../assets/tiktok-logo.svg';
import FuriaLogo from '../../assets/Furia_Esports_logo.png';
import FuriaLogoText from '../../assets/furia_logo_text.png';

const FURIA_TWITTER_URL = 'https://twitter.com/FURIA';
const FURIA_INSTAGRAM_URL = 'https://www.instagram.com/furiagg/';
const FURIA_TIKTOK_URL = 'https://www.tiktok.com/@furia';

const logoVariants = {
    hidden: { opacity: 0, x: 0, y: -100, scale: 0.3 },
    visible: (custom) => ({
        opacity: 1,
        x: custom.x,
        y: custom.y,
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }),
    exit: { opacity: 0, scale: 0.3, transition: { duration: 0.2 } }
};

const socialLinksData = [
    { id: 'twitter', href: FURIA_TWITTER_URL, src: XLogo, alt: "Furia no Twitter", customProp: 'link1Custom' },
    { id: 'instagram', href: FURIA_INSTAGRAM_URL, src: InstagramLogo, alt: "Furia no Instagram", customProp: 'link2Custom' },
    { id: 'tiktok', href: FURIA_TIKTOK_URL, src: TikTokLogo, alt: "Furia no TikTok", customProp: 'link3Custom' },
];

const motionLinkBaseStyle = {
    position: 'absolute',
    zIndex: "999",
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
};

export const InteractiveFuriaLogo = ({ screen }) => {
    const [showExtraLogos, setShowExtraLogos] = useState(false);

    const handleClick = () => {
        setShowExtraLogos(prev => !prev);
    };

    const isProfileScreen = screen === "profile";
    const containerSize = isProfileScreen ? "150px" : "350px";
    const mobileHeight = isProfileScreen ? "150px" : "230px";
    const smallLogoSize = isProfileScreen ? "55px" : "100px";

    const positions = {
        link1Custom: isProfileScreen ? { x: 70, y: 90 } : { x: 140, y: 200 },
        link2Custom: isProfileScreen ? { x: 0, y: 110 } : { x: -140, y: 200 },
        link3Custom: isProfileScreen ? { x: -70, y: 90 } : { x: 0, y: 230 },
        textLogoCustom: isProfileScreen ? { x: 0, y: 110 } : { x: 0, y: 230 }
    };
    const textLogoWidth = isProfileScreen ? "120px" : "180px";
    const textLogoHeight = "80px";

    return (
        <Container
            $flex
            $justifyContent="center"
            $alignItems="center"
            $border="2px solid var(--secondary-color)"
            $radius="100%"
            $tabletMargin="2rem 0 6rem 0"
            $width={containerSize}
            $height={containerSize}
            $mobileWidth={containerSize}
            $mobileHeight={mobileHeight}
            $position="relative"
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
            title="Clique para ver redes sociais"
        >
            <Image
                src={FuriaLogo}
                alt="Furia Logo Principal"
                width="100%"
                height="100%"
                objectFit="contain"
                position="absolute"
                bottom="0"
                left="0"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                zIndex={3}
            />

            <AnimatePresence>
                {showExtraLogos && socialLinksData.map((link) => (
                    <motion.a
                        key={link.id}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        custom={positions[link.customProp]}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={logoVariants}
                        style={{
                            ...motionLinkBaseStyle,
                            width: smallLogoSize,
                            height: smallLogoSize,
                            zIndex: 1,
                        }}
                        title={`Visitar ${link.alt}`}
                    >
                        <Image
                            src={link.src}
                            alt={link.alt}
                            width="100%"
                            height="100%"
                            objectFit="contain"
                            filter="var(--logo-text-filter)"
                            whileHover={{ scale: 1.08 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        />
                    </motion.a>
                ))}
            </AnimatePresence>

            <AnimatePresence>
                {!showExtraLogos && (
                    <Image
                        key="furia-text-logo"
                        src={FuriaLogoText}
                        alt="Furia Logo Texto"
                        custom={positions.textLogoCustom}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={logoVariants}
                        width={textLogoWidth}
                        height={textLogoHeight}
                        objectFit="contain"
                        position="absolute"
                        zIndex={1}
                        filter="var(--logo-text-filter)"
                        style={{ pointerEvents: 'none' }}
                    />
                )}
            </AnimatePresence>
        </Container>
    );
}

export default InteractiveFuriaLogo;