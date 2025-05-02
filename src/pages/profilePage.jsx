// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useLocation } from 'react-router-dom';
import React from 'react';
import UserProfileDisplay from "../features/userProfileDisplay/userProfileDisplay"
import Section from "../components/section/section";
import Main from "../components/main/Main";
import Image from "../components/image/Image";
import FuriaLogo from "../assets/Furia_Esports_logo.png";
import FuriaLogoText from "../assets/furia_logo_text.png";
import PageWrapper from "../components/layout/pagewrapper";
import PageHeader from "../components/layout/pageHeader";

export const ProfilePage = () => {
    const location = useLocation();

    const passedProfile = location.state?.userProfile;

    console.log("ProfilePage received state:", location.state);
    return (

        <PageWrapper
            $mainPadding="50px"
            $mainMobilePadding="1rem 1rem 1rem 1rem"
            $mainBackgroundImage={`url(${FuriaLogo})`}
            $mainBackgroundSize="50px"
            $mainBackgroundPosition="center"
            $mainBackgroundRepeat="repeat"
            $mainBgColor="var(--primary-color)"
            $mainHeight="fit-content"
            $mainMinHeight="100vh"

            $sectionPadding="2rem 2rem 2rem 2rem"
            $sectionMobilePadding="1rem 1rem 1rem 1rem"
            $sectionBorder="2px solid var(--secondary-color)"
            $sectionRadius="20px"
            $sectionBoxShadow="5px 5px 0 var(--secondary-color)"
            $sectionBgColor="var(--shadow-color)"
            $sectionBackdropFilter="blur(5px)"
            $sectionBackgroundImage="radial-gradient(var(--secondary-color) 1px, transparent 0)"
            $sectionBackgroundSize="40px 40px"
            $sectionBackgroundPosition="-30px -30px"
            $sectionBackgroundRepeat="repeat"
            $sectionPosition="relative"
            style={{ overflow: 'hidden' }}
        >
            <PageHeader />

            <Section
                $margin="20px 0 0 0"
                $flex
                $height="80%"
                $justifyContent="space-between"
                $gap="1rem"
            >
                <motion.div
                    layout
                    style={{
                        display: 'flex',
                        width: '100%',
                        transition: { duration: 0.5, ease: "easeInOut" }
                    }}
                >
                    <UserProfileDisplay userProfile={passedProfile} />
                </motion.div>
            </Section>
        </PageWrapper >
    )
}