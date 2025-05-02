import React from 'react';
import Main from "../main/Main";
import Section from "../section/section";
import FuriaLogo from "../../assets/Furia_Esports_logo.png";

const PageWrapper = ({
    children,
    $mainPadding,
    $mainMobilePadding,
    $mainBackgroundImage,
    $mainBackgroundSize,
    $mainBackgroundPosition,
    $mainBackgroundRepeat,
    $mainBgColor,
    $mainHeight,
    $mainMinHeight,
    $mainTabletHeight,
    $mainTabletMinHeight,
    $sectionPadding,
    $sectionMobilePadding,
    $sectionBorder,
    $sectionRadius,
    $sectionBoxShadow,
    $sectionBgColor,
    $sectionBackdropFilter,
    $sectionBackgroundImage,
    $sectionBackgroundSize,
    $sectionBackgroundPosition,
    $sectionBackgroundRepeat,
    $sectionPosition,
    $sectionMinHeight,
    $sectionHeight,
    $sectionJustifyContent,
    sectionStyle,
}) => {
    return (
        <Main
            $padding={$mainPadding}
            $mobilePadding={$mainMobilePadding}
            $backgroundImage={$mainBackgroundImage || `url(${FuriaLogo})`}
            $backgroundSize={$mainBackgroundSize}
            $backgroundPosition={$mainBackgroundPosition}
            $backgroundRepeat={$mainBackgroundRepeat}
            $bgColor={$mainBgColor}
            $height={$mainHeight}
            $minHeight={$mainMinHeight}
            $tabletHeight={$mainTabletHeight}
            $tabletMinHeight={$mainTabletMinHeight}
        >
            <Section
                $padding={$sectionPadding}
                $mobilePadding={$sectionMobilePadding}
                $border={$sectionBorder}
                $radius={$sectionRadius}
                $boxShadow={$sectionBoxShadow}
                $bgColor={$sectionBgColor}
                $backdropFilter={$sectionBackdropFilter}
                $backgroundImage={$sectionBackgroundImage}
                $backgroundSize={$sectionBackgroundSize}
                $backgroundPosition={$sectionBackgroundPosition}
                $backgroundRepeat={$sectionBackgroundRepeat}
                $position={$sectionPosition}
                $minHeight={$sectionMinHeight}
                $height={$sectionHeight}
                $justifyContent={$sectionJustifyContent}
                style={sectionStyle}
            >
                {children}
            </Section>
        </Main>
    );
};

export default PageWrapper;