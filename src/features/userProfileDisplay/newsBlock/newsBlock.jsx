import Container from "../../../components/container/Container";
import Text from "../../../components/text/Text";
import { motion as Motion } from 'framer-motion';

export const NewsBlock = ({ gameName, articles, loading, error }) => {
    return (
        <Motion.div style={{ width: '100%' }}>
            <Container $flex $flexDirection="column" $gap="0.5rem" $width="100%" $tabletWidth="100%" $height="fit-content" $padding="1rem" $tabletPadding="1rem 0 0 0">
                <Container $bgColor="var(--primary-color)" $padding="2rem" $mobilePadding="0.5rem" $radius="20px" $boxShadow="5px 5px 0 var(--secondary-color)" $border="2px solid var(--secondary-color)">
                    <Text $fontSize="1.5rem" $align="center" $margin="0 0 1rem 0" $textTransform="uppercase">
                        Notícias {gameName ? `sobre ${gameName} e FURIA` : 'do Mundo Gamer'}
                    </Text>
                    <Motion.div layout style={{ width: '100%' }}>
                        {loading && (
                            <Text $align="center">Carregando notícias...</Text>
                        )}
                        {error && (
                            <Text $color="orange" $align="center">Erro ao carregar notícias: {error}</Text>
                        )}
                        {!loading && !error && articles.length === 0 && gameName && (
                            <Text $color="grey" $align="center">Nenhuma notícia relevante encontrada no momento.</Text>
                        )}
                         {!loading && !error && articles.length === 0 && !gameName && (
                            <Text $color="grey" $align="center">Nenhuma notícia para exibir (jogo favorito não definido?).</Text>
                        )}
                        {!loading && !error && articles.length > 0 && (
                            <Container
                                $flex
                                $flexDirection="column"
                                $gap="1rem"
                                $width="100%"
                                $maxHeight="300px"
                                style={{ overflowY: 'auto', paddingRight: '10px' }}
                            >
                                {articles.map((article, index) => (
                                    <NewsArticleItem key={article.url || index} article={article} index={index} />
                                ))}
                            </Container>
                        )}
                    </Motion.div>
                </Container>
            </Container>
        </Motion.div>
    );
};