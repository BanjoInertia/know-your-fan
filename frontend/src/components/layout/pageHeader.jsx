import React from 'react';
import Section from "../section/section";
import Image from "../image/Image";
import FuriaLogoText from "../../assets/furia_logo_text.png";

const PageHeader = () => {
    return (
        <Section
            $height="10%"
            $flex
            $justifyContent="center"
            $alignItems="end"
        >
            <Image
                src={FuriaLogoText}
                alt="Furia Logo"
                width="100%"
                height="80px"
                objectFit="contain"
                filter="var(--logo-text-filter)"
            />
        </Section>
    );
};

export default PageHeader;