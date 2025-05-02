import Container from "../../../components/container/Container";
import { InteractiveFuriaLogo } from "../../interactiveFuriaLogo/InteractiveFuriaLogo";
import { FuriaMatchesDisplay } from "../../furiaMatchesDisplay/furiaMatchesDisplay";

export const SideWidgetsSection = () => {
    return (
        <Container
            layout
            $flex
            $flexDirection="column"
            $gap="5rem"
            $justifyContent="center"
            $alignItems="center"
            $width="300px"
            $height="fit-content"
            $mobileWidth="100%"
        >
            <InteractiveFuriaLogo screen="profile" />
            <FuriaMatchesDisplay />
        </Container>
    );
};