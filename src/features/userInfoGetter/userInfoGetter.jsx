import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Container from "../../components/container/Container";
import Input from "../../components/input/Input";
import Button from '../../components/button/Button';
import Text from "../../components/text/Text";
import Title from "../../components/title/Title";
import UserProfileForm from "../userProfileForm/userProfileForm";
import UserInterestForm from "../userInterestForm/userInterestForm";
import { validateEmail, validateCpf, validateBirthDate, validateCep } from '../../../utils/validation';
import { VALIDATION_API_URL, parseAnalysis } from '../../../utils/userInfoGetter.utils';

const MotionContainer = motion(Container);
const MotionInput = motion(Input);
const MotionButton = motion(Button);

const introTextVariants = {
  visible: {
    opacity: 1,
    height: "auto",
    marginBottom: "1rem",
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
    overflow: "hidden",
  },
  hidden: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    scale: 0.95,
    transition: { duration: 0.3, ease: "easeOut" },
    transitionEnd: { display: "none" }, overflow: "hidden",
  },
};

const welcomeTextVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    height: 0,
    marginBottom: 0,
    overflow: "hidden"
  },
  visible: {
    opacity: 1,
    scale: 1,
    height: "auto",
    marginBottom: "1rem",
    transition: { duration: 0.4, ease: "easeOut", delay: 0.2 },
    overflow: "visible",
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.3, ease: "easeIn" },
    overflow: "hidden",
    transitionEnd: { display: "none" }
  },
};

const containerVariants = {
  initial: {
    paddingTop: "1rem",
    paddingBottom: "1rem",
    width: "85%",
    transition: { duration: 0.4, ease: "easeOut" }
  },
  submitted: {
    paddingTop: "1rem",
    paddingBottom: "1rem",
    width: "85%",
    transition: { duration: 0.4, ease: "easeOut", delay: 0.1 }
  },
  welcome: {
    paddingTop: "1rem",
    paddingBottom: "1rem",
    width: "85%",
    transition: { duration: 0.4, ease: "easeOut", delay: 0.1 }
  },
  form: {
    paddingTop: "0.3rem",
    paddingBottom: "1rem",
    width: "95%",
    transition: { duration: 0.4, ease: "easeOut", delay: 0.1 }
  },
  userProfileDisplay: {
    paddingTop: "0.3rem",
    paddingBottom: "1rem",
    width: "95%",
    transition: { duration: 0.4, ease: "easeOut", delay: 0.1 }
  }
};

const inputButtonVariants = {
  inputVisible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeIn' }
  },
  buttonHidden: {
    opacity: 0, y: 10,
    scale: 0.95
  },
  buttonVisible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, delay: 0.1, ease: 'easeOut' }
  },
  buttonExit: {
    opacity: 0,
    y: 10,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

const buttonTextVariants = {
  hidden: {
    opacity: 0,
    y: 5
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut', delay: 0.1 }
  }
};

const InitialUsernamePrompt = ({ variants }) => (
  <motion.div
    key="introText"
    variants={variants}
    initial="visible"
    exit="hidden"
    style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
  >
    <Text $mobileFontSize="2rem" $tabletFontSize="2rem" $fontSize="1.4rem" $align="center">
      Aqui, a força da torcida FURIA se encontra. Faça parte de uma comunidade ainda mais unida e conectada conosco.
    </Text>
    <Text $mobileFontSize="2rem" $tabletFontSize="2rem" $fontSize="1.5rem" $align="center">
      Para começar, insira seu nome de usuário
    </Text>
  </motion.div>
);

// Component for the welcome message
const WelcomeMessage = ({ username, variants }) => (
  <motion.div
    key="welcomeText"
    variants={variants}
    initial="hidden"
    animate="visible"
    exit="exit"
    style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
  >
    <Text $tabletFontSize="2rem" $fontSize="1.5rem" $align="center">
      Bem-vindo(a), {username ? username.toUpperCase() : ''}!
    </Text>
    <Text $tabletFontSize="2rem" $fontSize="1.5rem" $align="center">
      Preparado pra se tornar um Furioso?
    </Text>
  </motion.div>
);

const ActionArea = ({
  step,
  localValue,
  handleChange,
  handleKeyDown,
  handleContinueClick,
  handleFormSubmit,
  handleInterestFormSubmit,
  canSubmitProfile,
  canSubmitInterest,
  isDocumentValidating
}) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === 'interestForm' ? (
        <MotionButton
          layout
          key="submitInterestButton"
          variants={inputButtonVariants}
          initial="buttonHidden"
          animate="buttonVisible"
          exit="buttonExit"
          $padding="0.5rem 2rem"
          $margin="1rem 0 0 0"
          $fontSize="1.5rem"
          $fullWidth
          onClick={handleInterestFormSubmit}
          disabled={!canSubmitInterest}
          title={!canSubmitInterest ? "Preencha todos os campos obrigatórios" : "Enviar interesses"}
        >
          <motion.span variants={buttonTextVariants} initial="hidden" animate="visible" exit="hidden" style={{ display: 'inline-block' }}>
            ENVIAR INTERESSES
          </motion.span>
        </MotionButton>
      ) : step === 'profileForm' ? (
        <MotionButton
          layout
          key="submitProfileButton"
          variants={inputButtonVariants}
          initial="buttonHidden"
          animate="buttonVisible"
          exit="buttonExit"
          $padding="0.5rem 2rem"
          $margin="1rem 0 0 0"
          $fontSize="1.5rem"
          $fullWidth
          onClick={handleFormSubmit}
          disabled={!canSubmitProfile || isDocumentValidating}
          title={!canSubmitProfile ? "Preencha todos os campos obrigatórios e selecione um documento" : (isDocumentValidating ? "Validando..." : "Enviar perfil e validar documento")}
        >
          <motion.span variants={buttonTextVariants} initial="hidden" animate="visible" exit="hidden" style={{ display: 'inline-block' }}>
            {isDocumentValidating ? "ENVIANDO/VALIDANDO..." : "ENVIAR PERFIL"}
          </motion.span>
        </MotionButton>
      ) : step === 'welcome' ? (
        <MotionButton
          layout
          key="confirmButton"
          variants={inputButtonVariants}
          initial="buttonHidden"
          animate="buttonVisible"
          exit="buttonExit"
          $padding="0.5rem 2rem"
          $fontSize="1.5rem"
          $fullWidth
          onClick={handleContinueClick}
        >
          <motion.span variants={buttonTextVariants} initial="hidden" animate="visible" exit="hidden" style={{ display: 'inline-block' }}>
            CONFIRMAR
          </motion.span>
        </MotionButton>
      ) : step === 'initial' ? (
        <MotionInput
          layout
          key="usernameInput"
          variants={inputButtonVariants}
          initial="inputVisible"
          animate="inputVisible"
          exit="exit"
          $fontSize="1.5rem"
          $padding="0.5rem 2rem"
          $textTransform="uppercase"
          $fullWidth
          $textAlign="center"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={"NOME DE USUÁRIO"}
          maxLength={16}
        />
      ) : null}
    </AnimatePresence>
  );
};

function UserInfoGetter() {
  const navigate = useNavigate();
  const [localValue, setLocalValue] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [showWelcomeText, setShowWelcomeText] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showInterestForm, setShowInterestForm] = useState(false);

  const [formEmail, setFormEmail] = useState("");
  const [formBirthDate, setFormBirthDate] = useState("");
  const [formDocumentFile, setFormDocumentFile] = useState(null);
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCpf, setFormCpf] = useState("");
  const [formCep, setFormCep] = useState("");
  const [formNeighborhood, setFormNeighborhood] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formStateUF, setFormStateUF] = useState("");
  const [formComplement, setFormComplement] = useState("");

  const [formGame, setFormGame] = useState("");
  const [formPlatform, setFormPlatform] = useState("");
  const [formEventName, setFormEventName] = useState("");
  const [formProduct, setFormProduct] = useState("");
  const [formFirstContact, setFormFirstContact] = useState("");
  const [formFavoritePlayer, setFormFavoritePlayer] = useState("");
  const [formTimeFollowing, setFormTimeFollowing] = useState("");
  const [formAttendedEvent, setFormAttendedEvent] = useState(null);
  const [formKnewFuria, setFormKnewFuria] = useState(null);

  const [isDocumentValidating, setIsDocumentValidating] = useState(false);
  const [documentValidationResult, setDocumentValidationResult] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);

  const isFormValid = () => {
    const nameValid = formName.trim() !== '';
    const emailValid = formEmail.trim() !== '' && validateEmail(formEmail);
    const birthDateValid = formBirthDate.trim() !== '' && validateBirthDate(formBirthDate);
    const cpfValid = formCpf.trim() !== '' && validateCpf(formCpf);
    const cepValid = formCep.trim() !== '' && validateCep(formCep);
    const addressValid = formAddress.trim() !== '';
    const neighborhoodValid = formNeighborhood.trim() !== '';
    const cityValid = formCity.trim() !== '';
    const stateUFValid = formStateUF.trim().length === 2;
    const documentValid = formDocumentFile !== null;

    return (
      nameValid &&
      emailValid &&
      birthDateValid &&
      cpfValid &&
      cepValid &&
      addressValid &&
      neighborhoodValid &&
      cityValid &&
      stateUFValid &&
      documentValid
    );
  };

  const canSubmit = isFormValid();

  const isInterestFormValid = () => {
    const knewFuriaSelected = formKnewFuria !== null;
    const attendedEventSelected = formAttendedEvent !== null;
    const gameEntered = formGame.trim() !== '';
    const platformEntered = formPlatform.trim() !== '';

    return knewFuriaSelected && attendedEventSelected && gameEntered && platformEntered;
  };
  const canSubmitInterest = isInterestFormValid();

  useEffect(() => {
    let welcomeTimer;
    if (nameSubmitted && !showForm) {
      welcomeTimer = setTimeout(() => {
        setShowWelcomeText(true);
      }, 350);
    } else if (!nameSubmitted) {
      setShowWelcomeText(false);
      setShowForm(false);
    }
    return () => clearTimeout(welcomeTimer);
  }, [nameSubmitted, showForm]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !nameSubmitted) {
      e.preventDefault();
      if (localValue.trim().length > 2) {
        setNameSubmitted(true);
      } else {
        console.log("Name must be longer than 2 characters.");
      }
    }
  };

  const handleContinueClick = () => {
    setShowWelcomeText(false);
    setTimeout(() => {
      setShowForm(true);
    }, 150);
  };

  const handleFormSubmit = async () => {
    console.log("Form submission attempt...");

    if (!formDocumentFile) {
      console.log("Submission failed: No document file provided.");
      const errorMsg = "Por favor, selecione um arquivo de documento para enviar.";
      setValidationError(errorMsg);
      alert(errorMsg);
      return;
    }

    console.log("File check passed, proceeding...");
    setDocumentValidationResult(null);
    setValidationError('');
    setComparisonResult(null);
    setIsDocumentValidating(true);

    console.log("Document file found, proceeding with submission.");
    setIsDocumentValidating(true);

    const formData = new FormData();
    formData.append('userName', localValue);
    formData.append('email', formEmail);
    formData.append('birthDate', formBirthDate);
    formData.append('name', formName);
    formData.append('address', formAddress);
    formData.append('cpf', formCpf);
    formData.append('cep', formCep);
    formData.append('neighborhood', formNeighborhood);
    formData.append('city', formCity);
    formData.append('stateUF', formStateUF);
    formData.append('complement', formComplement);
    formData.append('documentFile', formDocumentFile, formDocumentFile.name);


    try {
      console.log(`Sending data to backend: ${VALIDATION_API_URL}`);
      const response = await fetch(VALIDATION_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
          errorMsg = `Request failed with status ${response.status}. Could not read error details.`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.success && data.analysis) {
        console.log("Backend Validation Success. Raw Analysis:", data.analysis);
        setDocumentValidationResult(data.analysis);

        const { extractedName, extractedBirthDate, extractedCpf } = parseAnalysis(data.analysis);
        const normalizeString = (str) => str ? str.toLowerCase().trim() : null;
        const normalizeCpf = (cpfStr) => cpfStr ? String(cpfStr).replace(/\D/g, '') : null;
        const userNameNormalized = normalizeString(formName);
        const userCpfNormalized = normalizeCpf(formCpf);
        const userBirthDate = formBirthDate;
        const extractedNameNormalized = normalizeString(extractedName);
        const extractedCpfNormalized = normalizeCpf(extractedCpf);
        const extractedBirthDateFormatted = extractedBirthDate;
        let nameMatch = !!(userNameNormalized && extractedNameNormalized && userNameNormalized === extractedNameNormalized);
        let birthDateMatch = !!(userBirthDate && extractedBirthDateFormatted && userBirthDate === extractedBirthDateFormatted);
        let cpfMatch = !!(userCpfNormalized && extractedCpfNormalized && userCpfNormalized === extractedCpfNormalized);
        let cpfComparisonNote = "";

        if (userCpfNormalized && extractedCpfNormalized) {
          if (extractedCpfNormalized.length === 11) {
            cpfMatch = (userCpfNormalized === extractedCpfNormalized);
            cpfComparisonNote = cpfMatch ? " (11 dígitos conferem)" : " (11 dígitos divergem)";
          } else {
            cpfMatch = false;
            cpfComparisonNote = ` (Documento retornou ${extractedCpfNormalized.length} dígitos)`;
            console.warn(`Extracted CPF has ${extractedCpfNormalized.length} digits, expected 11. Comparison skipped.`);
          }
        } else if (userCpfNormalized && !extractedCpfNormalized) {
          cpfMatch = false;
          cpfComparisonNote = "(Não encontrado no documento)";
        }
        const comparison = {
          name: { user: formName || "N/A", doc: extractedName || "Não encontrado", match: nameMatch },
          birthDate: { user: formBirthDate || "N/A", doc: extractedBirthDateFormatted || "Não encontrada", match: birthDateMatch },
          cpf: { user: userCpfNormalized || "N/A", doc: extractedCpfNormalized || "Não encontrado", match: cpfMatch, note: cpfComparisonNote },
        };
        setComparisonResult(comparison);


        let alertMessage = "Validação do documento concluída.\n\n";
        alertMessage += `Nome: ${comparison.name.match ? '✅ Coincide' : '❌ Não coincide'} (Form: ${comparison.name.user} | Doc: ${comparison.name.doc})\n`;
        alertMessage += `Data Nasc.: ${comparison.birthDate.match ? '✅ Coincide' : '❌ Não coincide'} (Form: ${comparison.birthDate.user} | Doc: ${comparison.birthDate.doc})\n`;
        alertMessage += `CPF: ${comparison.cpf.match ? '✅ Coincide' : '❌ Não coincide'} (Form: ${comparison.cpf.user} | Doc: ${comparison.cpf.doc})\n`;

        if (nameMatch && birthDateMatch && cpfMatch) {
          alertMessage += "\n🎉 Todos os dados conferem! Salvando no localStorage...";

          const newId = crypto.randomUUID();

          const userProfileData = {
            id: newId,
            name: formName,
            email: formEmail,
            birthDate: formBirthDate,
            cpf: formCpf,
            cep: formCep,
            address: formAddress,
            neighborhood: formNeighborhood,
            city: formCity,
            stateUF: formStateUF,
            complement: formComplement,
            userName: localValue,
            documentValidated: true,
            savedTimestamp: new Date().toISOString()
          };

          try {
            const existingProfilesRaw = localStorage.getItem('userProfiles');
            let profiles = [];
            if (existingProfilesRaw) {
              try {
                profiles = JSON.parse(existingProfilesRaw);
                if (!Array.isArray(profiles)) profiles = [];
              } catch { profiles = []; }
            }

            profiles.push(userProfileData);

            localStorage.setItem('userProfiles', JSON.stringify(profiles));
            console.log("Profile saved successfully to localStorage.");
            alertMessage += "\n✅ Perfil salvo no localStorage!";
            console.log("Profiles in localStorage:", profiles);

            setShowForm(false);
            setShowInterestForm(true);

          } catch (storageError) {
            console.error("Error saving profile data to localStorage:", storageError);
            alertMessage += "\n❌ Erro ao salvar o perfil no localStorage.";
          }

        } else {
          alertMessage += "\n⚠️ Atenção: Alguns dados não conferem com o documento. Perfil NÃO salvo.";
          console.log("Validation successful but data mismatch. Profile not saved.");
        }

        alert(alertMessage);


      } else {
        console.error("Backend reported an error or missing analysis:", data.error);
        const errorMsg = data.error || 'Erro desconhecido na validação do backend.';
        setValidationError(errorMsg);
        setComparisonResult(null);
        alert(`Erro na validação: ${errorMsg}`);
      }

    } catch (error) {
      console.error("Error during form submission or validation API call:", error);
      const errorMsg = `Erro ao comunicar com o servidor: ${error.message}`;
      setValidationError(errorMsg);
      setDocumentValidationResult(null);
      setComparisonResult(null);
      alert(errorMsg);
    } finally {
      setIsDocumentValidating(false);
    }

    console.log("Form submission processing complete.");
  };

  const handleInterestFormSubmit = () => {
    console.log("Submitting interest form data...");

    if (!canSubmitInterest) {
      alert("Por favor, preencha todas as perguntas obrigatórias do formulário de interesses.");
      return;
    }

    const interestData = {
      game: formGame,
      platform: formPlatform,
      knewFuria: formKnewFuria,
      attendedEvent: formAttendedEvent,
      eventName: formAttendedEvent ? formEventName : '',
      product: formProduct,
      firstContact: formFirstContact,
      favoritePlayer: formFavoritePlayer,
      timeFollowing: formTimeFollowing,
      submittedTimestamp: new Date().toISOString()
    };

    try {
      const existingProfilesRaw = localStorage.getItem('userProfiles');
      let profiles = [];
      if (existingProfilesRaw) {
        try {
          profiles = JSON.parse(existingProfilesRaw);
          if (!Array.isArray(profiles)) profiles = [];
        } catch { profiles = []; }
      }

      if (profiles.length > 0) {
        const latestProfileIndex = profiles.findIndex(p => p.userName === localValue && p.documentValidated);
        if (latestProfileIndex !== -1) {
          profiles[latestProfileIndex].interests = interestData;
          localStorage.setItem('userProfiles', JSON.stringify(profiles));
          console.log("Interest data added to profile in localStorage.");
          alert("✅ Dados de interesse salvos com sucesso! Redirecionando para o perfil...");

          const updatedProfile = profiles[latestProfileIndex];
          navigate('/profile', { state: { userProfile: updatedProfile } });

        } else {
          console.error("Could not find the recently saved profile to add interests.");
          alert("❌ Erro: Não foi possível encontrar o perfil salvo para adicionar os interesses.");
        }

      } else {
        console.error("No profiles found in localStorage to add interests to.");
        alert("❌ Erro: Nenhum perfil encontrado para adicionar os interesses.");
      }

    } catch (storageError) {
      console.error("Error updating profile with interest data in localStorage:", storageError);
      alert("❌ Erro ao salvar os dados de interesse.");
    }
    console.log("Interest Data to be saved/sent:", interestData);
  };

  const getContainerAnimationState = () => {
    if (showInterestForm) return "form";
    if (showForm) return "form";
    if (showWelcomeText) return "welcome";
    if (nameSubmitted) return "submitted";
    return "initial";
  };

  return (
    <Container
      $flex
      $flexDirection="column"
      $justifyContent="center"
      $alignItems="center"
      $width="100%"
      $margin="0"
      $tabletMargin="2rem 0 0 0"
    >
      <Title
        $display="block"
        $align="center"
        $fontSize="4rem"
        $tabletFontSize="3rem"
        style={{ marginBottom: '0.2rem' }}
      >
        Know Your Fan
      </Title>

      <MotionContainer
        layout
        variants={containerVariants}
        initial="initial"
        animate={getContainerAnimationState()}
        $height="auto"
        $flex
        $flexDirection="column"
        $alignItems="center"
        $justifyContent="flex-start"
        $bgColor="var(--primary-color)"
        $border="2px solid var(--secondary-color)"
        $radius="20px"
        $boxShadow="5px 5px 0 var(--secondary-color)"
        style={{ overflow: 'hidden', minHeight: '150px' }}
      >
        <Container
          $width="90%"
          $display="flex"
          $flexDirection="column"
          $alignItems="center"
          $position="relative"
          $marginBottom="0"
        >
          <AnimatePresence mode="wait">
            {!nameSubmitted && !showWelcomeText && !showForm && !showInterestForm && (
              <motion.div
                key="introText"
                variants={introTextVariants}
                initial="visible"
                exit="hidden"
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
              >
                <Text $mobileFontSize="2rem" $tabletFontSize="2rem" $fontSize="1.4rem" $align="center">
                  Aqui, a força da torcida FURIA se encontra. Faça parte de uma comunidade ainda mais unida e conectada conosco.
                </Text>
                <Text $mobileFontSize="2rem" $tabletFontSize="2rem" $fontSize="1.5rem" $align="center">
                  Para começar, insira seu nome de usuário
                </Text>
              </motion.div>

            )}

            {showWelcomeText && !showForm && !showInterestForm && (
              <motion.div
                key="welcomeText"
                variants={welcomeTextVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
              >
                <Text $tabletFontSize="2rem" $fontSize="1.5rem" $align="center">
                  Bem-vindo(a), {localValue.toUpperCase()}!
                </Text>
                <Text $tabletFontSize="2rem" $fontSize="1.5rem" $align="center">
                  Preparado pra se tornar um Furioso?
                </Text>
              </motion.div>
            )}
            {showForm && !showInterestForm && (
              <UserProfileForm
                name={formName}
                setName={setFormName}
                address={formAddress}
                setAddress={setFormAddress}
                cep={formCep}
                setCep={setFormCep}
                neighborhood={formNeighborhood}
                setNeighborhood={setFormNeighborhood}
                city={formCity}
                setCity={setFormCity}
                cpf={formCpf}
                setCpf={setFormCpf}
                email={formEmail}
                setEmail={setFormEmail}
                birthDate={formBirthDate}
                setBirthDate={setFormBirthDate}
                documentFile={formDocumentFile}
                setDocumentFile={setFormDocumentFile}
                isDocumentValidating={isDocumentValidating}
                documentValidationResult={documentValidationResult}
                validationError={validationError}
                comparisonResult={comparisonResult}
                showForm={showForm}
                stateUF={formStateUF}
                setStateUF={setFormStateUF}
                complement={formComplement}
                setComplement={setFormComplement}
              />
            )}
            {showInterestForm && (
              <UserInterestForm
                game={formGame}
                setGame={setFormGame}
                platform={formPlatform}
                setPlatform={setFormPlatform}
                eventName={formEventName}
                setEventName={setFormEventName}
                product={formProduct}
                setProduct={setFormProduct}
                firstContact={formFirstContact}
                setFirstContact={setFormFirstContact}
                favoritePlayer={formFavoritePlayer}
                setFavoritePlayer={setFormFavoritePlayer}
                timeFollowing={formTimeFollowing}
                setTimeFollowing={setFormTimeFollowing}
                attendedEvent={formAttendedEvent}
                setAttendedEvent={setFormAttendedEvent}
                knewFuria={formKnewFuria}
                setKnewFuria={setFormKnewFuria}
              />
            )}
          </AnimatePresence>
        </Container>

        <div style={{ width: '90%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60px', marginTop: 'auto', paddingBottom: '1rem' }}>
          <AnimatePresence mode="wait" initial={false}>
            {showInterestForm ? (
              <MotionButton
                layout
                key="submitButton"
                variants={inputButtonVariants}
                initial="buttonHidden"
                animate="buttonVisible"
                exit="buttonExit"
                $padding="0.5rem 2rem"
                $margin="1rem 0 0 0"
                $fontSize="1.5rem"
                $fullWidth
                onClick={handleInterestFormSubmit}
                disabled={!canSubmitInterest}
                title={!canSubmitInterest ? "Preencha todos os campos obrigatórios" : "Enviar interesses"}
              >
                <motion.span variants={buttonTextVariants} initial="hidden" animate="visible" exit="hidden" style={{ display: 'inline-block' }}>
                  ENVIAR
                </motion.span>
              </MotionButton>
            ) : showForm ? (
              <MotionButton
                layout
                key="submitButton"
                variants={inputButtonVariants}
                initial="buttonHidden"
                animate="buttonVisible"
                exit="buttonExit"
                $padding="0.5rem 2rem"
                $margin="1rem 0 0 0"
                $fontSize="1.5rem"
                $fullWidth
                onClick={handleFormSubmit}
                disabled={!canSubmit || isDocumentValidating}
                title={!canSubmit ? "Preencha todos os campos obrigatórios e selecione um documento" : (isDocumentValidating ? "Validando..." : "Enviar perfil e validar documento")}
              >
                <motion.span variants={buttonTextVariants} initial="hidden" animate="visible" exit="hidden" style={{ display: 'inline-block' }}>
                  {isDocumentValidating ? "ENVIANDO/VALIDANDO..." : "ENVIAR"}
                </motion.span>
              </MotionButton>

            ) : showWelcomeText ? (
              <MotionButton
                layout
                key="confirmButton"
                variants={inputButtonVariants}
                initial="buttonHidden"
                animate="buttonVisible"
                exit="buttonExit"
                $padding="0.5rem 2rem"
                $fontSize="1.5rem"
                $fullWidth
                onClick={handleContinueClick}
              >
                <motion.span variants={buttonTextVariants} initial="hidden" animate="visible" exit="hidden" style={{ display: 'inline-block' }}>
                  CONFIRMAR
                </motion.span>
              </MotionButton>
            ) : !nameSubmitted ? (
              <MotionInput
                layout
                key="usernameInput"
                variants={inputButtonVariants}
                initial="inputVisible"
                animate="inputVisible"
                exit="exit"
                $fontSize="1.5rem"
                $padding="0.5rem 2rem"
                $textTransform="uppercase"
                $fullWidth
                $textAlign="center"
                value={localValue} onChange={handleChange} onKeyDown={handleKeyDown} placeholder={"NOME DE USUÁRIO"} maxLength={16}
              />
            ) : null}
          </AnimatePresence>

          {validationError && showForm && !isDocumentValidating && (
            <Text $color="var(--danger-color, red)" $fontSize="0.9rem" $margin="0.5rem 0 0 0" $align="center">
              Erro: {validationError}
            </Text>
          )}
        </div>
      </MotionContainer>
    </Container>
  );
}

export default UserInfoGetter;