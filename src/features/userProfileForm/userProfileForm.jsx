import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion as Motion } from 'framer-motion';
import Container from '../../components/container/Container';
import Input from '../../components/input/Input';
import Text from '../../components/text/Text';  
import {
    validateEmail,
    validateCpf,
    validateBirthDate,
    formatCpf, 
    formatBirthDate, 
    formatCep, 
    validateCep
} from '../../../utils/validation';

const formVariants = {
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

const formElementVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
}

function UserProfileForm({
    email,setEmail,
    birthDate,setBirthDate,
    cpf,setCpf,
    setDocumentFile,
    name,setName,
    address,setAddress,
    cep,setCep,
    neighborhood,setNeighborhood,
    city,setCity,
    stateUF,setStateUF,
    complement,setComplement,
    showForm,
    isDocumentValidating,
    validationError,
    documentValidationResult,
}) {
    const [emailError, setEmailError] = useState('');
    const [isCepLoading, setIsCepLoading] = useState(false);
    const [cepError, setCepError] = useState('');
    const [cpfError, setCpfError] = useState('');
    const [birthDateError, setBirthDateError] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (emailError) {
            setEmailError('');
        }
    };

    const handleEmailBlur = () => {
        if (email && !validateEmail(email)) {
            setEmailError('Por favor, insira um email válido.');
        } else {
            setEmailError('');
        }
    };

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setDocumentFile(event.target.files[0]);
        } else {
            setDocumentFile(null);
        }
    };

    const clearAddressFields = () => {
        setAddress('');
        setNeighborhood('');
        setCity('');
        setStateUF('');
    };

    const fetchAddressFromCep = async (cepValue) => {
        const cleanedCep = cepValue.replace(/\D/g, '');

        if (cleanedCep.length !== 8) {
            setCepError('');
            return;
        }

        setIsCepLoading(true);
        setCepError('');
        clearAddressFields();

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
            if (!response.ok) {
                throw new Error('Erro na rede ao buscar o CEP.');
            }
            const data = await response.json();

            if (data.erro) {
                throw new Error('CEP não encontrado.');
            } else {
                setAddress(data.logradouro || '');
                setNeighborhood(data.bairro || '');
                setCity(data.localidade || '');
                setStateUF(data.uf || '');

                const addressInput = document.getElementById('form-address');
                if (addressInput && !data.logradouro) {
                    addressInput.focus();
                }
            }
        } catch (error) {
            console.error("Falha ao buscar CEP:", error);
            setCepError(error.message || 'Falha ao consultar o CEP.');
            clearAddressFields();
        } finally {
            setIsCepLoading(false);
        }
    };

    const handleCepChange = (e) => {
        const formattedValue = formatCep(e.target.value);
        setCep(formattedValue);

        if (cepError) setCepError('');
    };

    const handleCepBlur = (e) => {
        const currentCep = e.target.value;
        if (currentCep && validateCep(currentCep)) {
            fetchAddressFromCep(currentCep);
        } else if (currentCep) {
            setCepError("CEP inválido. Use 8 dígitos.");
        } else {
            setCepError('');
        }
    };

    const handleCpfChange = (e) => {
        const formattedValue = formatCpf(e.target.value);
        setCpf(formattedValue);
        if (cpfError) setCpfError('');
    };

    const handleCpfBlur = (e) => {
        const currentCpf = e.target.value;
        if (currentCpf && !validateCpf(currentCpf)) {
            setCpfError('CPF inválido. Verifique os 11 dígitos.');
        } else {
            setCpfError('');
        }
    };

    const handleBirthDateChange = (e) => {
        const formattedValue = formatBirthDate(e.target.value);
        setBirthDate(formattedValue);

        if (birthDateError) setBirthDateError('');
    };

    const handleBirthDateBlur = (e) => {
        const currentDate = e.target.value;
        if (currentDate && !validateBirthDate(currentDate)) {
            setBirthDateError('Data inválida.');
        } else {
            setBirthDateError('');
        }
    };

    return (
        <Motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}
        >
            <Motion.div variants={formElementVariants} style={{ width: '100%' }}>
                <Text $mobileFontSize="2rem" $tabletFontSize="2rem" $fontSize="1.6rem" $align="center" $fontWeight="500">
                    Complete seu perfil
                </Text>
            </Motion.div>

            <Motion.div variants={formElementVariants} style={{ width: '100%' }}>
                <Container $flex $flexDirection="row" $gap="1rem" $width="100%" $alignItems="flex-start">
                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-name" style={{ display: 'block' }}>
                            <Text $mobileFontSize="2rem" $tabletFontSize="1.3rem" $fontSize="0.9rem" $fontWeight="500" $margin="0">
                                Nome completo
                            </Text>
                        </label>
                        <Input
                            id="form-name"
                            placeholder="Ex: Marcelo Henrique"
                            $fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Container>

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-cep" style={{ display: 'block' }}>
                            <Text $mobileFontSize="2rem" $tabletFontSize="1.3rem" $fontSize="0.9rem" $fontWeight="500" $margin="0">
                                CEP {isCepLoading && ' (Buscando...'}
                            </Text>
                        </label>
                        <Input
                            id="form-cep"
                            placeholder="Ex: 12345-678"
                            $fullWidth
                            value={cep}
                            onChange={handleCepChange}
                            onBlur={handleCepBlur}
                            maxLength={9}
                            style={{ borderColor: cepError ? 'var(--danger-color, red)' : undefined, boxShadow: cepError ? '5px 5px 0 red' : undefined }}
                        />
                        {cepError && (
                            <Text $color="var(--danger-color, red)" $fontSize="0.8rem" $margin="0.2rem 0 -0.8rem 0">
                                {cepError}
                            </Text>
                        )}
                    </Container>
                </Container>
            </Motion.div>

            <Motion.div variants={formElementVariants} style={{ width: '100%' }}>
                <Container $flex $flexDirection="row" $gap="1rem" $width="100%" $alignItems="flex-start">
                    <Container $flex $flexDirection="column" $gap="0.25rem">
                        <label htmlFor="form-address" style={{ display: 'block' }}>
                            <Text $mobileFontSize="2rem" $tabletFontSize="1.3rem" $fontSize="0.9rem" $fontWeight="500" $margin="0">
                                Endereço
                            </Text>
                        </label>
                        <Input
                            id="form-address"
                            placeholder="Ex: Rua das Flores"
                            $fullWidth
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            readOnly={isCepLoading}
                        />
                    </Container>

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-city" style={{ display: 'block' }}>
                            <Text $mobileFontSize="2rem" $tabletFontSize="1.3rem" $fontSize="0.9rem" $fontWeight="500" $margin="0">
                                Cidade
                            </Text>
                        </label>
                        <Input
                            id="form-city"
                            placeholder="Ex: São Paulo"
                            $fullWidth
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            readOnly={isCepLoading}
                        />
                    </Container>
                </Container>
            </Motion.div>

            <Motion.div variants={formElementVariants} style={{ width: '100%' }}>
                <Container $flex $flexDirection="row" $gap="1rem" $width="100%" $alignItems="flex-start">

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="0.5">
                        <label htmlFor="form-uf" style={{ display: 'block' }}>
                            <Text $mobileFontSize="2rem" $tabletFontSize="1.3rem" $fontSize="0.9rem" $fontWeight="500" $margin="0">
                                Estado
                            </Text>
                        </label>
                        <Input
                            id="form-uf"
                            placeholder="Ex: SP"
                            $fullWidth
                            value={stateUF}
                            onChange={(e) => setStateUF(e.target.value)}
                            readOnly={isCepLoading}
                            maxLength={2}
                        />
                    </Container>

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="0.5">
                        <label htmlFor="form-complement" style={{ display: 'block' }}>
                            <Text $mobileFontSize="2rem" $tabletFontSize="1.3rem" $fontSize="0.9rem" $fontWeight="500" $margin="0">
                                Complemento
                            </Text>
                        </label>
                        <Input
                            id="form-complement"
                            placeholder="Ex: Apto 123"
                            $fullWidth
                            value={complement}
                            onChange={(e) => setComplement(e.target.value)}
                            readOnly={isCepLoading}
                            maxLength={10}
                        />
                    </Container>

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-neighborhood" style={{ display: 'block' }}>
                            <Text $mobileFontSize="2rem" $tabletFontSize="1.3rem" $fontSize="0.9rem" $fontWeight="500" $margin="0">
                                Bairro
                            </Text>
                        </label>
                        <Input
                            id="form-neighborhood"
                            placeholder="Ex: Jardim das Flores"
                            $fullWidth
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            readOnly={isCepLoading}
                        />
                    </Container>
                </Container>
            </Motion.div>

            <Motion.div variants={formElementVariants} style={{ width: '100%' }}>
                <Container $flex $flexDirection="row" $gap="1rem" $width="100%" $alignItems="flex-start">
                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-cpf" style={{ display: 'block' }}>
                            <Text $mobileFontSize="2rem" $tabletFontSize="1.3rem" $fontSize="0.9rem" $fontWeight="500" $margin="0">
                                CPF
                            </Text>
                        </label>
                        <Input
                            id="form-cpf"
                            placeholder="Ex: 123.456.789-00"
                            $fullWidth
                            value={cpf}
                            onChange={handleCpfChange}
                            onBlur={handleCpfBlur}
                            maxLength={14}
                        />
                    </Container>

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-birthDate" style={{ display: 'block' }}>
                            <Text $mobileFontSize="2rem" $tabletFontSize="1.3rem" $fontSize="0.9rem" $fontWeight="500" $margin="0">
                                Data de Nascimento
                            </Text>
                        </label>
                        <Input
                            id="form-birthDate"
                            placeholder="Ex: 01/01/2000"
                            $fullWidth
                            value={birthDate}
                            onChange={handleBirthDateChange}
                            onBlur={handleBirthDateBlur}
                            maxLength={10}
                        />
                        {birthDateError && (
                            <Text $color="var(--danger-color, red)" $fontSize="0.8rem" $margin="0.2rem 0 -0.8rem 0">
                                {birthDateError}
                            </Text>
                        )}
                    </Container>
                </Container>
            </Motion.div>

            <Motion.div variants={formElementVariants} style={{ width: '100%' }}>
                <Container $flex $flexDirection="row" $gap="1rem" $width="100%" $alignItems="flex-start">

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-document" style={{ display: 'block' }}>
                            <Text $mobileFontSize="2rem" $tabletFontSize="1.3rem" $fontSize="0.9rem" $fontWeight="500" $margin="0">
                                Documento
                            </Text>
                        </label>
                        <Input
                            type="file"
                            id="form-document"
                            accept="image/png, image/jpeg, application/pdf"
                            onChange={handleFileChange}
                            $fullWidth
                            $fontSize="0.9rem"                        
                            $padding="0"
                        />

                        {showForm && (isDocumentValidating || validationError || documentValidationResult) && (
                            <Container $margin="0" $width="100%">
                                {isDocumentValidating && (
                                    <Text  $fontSize="0.8rem" $margin="0.2rem 0 -0.8rem 0">
                                        Validando documento...
                                    </Text>
                                )}
                                {validationError && !isDocumentValidating && (
                                    <Text $color="var(--error-color, red)" $fontSize="0.8rem" $margin="0.2rem 0 -0.8rem 0">
                                        Erro ao validar documento: {validationError}
                                    </Text>
                                )}
                                {documentValidationResult && !isDocumentValidating && !validationError && (
                                    <Text $color="var(--success-color, green)" $fontSize="0.8rem" $margin="0.2rem 0 -0.8rem 0">
                                        Documento analisado com sucesso!
                                    </Text>
                                )}
                            </Container>
                        )}
                    </Container>

                    <Container $flex $flexDirection="column" $gap="0.25rem" $flexN="1">
                        <label htmlFor="form-email" style={{ display: 'block' }}>
                            <Text $mobileFontSize="2rem" $tabletFontSize="1.3rem" $fontSize="0.9rem" $fontWeight="500" $margin="0">
                                Email
                            </Text>
                        </label>
                        <Input
                            id="form-email"
                            placeholder="seu@email.com"
                            type="email"
                            $fullWidth
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
                            required
                            style={{ borderColor: emailError ? 'var(--danger-color, red)' : undefined, boxShadow: emailError ? '5px 5px 0 red' : undefined }}
                        />
                        {emailError && (
                            <Text $color="var(--danger-color, red)" $fontSize="0.8rem" $margin="0.2rem 0 0 0">
                                {emailError}
                            </Text>
                        )}
                    </Container>

                </Container>
            </Motion.div>

        </Motion.div>
    );
}

UserProfileForm.propTypes = {
    key: PropTypes.string,
    email: PropTypes.string.isRequired,
    setEmail: PropTypes.func.isRequired,
    birthDate: PropTypes.string.isRequired,
    setBirthDate: PropTypes.func.isRequired,
    cpf: PropTypes.string.isRequired,
    setCpf: PropTypes.func.isRequired,
    documentFile: PropTypes.object,
    setDocumentFile: PropTypes.func.isRequired,
    showForm: PropTypes.bool,
    isDocumentValidating: PropTypes.bool,
    validationError: PropTypes.string,
    documentValidationResult: PropTypes.any,
    name: PropTypes.string.isRequired,
    setName: PropTypes.func.isRequired,
    address: PropTypes.string.isRequired,
    setAddress: PropTypes.func.isRequired,
    cep: PropTypes.string.isRequired,
    setCep: PropTypes.func.isRequired,
    neighborhood: PropTypes.string.isRequired,
    setNeighborhood: PropTypes.func.isRequired,
    city: PropTypes.string.isRequired,
    setCity: PropTypes.func.isRequired,
    stateUF: PropTypes.string.isRequired,
    setStateUF: PropTypes.func.isRequired,
};

UserProfileForm.defaultProps = {
    documentFile: null,
    showForm: true,
    isDocumentValidating: false,
    validationError: null,
    documentValidationResult: null,
    stateUF: '',
};
export default UserProfileForm;