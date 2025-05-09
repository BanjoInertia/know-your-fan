import { motion as Motion } from 'framer-motion';
import Container from '../../components/container/Container';
import Text from '../../components/text/Text';
import Button from '../../components/button/Button';
import Input from '../../components/input/Input';

const interestFormVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.1 },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: -10,
        transition: { duration: 0.3, ease: 'easeIn' },
    },
};

const interestFormElementVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
}

function UserInterestForm({
    game, setGame,
    platform, setPlatform,
    eventName, setEventName,
    product, setProduct,
    firstContact, setFirstContact,
    favoritePlayer, setFavoritePlayer,
    timeFollowing, setTimeFollowing,
    knewFuria, setKnewFuria,
    attendedEvent, setAttendedEvent,
}) {

    return (
        <Motion.div
            variants={interestFormVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}
        >
            <Motion.div variants={interestFormElementVariants} style={{ width: '100%' }}>
                <Text $mobileFontSize="2rem" $tabletFontSize="2rem" $fontSize="1.6rem" $align="center" $fontWeight="500">
                    Complete seu perfil
                </Text>
            </Motion.div>

            <Motion.div variants={interestFormElementVariants} style={{ width: '100%' }}>
                <Container $flex $flexDirection="row" $gap="1rem" $width="100%" $alignItems="flex-start">
                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-knew-furia" style={{ display: 'block' }}>
                            <Text  $fontSize="0.8rem" $fontWeight="500" $margin="0">
                                Já conhecia a FURIA?
                            </Text>
                        </label>
                        <Container id="form-knew-furia" $flex $gap="0.5rem" $width="100%">
                            <Button
                                $width="100%"
                                $fullWidth
                                $fontSize="0.9rem"
                                $fontWeight="500"
                                $isActive={knewFuria === true}
                                onClick={() => setKnewFuria(true)}
                            >
                                Sim
                            </Button>
                            <Button
                                $width="100%"
                                $fullWidth
                                $fontSize="0.9rem"
                                $fontWeight="500"
                                $isActive={knewFuria === false}
                                onClick={() => setKnewFuria(false)}
                            >
                                Não
                            </Button>
                        </Container>
                    </Container>

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-game" style={{ display: 'block' }}>
                            <Text  $fontSize="0.8rem" $fontWeight="500" $margin="0">
                                Jogo Favorito
                            </Text>
                        </label>
                        <Input
                            id="form-game"
                            placeholder="Ex: CS2, LoL, Valorant"
                            $fullWidth
                            value={game}
                            onChange={(e) => setGame(e.target.value)}
                        />
                    </Container>

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-platform" style={{ display: 'block' }}>
                            <Text  $fontSize="0.8rem" $fontWeight="500" $margin="0">
                                Plataforma Principal
                            </Text>
                        </label>
                        <Input
                            id="form-platform"
                            placeholder="Ex: PC, console, mobile"
                            $fullWidth
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                        />
                    </Container>
                </Container>
            </Motion.div>

            <Motion.div variants={interestFormElementVariants} style={{ width: '100%' }}>
                <Container $flex $flexDirection="row" $gap="1rem" $width="100%" $alignItems="flex-start">

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-attended-event" style={{ display: 'block' }}>
                            <Text  $fontSize="0.8rem" $fontWeight="500" $margin="0">
                                Já foi a algum evento de eSports?
                            </Text>
                        </label>
                        <Container id="form-attended-event" $flex $gap="0.5rem" $width="100%">
                            <Button
                                $width="100%"
                                $fullWidth
                                $fontSize="0.9rem"
                                $fontWeight="500"
                                $isActive={attendedEvent === true}
                                onClick={() => setAttendedEvent(true)}
                            >
                                Sim
                            </Button>
                            <Button
                                $width="100%"
                                $fullWidth
                                $fontSize="0.9rem"
                                $fontWeight="500"
                                $isActive={attendedEvent === false}
                                onClick={() => setAttendedEvent(false)}
                            >
                                Não
                            </Button>
                        </Container>
                    </Container>

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-event-name" style={{ display: 'block' }}>
                            <Text  $fontSize="0.8rem" $fontWeight="500" $margin="0">
                                Qual evento? (Opcional)
                            </Text>
                        </label>
                        <Input
                            id="form-event-name"
                            placeholder="Ex: IEM, ESL, PGL"
                            $fullWidth
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                        />
                    </Container>

                </Container>
            </Motion.div>

            <Motion.div variants={interestFormElementVariants} style={{ width: '100%' }}>
                <Container $flex $flexDirection="row" $gap="1rem" $width="100%" $alignItems="flex-start">

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-product" style={{ display: 'block' }}>
                            <Text  $fontSize="0.8rem" $fontWeight="500" $margin="0">
                                Você já comprou algum produto da FURIA? (Opcional)
                            </Text>
                        </label>
                        <Input
                            id="form-product"
                            placeholder="Ex: Camiseta, boné, mousepad"
                            $fullWidth
                            value={product}
                            onChange={(e) => setProduct(e.target.value)}
                        />
                    </Container>

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-favorite-player" style={{ display: 'block' }}>
                            <Text  $fontSize="0.8rem" $fontWeight="500" $margin="0">
                                Qual seu jogador favorito da FURIA? (Opcional)
                            </Text>
                        </label>
                        <Input
                            id="form-favorite-player"
                            placeholder="Ex: FalleN, KSCERATO, arT"
                            $fullWidth
                            value={favoritePlayer}
                            onChange={(e) => setFavoritePlayer(e.target.value)}
                        />
                    </Container>

                </Container>
            </Motion.div>

            <Motion.div variants={interestFormElementVariants} style={{ width: '100%' }}>
                <Container $flex $flexDirection="row" $gap="1rem" $width="100%" $alignItems="flex-start">
                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-first-contact" style={{ display: 'block' }}>
                            <Text  $fontSize="0.8rem" $fontWeight="500" $margin="0">
                                Qual foi o seu primeiro contato com a FURIA? (Opcional) 
                            </Text>
                        </label>
                        <Input
                            id="form-first-contact"
                            placeholder="Ex: YouTube, Twitch, amigos"
                            $fullWidth
                            value={firstContact}
                            onChange={(e) => setFirstContact(e.target.value)}
                        />
                    </Container>

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-time-following" style={{ display: 'block' }}>
                            <Text  $fontSize="0.8rem" $fontWeight="500" $margin="0">
                                Quanto tempo acompanha a FURIA? (Opcional)
                            </Text>
                        </label>
                        <Input
                            id="form-time-following"
                            placeholder="Ex: 1 ano, 2 anos, 3 anos"
                            $fullWidth
                            value={timeFollowing}
                            onChange={(e) => setTimeFollowing(e.target.value)}
                        />
                    </Container>

                </Container>
            </Motion.div>

        </Motion.div>
    );
}


export default UserInterestForm;