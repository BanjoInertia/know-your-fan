// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Image from "../components/image/Image";
import Main from "../components/main/Main";
import Section from "../components/section/section";
import InteractiveFuriaLogo from "../features/interactiveFuriaLogo/InteractiveFuriaLogo";
import FuriaLogo from "../assets/Furia_Esports_logo.png";
import FuriaLogoText from "../assets/furia_logo_text.png";
import UserInfoGetter from "../features/userInfoGetter/userInfoGetter";
import PageWrapper from "../components/layout/pagewrapper";
import PageHeader from "../components/layout/pageHeader";

const breakpoints = {
    tablet2: '1200px',
};

export const MainPage = () => {

    const logoVariants = {
        initial: {
            position: 'static',
            width: '100%',
            height: '100%',
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeInOut" }
        },

    };

    const infoGetterVariants = {
        initial: {
            width: breakpoints.tablet2 ? '100%' : '50%',
            opacity: 1,
            flexGrow: 1,
            transition: { duration: 0.5, ease: "easeInOut" }
        },
    };


    return (
        <PageWrapper
            $mainPadding="50px"
            $mainMobilePadding="4rem 1rem 1rem 1rem"
            $mainBackgroundImage={`url(${FuriaLogo})`}
            $mainBackgroundSize="50px"
            $mainBackgroundPosition="center"
            $mainBackgroundRepeat="repeat"
            $mainBgColor="var(--primary-color)"
            $mainHeight="100vh"
            $mainTabletHeight="fit-content"
            $mainTabletMinHeight="100vh"

            $sectionPadding="2rem 2rem 2rem 2rem"
            $sectionMobilePadding="2rem 0.5rem 1rem 0.5rem"
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
            $sectionHeight="100%"
            $sectionMinHeight="fit-content"
            style={{ overflow: 'hidden' }}
        >

            <PageHeader />

            <Section
                $flex
                $height="90%"
                $position="relative"
                $alignItems="stretch"
                $justifyContent="space-between"
                $tablet2FlexDirection="column"
                $tablet2AlignItems="center"
                $gap="1rem"
            >
                <motion.div
                    layout
                    variants={infoGetterVariants}
                    initial="initial"
                    style={{
                        display: 'flex',
                    }}
                >
                    <UserInfoGetter />
                </motion.div>

                <motion.div
                    layout
                    variants={logoVariants}
                    initial="initial"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <InteractiveFuriaLogo />
                </motion.div>
            </Section>
        </PageWrapper>

    )
}
