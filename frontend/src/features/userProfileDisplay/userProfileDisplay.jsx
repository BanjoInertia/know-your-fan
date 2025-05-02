import { motion as Motion, AnimatePresence } from 'framer-motion';
import Container from '../../components/container/Container';
import Button from '../../components/button/Button';
import Text from '../../components/text/Text';
import Image from '../../components/image/Image';
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import InteractiveFuriaLogo from '../interactiveFuriaLogo/InteractiveFuriaLogo';
import FuriaMatchesDisplay from '../furiaMatchesDisplay/furiaMatchesDisplay';
import profilePictureTemplate from '../../assets/profile-picture-template.png';

const MotionContainer = Motion(Container);
const MotionButton = Motion(Button);

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TARGET_TWITCH_CHANNEL_NAME = 'FURIAtv';

function UserProfileDisplay({ userProfile }) {
    const location = useLocation();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowingTargetChannel, setIsFollowingTargetChannel] = useState(null);
    const [checkingFollow, setCheckingFollow] = useState(false);

    const [newsArticles, setNewsArticles] = useState([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [newsError, setNewsError] = useState(null);

    const handleTwitchLogin = () => {
        window.location.href = `${BACKEND_URL}/auth/twitch`;
    };

    const checkFollowStatus = useCallback(async () => {
        if (profileData?.twitchLinked && isFollowingTargetChannel === null && !checkingFollow) {
            console.log(`Checking follow status for channel: ${TARGET_TWITCH_CHANNEL_NAME}`);
            setCheckingFollow(true);
            try {
                const response = await fetch(`${BACKEND_URL}/api/check-twitch-follow?channelName=${TARGET_TWITCH_CHANNEL_NAME}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    console.log(`[Frontend] Follow check failed with status: ${response.status}. Suppressing error for demo.`);
                    setIsFollowingTargetChannel(false);
                } else {
                    const data = await response.json();
                    console.log(`[Frontend] Follow status received:`, data);
                    setIsFollowingTargetChannel(data.follows);
                }

            } catch (error) {
                console.log("[Frontend] Network or other fetch error occurred. Suppressing error for demo.", error.message);
                if (isFollowingTargetChannel === null) {
                    setIsFollowingTargetChannel(false);
                }
            } finally {
                console.log("[Frontend] Setting checkingFollow to false.");
                setCheckingFollow(false);
            }
        } else {
            if (!checkingFollow && isFollowingTargetChannel === null) {
                console.log("[Frontend] Follow check skipped. Conditions:", {
                    twitchLinked: profileData?.twitchLinked,
                    isFollowingTargetChannel,
                    checkingFollow
                });
            }
        }
    }, [profileData, isFollowingTargetChannel, checkingFollow]);


    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const twitchLinked = params.get('twitch_linked') === 'true';
        const twitchId = params.get('twitch_id');
        const twitchLogin = params.get('twitch_login');
        const twitchAvatarUrl = params.get('twitch_avatar_url') ? decodeURIComponent(params.get('twitch_avatar_url')) : null;

        let processed = false;

        if (twitchLinked && twitchId && twitchLogin && twitchAvatarUrl) {
            console.log("[Frontend] Detected Twitch redirect params. Attempting to update profile...");
            try {
                const profilesRaw = localStorage.getItem('userProfiles');
                let profiles = profilesRaw ? JSON.parse(profilesRaw) : [];

                if (Array.isArray(profiles) && profiles.length > 0) {
                    const lastProfileIndex = profiles.length - 1;

                    const updatedProfile = {
                        ...profiles[lastProfileIndex],
                        twitchId: twitchId,
                        twitchLogin: twitchLogin,
                        twitchAvatarUrl: twitchAvatarUrl,
                        twitchLinked: true
                    };

                    profiles[lastProfileIndex] = updatedProfile;

                    localStorage.setItem('userProfiles', JSON.stringify(profiles));
                    console.log("[Frontend] localStorage updated with Twitch info:", updatedProfile);

                    setProfileData(updatedProfile);
                    console.log("[Frontend] profileData state updated directly from redirect data.");
                    processed = true;

                    window.history.replaceState(null, '', location.pathname);
                    console.log("[Frontend] URL query parameters removed.");

                } else {
                    console.error("No profiles found in localStorage to update with Twitch info.");
                }
            } catch (error) {
                console.error("Error updating profile with Twitch data:", error);
            }
        }

        if (!processed) {
            console.log("[Frontend] Proceeding with non-redirect profile loading.");
            if (userProfile) {
                console.log("[Frontend] Using userProfile prop:", userProfile);
                if (userProfile.twitchLinked) {
                    console.log("[Frontend] Prop already contains twitchLinked=true");
                } else {
                    console.log("[Frontend] Prop does NOT contain twitchLinked=true");
                }
                setProfileData(userProfile);
            } else {
                console.log("[Frontend] No userProfile prop, attempting localStorage lookup.");
                try {
                    const profilesRaw = localStorage.getItem('userProfiles');
                    if (profilesRaw) {
                        const profiles = JSON.parse(profilesRaw);
                        const lastProfile = profiles.length > 0 ? profiles[profiles.length - 1] : null;
                        if (lastProfile) {
                            console.log("[Frontend] Loaded profile from localStorage:", lastProfile);
                            setProfileData(lastProfile);
                        } else {
                            console.error("[Frontend] localStorage 'userProfiles' exists but is empty or invalid.");
                            setProfileData(null);
                        }
                    } else {
                        console.log("[Frontend] No 'userProfiles' found in localStorage.");
                        setProfileData(null);
                    }
                } catch (error) {
                    console.error("[Frontend] Error reading profile from localStorage:", error);
                    setProfileData(null);
                }
            }
        }
        setLoading(false);
        console.log("[Frontend] Profile loading effect finished.");

    }, [userProfile, location.search, location.pathname]);

    useEffect(() => {
        const fetchNews = async () => {
            if (profileData?.interests?.game) {
                setNewsLoading(true);
                setNewsError(null);
                setNewsArticles([]);
                console.log(`[Frontend] Fetching news for game: ${profileData.interests.game}`);
                try {
                    const response = await fetch(`${BACKEND_URL}/api/news?game=${encodeURIComponent(profileData.interests.game)}`);

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || `Erro ${response.status} ao buscar notícias.`);
                    }

                    const data = await response.json();

                    if (data.success && Array.isArray(data.articles)) {
                        console.log("[Frontend] News received:", data.articles);
                        setNewsArticles(data.articles);
                    } else {
                        throw new Error(data.error || 'Formato de notícias inesperado recebido.');
                    }

                } catch (error) {
                    console.error("[Frontend] Error fetching news:", error);
                    setNewsError(error.message);
                    setNewsArticles([]);
                } finally {
                    setNewsLoading(false);
                }
            } else {
                console.log("[Frontend] Skipping news fetch: No favorite game found in profile.");
                setNewsArticles([]);
                setNewsLoading(false);
                setNewsError(null);
            }
        };

        if (profileData && profileData.interests?.game) {
            fetchNews();
        }

    }, [profileData]);

    useEffect(() => {
        if (profileData && profileData.twitchLinked) {
            console.log("[Frontend] profileData updated with twitchLinked=true, triggering checkFollowStatus.");
            checkFollowStatus();
        } else if (profileData) {
            console.log("[Frontend] profileData updated, but twitchLinked is still not true. Skipping follow check.");
        } else {
            console.log("[Frontend] profileData is null. Skipping follow check.");
        }
    }, [profileData, checkFollowStatus]);


    if (loading) {
        return <div>Carregando perfil...</div>;
    }

    if (!profileData) {
        return <div>Perfil não encontrado.</div>;
    }

    return (
        <MotionContainer
            layout
            $height="auto"
            $flex
            $flexDirection="row"
            $mobileFlexDirection="column"
            $alignItems="center"
            $gap="4rem"
            $tabletGap="2rem"
            $justifyContent="flex-start"
            $bgColor="var(--quaternary-color)"
            $border="2px solid var(--secondary-color)"
            $radius="20px"
            $boxShadow="5px 5px 0 var(--secondary-color)"
            $padding="2rem"
            $mobilePadding="1rem"
            style={{ overflow: 'hidden', minHeight: '150px' }}
        >
            <Container
                $width="100%"
                $height="100%"
                $display="flex"
                $flexDirection="column"
                $alignItems="center"
                $gap="0.8rem"
                $marginBottom="0.8rem"
            >
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
                                        alt="Avatar da Twitch"
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
                            <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" $textTransform="uppercase" >USUÁRIO: {profileData.userName}</Text>
                            <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" $textTransform="capitalize" >NOME: {profileData.name}</Text>
                            <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" >EMAIL: {profileData.email}</Text>
                            <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" >TWITCH: {profileData.twitchLogin}</Text>
                            <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" >JOGO FAVORITO: {profileData.interests.game}</Text>

                            {profileData?.twitchLinked && (
                                <Container $flex $alignItems="flex-start" $marginTop="1rem">
                                    {checkingFollow ? (
                                        <Text >Verificando follow...</Text>
                                    ) : isFollowingTargetChannel === true ? (
                                        <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" $color="green">Você segue a FURIA na twitch!</Text>
                                    ) : isFollowingTargetChannel === false ? (
                                        <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" $color="orange">Você não segue a FURIA na twitch!</Text>
                                    ) : (
                                        <Text $mobileFontSize="1.3rem" $fontSize="1.5rem" $color="grey">Verificando status do follow...</Text>
                                    )}
                                </Container>
                            )}
                        </Container>
                    </Container>
                </Motion.div>

                <Motion.div style={{ width: '100%' }}>
                    <Container $flex $flexDirection="column" $gap="0.5rem" $width="100%" $tabletWidth="100%" $height="fit-content" $padding="1rem" $tabletPadding="1rem 0 0 0">
                        <Container $bgColor="var(--primary-color)" $padding="2rem" $mobilePadding="0.5rem" $radius="20px" $boxShadow="5px 5px 0 var(--secondary-color)" $border="2px solid var(--secondary-color)">

                            <Text $fontSize="1.5rem" $align="center" $margin="0 0 0.1rem 0">NOTICIAS RELACIONADAS AO SEU JOGO FAVORITO</Text>
                            <Motion.div layout style={{ width: '100%' }}>
                                <Container $flex $flexDirection="column" $gap="0.5rem" $width="100%" $marginTop="1rem">
                                    <Text $fontSize="1.2rem" $fontWeight="600" $margin="0 0 1rem 0" $align="center" $textTransform="uppercase">
                                        Notícias sobre {profileData.interests.game} e FURIA
                                    </Text>

                                    {newsLoading && (
                                        <Text >Carregando notícias...</Text>
                                    )}

                                    {newsError && (
                                        <Text $color="orange">Erro ao carregar notícias: {newsError}</Text>
                                    )}

                                    {!newsLoading && !newsError && newsArticles.length === 0 && profileData.interests.game && (
                                        <Text $color="grey">Nenhuma notícia relevante encontrada no momento.</Text>
                                    )}
                                    {!newsLoading && !newsError && !profileData.interests.game && (
                                        <Text $color="grey">Defina seu jogo favorito para ver notícias.</Text>
                                    )}

                                    {!newsLoading && !newsError && newsArticles.length > 0 && (
                                        <Container
                                            $flex
                                            $flexDirection="column"
                                            $gap="1rem"
                                            $width="100%"
                                            $maxHeight="300px"
                                            style={{ overflowY: 'auto', paddingRight: '10px' }}
                                        >
                                            {newsArticles.map((article, index) => (
                                                <Motion.div
                                                    key={article.url || index}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                    style={{ borderBottom: '1px solid var(--secondary-color)', paddingBottom: '0.8rem' }}
                                                >
                                                    <a
                                                        href={article.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                                    >
                                                        <Text $mobileFontSize="1.5.4rem" $fontSize="1.1rem" $fontWeight="600" $marginBottom="0.2rem">
                                                            {article.title}
                                                        </Text>
                                                    </a>
                                                    <Text $fontSize="0.8rem" $color="var(--secondary-font-color)" $marginBottom="0.3rem">
                                                        Fonte: {article.source.name} - {article.publishedAt ? article.publishedAt : 'Data não disponível'}
                                                    </Text>
                                                    <Text $fontSize="0.9rem" $color="var(--secondary-font-color)" $lineHeight="1.4">
                                                        {
                                                            article.description
                                                                ? (article.description.length > 150
                                                                    ? `${article.description.substring(0, 150)}...`
                                                                    : article.description
                                                                )
                                                                : "Descrição não disponível."
                                                        }
                                                    </Text>
                                                </Motion.div>
                                            ))}
                                        </Container>
                                    )}
                                </Container>
                            </Motion.div>
                        </Container>
                    </Container>
                </Motion.div>


            </Container>
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
                $transition="duration: 0.5, ease: 'easeInOut'"
            >
                <InteractiveFuriaLogo screen="profile" />
                <FuriaMatchesDisplay />
            </Container>
        </MotionContainer>
    );
}

export default UserProfileDisplay;