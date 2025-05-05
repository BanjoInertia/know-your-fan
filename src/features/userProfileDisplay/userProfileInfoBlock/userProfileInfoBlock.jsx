import profilePictureTemplate from '../../../assets/profile-picture-template.png';
import { motion as Motion } from 'framer-motion';
import Container from '../../../components/container/Container';
import Button from '../../../components/button/button';
import Text from '../../../components/text/text';
import Image from '../../../components/image/Image';

export const ProfileInfoBlock = ({ profileData, isFollowingTargetChannel, checkingFollow, handleTwitchLogin }) => {
    return (
        <Motion.div style={{ width: '100%' }}>
            <Container
                $flex
                $flexDirection="row"
                $alignItems="center"
                $justifyContent="center"
                $tabletFlexDirection="column"
                $tabletWidth="100%"
                $tabletAlignItems="center"
                $tabletJustifyContent="center"
                $gap="0.5rem"
                $bgColor="var(--primary-color)"
                $radius="20px"
                $boxShadow="5px 5px 0 var(--secondary-color)"
                $border="2px solid var(--secondary-color)"
                $padding="0.5rem 1rem"
            >
                {/* Avatar and Twitch Button */}
                <Container $flex $flexDirection="column" $gap="0.5rem" $width="200px" $height="100%" $justifyContent="center" $alignItems="center" >
                    <Container
                        $flex
                        $justifyContent="center"
                        $alignItems="center"
                        $border="5px solid var(--secondary-color)"
                        $radius="100%"
                        $width="200px"
                        $height="200px"
                        $position="relative"
                    >
                        {profileData.twitchAvatarUrl ? (
                            <Image
                                src={profileData.twitchAvatarUrl}
                                alt="Avatar da Twitch"
                                borderRadius="100%"
                                $width="100%"
                                $height="100%"
                            />
                        ) : (
                            <Image
                                src={profilePictureTemplate}
                                alt="Avatar Padrão"
                                borderRadius="100%"
                                $width="100%"
                                $height="100%"
                            />
                        )}
                    </Container>
                    {!profileData.twitchLinked && (
                        <Button
                            $width="100%"
                            $padding="0.3rem 0.6rem"
                            $fontSize="0.8rem"
                            $fontWeight="500"
                            $isActive={false}
                            $textColor="var(--twitch-button-color)"
                            $bgColor="white"
                            $boxShadow="5px 5px 0 var(--twitch-button-color)"
                            $borderColor="var(--twitch-button-color)"
                            onClick={handleTwitchLogin}
                        >
                            <Text $color="var(--twitch-button-color)">Vincular Twitch</Text>
                        </Button>
                    )}
                </Container>

                <Container $flex $flexDirection="column" $gap="0.2rem" $width="100%" $justifyContent="stretch" $alignItems="flex-start" $padding="2rem" $tabletPadding="0.5rem">
                    <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" $textTransform="uppercase" >USUÁRIO: {profileData.userName || 'N/A'}</Text>
                    <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" $textTransform="capitalize" >NOME: {profileData.name || 'N/A'}</Text>
                    <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" >EMAIL: {profileData.email || 'N/A'}</Text>
                    <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" >TWITCH: {profileData.twitchLogin || (profileData.twitchLinked ? 'Vinculado' : 'Não vinculado')}</Text>
                    <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" >JOGO FAVORITO: {profileData.interests?.game || 'Não definido'}</Text>

                    {profileData?.twitchLinked && (
                        <Container $flex $alignItems="flex-start" $marginTop="1rem">
                            {checkingFollow ? (
                                <Text >Verificando follow...</Text>
                            ) : isFollowingTargetChannel === true ? (
                                <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" $color="green">Você segue a FURIA na Twitch!</Text>
                            ) : isFollowingTargetChannel === false ? (
                                <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" $color="orange">Você não segue a FURIA na Twitch!</Text>
                            ) : (
                                <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" $color="grey">Aguardando verificação do follow...</Text>
                            )}
                        </Container>
                    )}
                </Container>
            </Container>
        </Motion.div>
    );
};