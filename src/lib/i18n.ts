
export type Language = 'en' | 'es' | 'zh' | 'hi' | 'fr' | 'ar' | 'bn' | 'ru' | 'pt' | 'id';

export const supportedLanguages: Language[] = ['en', 'es', 'zh', 'hi', 'fr', 'ar', 'bn', 'ru', 'pt', 'id'];

const translationsData = {
  en: {
    mainTitle: 'Strawberry Wallet',
    mainDescription: 'Your private, self-custody wallet for the Scroll Network on Telegram.',
    createWalletButton: 'Create New Wallet',
    importWalletButton: 'Import Wallet',
    testnetDisclaimer: 'Transactions are on the Sepolia Testnet.',
    createWalletTitle: 'Create Your Wallet',
    createWalletDesc: 'Write down your secret phrase and store it securely. This is the only way to recover your wallet.',
    seedBackupConfirmation: 'I have written down and securely stored my secret phrase. I understand it is the only way to recover my wallet.',
    cancelButton: 'Cancel',
    continueButton: 'Continue',
    confirmPhraseTitle: 'Confirm Your Phrase',
    confirmPhraseDesc: 'To ensure you saved it correctly, please enter the following words from your phrase.',
    enterWordLabel: (n: number) => `Enter word #${n}`,
    backButton: 'Back',
    confirmAndCreateButton: 'Confirm & Create',
    importWalletTitle: 'Import Wallet',
    importWalletDesc: 'Enter your secret phrase to restore your wallet.',
    securityWarningTitle: 'Security Warning',
    securityWarningDesc: 'Never share your secret phrase. Anyone with it can take control of your assets.',
    seedPhraseLengthLabel: 'Seed Phrase Length',
    secretPhraseWordsLabel: 'Secret Phrase Words',
    pasteDisclaimer: 'You can paste your entire seed phrase into any field.',
    importButton: 'Import',
    incorrectWordError: 'Incorrect word',
    walletCreatedTitle: 'Wallet Created!',
    walletCreatedDesc: 'Your new wallet is ready.',
    invalidInputTitle: 'Invalid Input',
    invalidInputDesc: 'Seed phrase can only contain letters and spaces.',
    invalidPasteTitle: 'Invalid Paste',
    invalidPasteDesc: (len: number) => `Seed phrase must be 12, 15, 18, or 24 words. You pasted ${len}.`,
    walletImportedTitle: 'Wallet Imported',
    walletImportedDesc: 'Your wallet has been successfully imported.',
    importErrorTitle: 'Import Error',
    importErrorDesc: 'Could not import wallet. Please check your seed phrase.',
    copiedToClipboardTitle: 'Copied to clipboard!',
    copiedToClipboardDesc: 'Your seed phrase has been copied.',
    secretPhraseTitle: 'Your Secret Phrase',
    secretPhraseDesc: 'Write this down and store it somewhere safe. This is the only time you will see it.',
    neverShareWarning: 'NEVER share this phrase with anyone. Anyone with this phrase can take your assets forever.',
    dashboardTitle: 'Wallet Dashboard',
    disconnectButton: 'Disconnect',
    dashboardDesc: 'Send private transactions on the Sepolia testnet.',
    yourWalletAddressLabel: 'Your Wallet Address',
    totalBalanceLabel: 'Total Balance',
    assetsTitle: 'Your Assets',
    hideZeroBalancesLabel: 'Hide Zero Balances',
    assetLabel: 'Asset',
    priceLabel: 'Price',
    balanceLabel: 'Balance',
    copyAddressButton: 'Copy Address',
    receiveFundsTitle: 'Receive Funds',
    sendTxTitle: 'Send Transaction',
    destinationAddressLabel: 'Destination Address or ENS Name',
    amountLabel: 'Amount',
    maxAmountLabel: 'Max',
    sendPrivatelyButton: 'Send Privately',
    sendingButton: 'Sending...',
    calculatingGas: 'Calculating gas...',
    estGasFee: 'Est. Gas Fee',
    averageFee: 'Average Fee',
    resolvingEns: 'Resolving ENS name...',
    ensResolutionError: 'Could not resolve ENS name.',
    invalidNumberError: 'Invalid number.',
    negativeAmountError: 'Amount cannot be negative.',
    insufficientTokenBalanceError: (token: string) => `Insufficient ${token} balance.`,
    insufficientGasError: 'Insufficient ETH balance for gas fees.',
    addressCopiedTitle: 'Address Copied!',
    addressCopiedDesc: 'Your wallet address is in the clipboard.',
    invalidInfoTitle: 'Invalid Information',
    invalidInfoDesc: 'Please correct the errors before sending.',
    invalidAddressTitle: 'Invalid Address',
    invalidAddressDesc: 'Please enter a valid Ethereum address or a valid ENS name.',
    txFailedTitle: 'Transaction Failed',
    error: 'Error',
    highGasWarningTitle: 'High Gas Fee Warning',
    highGasWarningDesc: 'The estimated gas fee for this transaction is higher than average right now. Are you sure you want to proceed?',
    currentFee: 'Current Fee',
    sendAnywayButton: 'Send Anyway',
    getNotifiedTitle: 'Get Notified?',
    getNotifiedDesc: 'Would you like to receive a push notification when the gas fee for this transaction is lower?',
    noThanksButton: 'No, thanks',
    yesNotifyMeButton: 'Yes, notify me',
    gasAlertSetTitle: 'Gas Alert Set!',
    gasAlertSetDesc: (amount: string, ticker: string, address: string) => `We'll notify you when it's cheaper to send ${amount} ${ticker} to ${address.slice(0, 6)}...`,
    txSentTitle: 'Transaction Sent',
    txSentDesc: 'Your private transaction has been confirmed on Sepolia.',
    txHashLabel: 'L1 Transaction Hash',
    toLabel: 'To',
    blockNumberLabel: 'L1 Settlement Block',
    viewOnEtherscanButton: 'View on Etherscan',
    backToWalletButton: 'Back to Wallet',
    shareButton: 'Share',
    shareTxTitle: 'My Transaction',
    shareTxText: (txHash: string) => `Check out my transaction on Sepolia Etherscan! Hash: ${txHash}`,
    shareUnsupportedDesc: "Your browser doesn't support sharing. Link copied to clipboard instead.",
    shareFailedDesc: "Sharing failed. Please try again.",
    copied: 'Copied!',
    copiedDesc: (label: string) => `${label} has been copied to clipboard.`,
    linkCopied: 'Link Copied!',

    // Password fields
    setPasswordTitle: 'Set a Password',
    setPasswordDesc: 'This password will be used to unlock your wallet on this device.',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm Password',
    finishSetupButton: 'Finish Setup',
    passwordTooShort: 'Password must be at least 8 characters long.',
    passwordsDoNotMatch: 'Passwords do not match.',
    passwordDoesNotMeetRequirements: 'Password does not meet all requirements.',
    
    // Password requirements
    reqLength: '8+ characters',
    reqUppercase: '1 uppercase',
    reqLowercase: '1 lowercase',
    reqNumber: '1 number',
    reqSpecial: '1 special char',
    reqNotCommon: 'Not a common password',
    
    // Lock screen fields
    unlockWalletTitle: 'Unlock Your Wallet',
    unlockWalletDesc: 'Enter your password to access your Strawberry Wallet.',
    unlockButton: 'Unlock',
    unlockingButton: 'Unlocking...',
    wrongPasswordError: 'Wrong password. Please try again.',
    forgotPasswordLink: 'Forgot password?',
    
    // Password Recovery
    recoverWalletTitle: 'Recover Wallet',
    recoverWalletDesc: 'To reset your password, you must verify ownership by entering your full secret phrase.',
    recoverWalletWarning: 'This is the only way to regain access. Do not enter this if someone asked you to.',
    verifyButton: 'Verify',
    enterAllWords: 'Please enter all words of your seed phrase.',
    seedPhraseMismatch: "The secret phrase does not match the stored wallet. Please check and try again.",
    setNewPasswordDesc: 'Create a new, strong password for your wallet.',
    newPasswordLabel: 'New Password',
    confirmNewPasswordLabel: 'Confirm New Password',
    resetPasswordButton: 'Reset Password',
    passwordResetSuccessTitle: 'Password Reset!',
    passwordResetSuccessDesc: 'You can now use your new password.',
    
    // QR Scanner
    scanQrTitle: 'Scan QR Code',
    scanQrDesc: 'Point your camera at a QR code to scan an address.',
    cameraPermissionTitle: 'Camera Access Required',
    cameraPermissionDesc: 'Please allow camera access in your browser to use the QR scanner.',
    addressScannedTitle: 'Address Scanned',
    addressScannedDesc: 'The destination address has been filled in.',
    invalidQrTitle: 'Invalid QR Code',
    invalidQrDesc: 'The scanned QR code does not contain a valid Ethereum address.',
    scanning: 'Scanning...',
    loadingCamera: 'Loading camera...',

    // Send Flow
    selectAssetLabel: 'Select asset',
    tokenPortalInfo: 'This token is sent via a secure Aztec Portal. This bundles your transaction with others for privacy. The details on Etherscan reflect the L1 settlement of this bundle.',
    searchAssetPlaceholder: 'Search for an asset...',
    noAssetFound: 'No asset found.',
    
    // Generic UI
    closeButtonLabel: "Close",
    submitRatingButton: "Submit Rating",

    // Feedback Surveys
    feedback: {
        anonymousDisclaimer: "Your response is anonymous and used only to improve the app.",

        // Receive Funds
        receiveFlowEaseTitle: "🎉 You received your first transfer!",
        receiveFlowEaseQuestion: "How easy was it to receive it?",
        
        // Send First Transaction
        sendFlowFeelingTitle: "💸 Your transaction is on its way!",
        sendFlowFeelingQuestion: "How did you feel about the sending process?",

        // Seed Confirmation
        seedClarityTitle: "🔐 One last step",
        seedClarityQuestion: "You just confirmed your security phrase. Was this step clear?",
        
        // Overall CSAT
        overallCsatTitle: "🍓 You've used Violet Vault a few times.",
        overallCsatQuestion: "How would you rate your overall experience?",

        // Options
        options: {
            // receive_flow_ease
            receiveFlowEase: [
                { value: 'super_facil', labelKey: 'super_easy' },
                { value: 'bien_mejorable', labelKey: 'good_improvable' },
                { value: 'dificil', labelKey: 'difficult' },
            ],
            // send_flow_feeling
            sendFlowFeeling: [
                { value: 'claro_confiado', labelKey: 'clear_confident' },
                { value: 'dude_en_algunos_pasos', labelKey: 'had_doubts' },
                { value: 'confuso', labelKey: 'confusing' },
            ],
            // seed_clarity
            seedClarity: [
                { value: 'muy_claro', labelKey: 'very_clear' },
                { value: 'entendi_pero_dificil', labelKey: 'understood_but_difficult' },
                { value: 'no_entendi_bien', labelKey: 'did_not_understand_well' },
            ],

            // Option labels
            super_easy: "Super easy",
            good_improvable: "Good, but improvable",
            difficult: "It was difficult",
            clear_confident: "Clear and confident",

            had_doubts: "I had doubts on some steps",
            confusing: "It was confusing",
            very_clear: "Yes, very clear",
            understood_but_difficult: "I understood, but it was difficult",
            did_not_understand_well: "I did not understand it well"
        }
    }
  },
  es: {
    mainTitle: 'Strawberry Wallet',
    mainDescription: 'Tu billetera privada y de autocustodia para la red Scroll en Telegram.',
    createWalletButton: 'Crear Nueva Billetera',
    importWalletButton: 'Importar Billetera',
    testnetDisclaimer: 'Las transacciones se realizan en la Testnet de Sepolia.',
    createWalletTitle: 'Crea Tu Billetera',
    createWalletDesc: 'Anota tu frase secreta y guárdala en un lugar seguro. Esta es la única forma de recuperar tu billetera.',
    seedBackupConfirmation: 'He anotado y guardado de forma segura mi frase secreta. Entiendo que es la única forma de recuperar mi billetera.',
    cancelButton: 'Cancelar',
    continueButton: 'Continuar',
    confirmPhraseTitle: 'Confirma Tu Frase',
    confirmPhraseDesc: 'Para asegurarte de que la guardaste correctamente, por favor ingresa las siguientes palabras de tu frase.',
    enterWordLabel: (n: number) => `Ingresa la palabra #${n}`,
    backButton: 'Volver',
    confirmAndCreateButton: 'Confirmar y Crear',
    importWalletTitle: 'Importar Billetera',
    importWalletDesc: 'Ingresa tu frase secreta para restaurar tu billetera.',
    securityWarningTitle: 'Advertencia de Seguridad',
    securityWarningDesc: 'Nunca compartas tu frase secreta. Cualquiera con ella puede tomar control de tus activos.',
    seedPhraseLengthLabel: 'Longitud de la Frase Semilla',
    secretPhraseWordsLabel: 'Palabras de la Frase Secreta',
    pasteDisclaimer: 'Puedes pegar tu frase semilla completa en cualquier campo.',
    importButton: 'Importar',
    incorrectWordError: 'Palabra incorrecta',
    walletCreatedTitle: '¡Billetera Creada!',
    walletCreatedDesc: 'Tu nueva billetera está lista.',
    invalidInputTitle: 'Entrada Inválida',
    invalidInputDesc: 'La frase semilla solo puede contener letras y espacios.',
    invalidPasteTitle: 'Pegado Inválido',
    invalidPasteDesc: (len: number) => `La frase semilla debe ser de 12, 15, 18 o 24 palabras. Pegaste ${len}.`,
    walletImportedTitle: 'Billetera Importada',
    walletImportedDesc: 'Tu billetera ha sido importada exitosamente.',
    importErrorTitle: 'Error de Importación',
    importErrorDesc: 'No se pudo importar la billetera. Por favor, revisa tu frase semilla.',
    copiedToClipboardTitle: '¡Copiado al portapapeles!',
    copiedToClipboardDesc: 'Tu frase semilla ha sido copiada.',
    secretPhraseTitle: 'Tu Frase Secreta',
    secretPhraseDesc: 'Escribe esto y guárdalo en un lugar seguro. Esta es la única vez que la verás.',
    neverShareWarning: 'NUNCA compartas esta frase con nadie. Cualquiera con esta frase puede tomar tus activos para siempre.',
    dashboardTitle: 'Panel de la Billetera',
    disconnectButton: 'Desconectar',
    dashboardDesc: 'Envía transacciones privadas en la testnet de Sepolia.',
    yourWalletAddressLabel: 'Dirección de tu Billetera',
    totalBalanceLabel: 'Balance Total',
    assetsTitle: 'Tus Activos',
    hideZeroBalancesLabel: 'Ocultar Balances en Cero',
    assetLabel: 'Activo',
    priceLabel: 'Precio',
    balanceLabel: 'Balance',
    copyAddressButton: 'Copiar Dirección',
    receiveFundsTitle: 'Recibir Fondos',
    sendTxTitle: 'Enviar Transacción',
    destinationAddressLabel: 'Dirección de Destino o Nombre ENS',
    amountLabel: 'Cantidad',
    maxAmountLabel: 'Máx',
    sendPrivatelyButton: 'Enviar Privadamente',
    sendingButton: 'Enviando...',
    calculatingGas: 'Calculando gas...',
    estGasFee: 'Tarifa de Gas Est.',
    averageFee: 'Tarifa Promedio',
    resolvingEns: 'Resolviendo nombre ENS...',
    ensResolutionError: 'No se pudo resolver el nombre ENS.',
    invalidNumberError: 'Número inválido.',
    negativeAmountError: 'La cantidad no puede ser negativa.',
    insufficientTokenBalanceError: (token: string) => `Saldo de ${token} insuficiente.`,
    insufficientGasError: 'Saldo de ETH insuficiente para las tarifas de gas.',
    addressCopiedTitle: '¡Dirección Copiada!',
    addressCopiedDesc: 'La dirección de tu billetera está en el portapapeles.',
    invalidInfoTitle: 'Información Inválida',
    invalidInfoDesc: 'Por favor corrige los errores antes de enviar.',
    invalidAddressTitle: 'Dirección Inválida',
    invalidAddressDesc: 'Por favor ingresa una dirección de Ethereum válida o un nombre ENS válido.',
    txFailedTitle: 'Transacción Fallida',
    error: 'Error',
    highGasWarningTitle: 'Advertencia de Tarifa de Gas Alta',
    highGasWarningDesc: 'La tarifa de gas estimada para esta transacción es más alta que el promedio en este momento. ¿Estás seguro de que quieres continuar?',
    currentFee: 'Tarifa Actual',
    sendAnywayButton: 'Enviar de Todos Modos',
    getNotifiedTitle: '¿Recibir Notificación?',
    getNotifiedDesc: '¿Te gustaría recibir una notificación push cuando la tarifa de gas para esta transacción sea más baja?',
    noThanksButton: 'No, gracias',
    yesNotifyMeButton: 'Sí, notifícame',
    gasAlertSetTitle: '¡Alerta de Gas Configurada!',
    gasAlertSetDesc: (amount: string, ticker: string, address: string) => `Te notificaremos cuando sea más barato enviar ${amount} ${ticker} a ${address.slice(0, 6)}...`,
    txSentTitle: 'Transacción Enviada',
    txSentDesc: 'Tu transacción privada ha sido confirmada en Sepolia.',
    txHashLabel: 'Hash de Transacción L1',
    toLabel: 'Para',
    blockNumberLabel: 'Bloque de Liquidación L1',
    viewOnEtherscanButton: 'Ver en Etherscan',
    backToWalletButton: 'Volver a la Billetera',
    shareButton: 'Compartir',
    shareTxTitle: 'Mi Transacción',
    shareTxText: (txHash: string) => `¡Mira mi transacción en Sepolia Etherscan! Hash: ${txHash}`,
    shareUnsupportedDesc: "Tu navegador no soporta la función de compartir. El enlace se ha copiado al portapapeles.",
    shareFailedDesc: "Error al compartir. Por favor, inténtalo de nuevo.",
    copied: '¡Copiado!',
    copiedDesc: (label: string) => `${label} ha sido copiado al portapapeles.`,
    linkCopied: '¡Enlace copiado!',
    
    // Password fields
    setPasswordTitle: 'Establecer una Contraseña',
    setPasswordDesc: 'Esta contraseña se usará para desbloquear tu billetera en este dispositivo.',
    passwordLabel: 'Contraseña',
    confirmPasswordLabel: 'Confirmar Contraseña',
    finishSetupButton: 'Finalizar Configuración',
    passwordTooShort: 'La contraseña debe tener al menos 8 caracteres.',
    passwordsDoNotMatch: 'Las contraseñas no coinciden.',
    passwordDoesNotMeetRequirements: 'La contraseña no cumple con todos los requisitos.',

    // Password requirements
    reqLength: '8+ caracteres',
    reqUppercase: '1 mayúscula',
    reqLowercase: '1 minúscula',
    reqNumber: '1 número',
    reqSpecial: '1 carácter especial',
    reqNotCommon: 'No ser una contraseña común',

    // Lock screen fields
    unlockWalletTitle: 'Desbloquear tu Billetera',
    unlockWalletDesc: 'Ingresa tu contraseña para acceder a tu Strawberry Wallet.',
    unlockButton: 'Desbloquear',
    unlockingButton: 'Desbloqueando...',
    wrongPasswordError: 'Contraseña incorrecta. Por favor, inténtalo de nuevo.',
    forgotPasswordLink: '¿Olvidaste tu contraseña?',

    // Password Recovery
    recoverWalletTitle: 'Recuperar Billetera',
    recoverWalletDesc: 'Para restablecer tu contraseña, debes verificar la propiedad introduciendo tu frase secreta completa.',
    recoverWalletWarning: 'Esta es la única forma de recuperar el acceso. No introduzcas esto si alguien te lo pidió.',
    verifyButton: 'Verificar',
    enterAllWords: 'Por favor, introduce todas las palabras de tu frase semilla.',
    seedPhraseMismatch: "La frase secreta no coincide con la billetera almacenada. Por favor, comprueba e inténtalo de nuevo.",
    setNewPasswordDesc: 'Crea una contraseña nueva y segura para tu billetera.',
    newPasswordLabel: 'Nueva Contraseña',
    confirmNewPasswordLabel: 'Confirmar Nueva Contraseña',
    resetPasswordButton: 'Restablecer Contraseña',
    passwordResetSuccessTitle: '¡Contraseña Restablecida!',
    passwordResetSuccessDesc: 'Ahora puedes usar tu nueva contraseña.',
    
    // QR Scanner
    scanQrTitle: 'Escanear código QR',
    scanQrDesc: 'Apunta tu cámara a un código QR para escanear una dirección.',
    cameraPermissionTitle: 'Se requiere acceso a la cámara',
    cameraPermissionDesc: 'Por favor, permite el acceso a la cámara en tu navegador para usar el escáner de QR.',
    addressScannedTitle: 'Dirección Escaneada',
    addressScannedDesc: 'La dirección de destino ha sido rellenada.',
    invalidQrTitle: 'Código QR inválido',
    invalidQrDesc: 'El código QR escaneado no contiene una dirección de Ethereum válida.',
    scanning: 'Escaneando...',
    loadingCamera: 'Cargando cámara...',

    // Send Flow
    selectAssetLabel: 'Seleccionar activo',
    tokenPortalInfo: 'Este token se envía a través de un Portal de Aztec seguro. Esto agrupa tu transacción con otras para mayor privacidad. Los detalles en Etherscan reflejan la liquidación L1 de este paquete.',
    searchAssetPlaceholder: 'Buscar un activo...',
    noAssetFound: 'No se encontró ningún activo.',

    // Generic UI
    closeButtonLabel: "Cerrar",
    submitRatingButton: "Enviar Calificación",

    // Feedback Surveys
    feedback: {
        anonymousDisclaimer: "Tu respuesta es anónima y solo se usa para mejorar la app.",

        // Receive Funds
        receiveFlowEaseTitle: "🎉 ¡Recibiste tu primer envío!",
        receiveFlowEaseQuestion: "¿Qué tan fácil fue recibirlo?",
        
        // Send First Transaction
        sendFlowFeelingTitle: "💸 Tu envío está en camino.",
        sendFlowFeelingQuestion: "¿Cómo te sentiste con el proceso?",

        // Seed Confirmation
        seedClarityTitle: "🔐 Un último paso",
        seedClarityQuestion: "Acabas de confirmar tu frase de seguridad. ¿Fue claro este paso?",
        
        // Overall CSAT
        overallCsatTitle: "🍓 Has usado Violet Vault varias veces.",
        overallCsatQuestion: "¿Cómo calificarías tu experiencia general?",

        // Options
        options: {
            // receive_flow_ease
            receiveFlowEase: [
                { value: 'super_facil', labelKey: 'super_easy' },
                { value: 'bien_mejorable', labelKey: 'good_improvable' },
                { value: 'dificil', labelKey: 'difficult' },
            ],
            // send_flow_feeling
            sendFlowFeeling: [
                { value: 'claro_confiado', labelKey: 'clear_confident' },
                { value: 'dude_en_algunos_pasos', labelKey: 'had_doubts' },
                { value: 'confuso', labelKey: 'confusing' },
            ],
            // seed_clarity
            seedClarity: [
                { value: 'muy_claro', labelKey: 'very_clear' },
                { value: 'entendi_pero_dificil', labelKey: 'understood_but_difficult' },
                { value: 'no_entendi_bien', labelKey: 'did_not_understand_well' },
            ],

            // Option labels
            super_easy: "Súper fácil",
            good_improvable: "Bien, pero mejorable",
            difficult: "Fue difícil",
            clear_confident: "Claro y con confianza",
            had_doubts: "Tuve dudas en algunos pasos",
            confusing: "Fue confuso",
            very_clear: "Sí, muy claro",
            understood_but_difficult: "Entendí, pero fue difícil",
            did_not_understand_well: "No lo entendí bien"
        }
    }
  },
};

// Function to get the correct translations, falling back to English
const getTranslatedStrings = (lang: Language) => {
    const base = translationsData['en'];
    const selected = translationsData[lang] || base;

    // A simple deep merge. For a real app, a library like lodash.merge would be better.
    const merge = (target: any, source: any) => {
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], merge(target[key], source[key]));
            }
        }
        Object.assign(target || {}, source);
        return target;
    }

    return merge(base, selected);
};

// Pre-calculate all translations
export const translations = supportedLanguages.reduce((acc, lang) => {
    acc[lang] = getTranslatedStrings(lang);
    return acc;
}, {} as Record<Language, typeof translationsData.en>);
