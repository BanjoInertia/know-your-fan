import React, { useState, useEffect } from 'react';
import Container from '../../components/container/Container';
import Text from '../../components/text/Text';
import Title from '../../components/title/Title';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const FuriaMatchesDisplay = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BACKEND_URL}/api/furia-matches`);
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {
                    setMatches(data.matches);
                } else {
                    throw new Error(data.error || 'Failed to fetch matches.');
                }
            } catch (e) {
                console.error("Error fetching Furia matches:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    if (loading) return <p>Carregando últimas partidas da FURIA...</p>;
    if (error) return <p style={{ color: 'red' }}>Erro ao carregar partidas: {error}</p>;
    if (matches.length === 0) return <p>Nenhuma partida recente encontrada.</p>;

    return (
        <Container
            $width="fit-content"
            $mobileWidth="100%"
            style={{ marginTop: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}
        >
            <Title $mobileFontSize="0.8rem" $fontSize="1rem" $align="center" $margin="0 0 1rem 0">Últimas Partidas da FURIA<br />no VALORANT</Title>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {matches.map((match, index) => (
                    <li key={match.matchLink || index} style={{ marginBottom: '1.5rem', borderBottom: '1px dashed #eee', paddingBottom: '1rem' }}>



                        <a style={{ textDecoration: 'none' }} href={match.matchLink} target="_blank" rel="noopener noreferrer">
                            <Text
                                $mobileFontSize="2rem"
                                $align="center"
                                $fontSize="1rem"
                            >
                                FURIA ({match.furiaScore}) vs {match.opponent.name} ({match.opponentScore})
                            </Text>
                        </a>
                        <Text
                            $color={match.result === 'Win' ? 'green' : (match.result === 'Loss' ? 'red' : 'grey')}
                            $textTransform="uppercase"
                            $align="center"
                            $mobileFontSize="2rem"
                        >
                            {match.result === 'Win' ? 'Vitória' : (match.result === 'Loss' ? 'Derrota' : 'Empate')}
                        </Text>
                        <Text $mobileFontSize="1rem" $fontSize="0.8rem" $color="var(--secondary-font-color)">Torneio: {match.tournamentName} {match.stage}</Text>
                        <Text $mobileFontSize="1rem" $fontSize="0.8rem" $color="var(--secondary-font-color)">Data: {match.date} {match.time ? `- ${match.time}` : ''}</Text>
                        
                    </li>
                ))}
            </ul>
        </Container>
    );
}

export default FuriaMatchesDisplay;