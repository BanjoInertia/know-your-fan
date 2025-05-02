import Text from "../../../components/text/text";
import { Motion } from "framer-motion";

export const NewsArticleItem = ({ article, index }) => {
    const formatDescription = (desc) => {
        if (!desc) return "Descrição não disponível.";
        return desc.length > 150 ? `${desc.substring(0, 150)}...` : desc;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Data não disponível';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'Data inválida';
        }
    };

    return (
        <Motion.div
            key={article.url || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            style={{ borderBottom: '1px solid var(--secondary-color)', paddingBottom: '0.8rem' }}
        >
            <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
                title={`Ler notícia: ${article.title}`}
            >
                <Text $mobileFontSize="1.5rem" $fontSize="1.1rem" $fontWeight="600" $marginBottom="0.2rem">
                    {article.title || 'Título não disponível'}
                </Text>
            </a>
            <Text $fontSize="0.8rem" $color="var(--secondary-font-color)" $marginBottom="0.3rem">
                Fonte: {article.source?.name || 'Desconhecida'} - {formatDate(article.publishedAt)}
            </Text>
            <Text $fontSize="0.9rem" $color="var(--secondary-font-color)" $lineHeight="1.4">
                {formatDescription(article.description)}
            </Text>
        </Motion.div>
    );
};