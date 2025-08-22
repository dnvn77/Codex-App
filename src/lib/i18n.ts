export type Language = 'en' | 'es';

export const supportedLanguages: Language[] = ['en', 'es'];

const translationsData = {
  en: {
    // New UI
    chat: 'Chats',
    wallet: 'Wallet',
    settings: 'Settings',
    search: 'Search...',
    appearance: 'Appearance',
    theme: 'Theme',
    themeDescription: 'Select the theme for the app.',
    profile: 'Profile',
    contacts: 'Contacts',
    editProfile: 'Edit Profile',
    publicAddress: 'Public EVM Address',
    publicAddressDesc: 'This is your public address for receiving cryptocurrency.',
    recentActivity: 'Recent Activity',
    transactions: 'Transactions',

    account: {
        title: 'Account',
        description: 'Manage your account settings and log out.',
        logoutButton: 'Log Out',
        logoutConfirmTitle: 'Are you sure you want to log out?',
        logoutConfirmDescription: 'This will lock the app and you will need to enter your password to access it again.',
    },

    // Favorites
    favoritesTitle: 'Favorites',
    editFavoritesButton: 'Edit Favorites',
    editFavoritesTitle: 'Edit Favorite Assets',
    editFavoritesDesc: 'Select the assets you want to see on your dashboard.',
    doneButton: 'Done',
    noFavoritesText: 'You have no favorite assets yet. Click "Edit Favorites" to add some.',

    // Dashboard
    loadingPrices: 'Loading prices...',
    loadingPricesError: 'Could not load asset prices.',
    dashboardTitle: 'Wallet Dashboard',

    // Existing translations
    mainTitle: 'Welcome to Codex App',
    mainDescription: 'Your private, self-custody wallet for the Monad Network, integrated with secure messaging.',
    createWalletAndAccountButton: 'Create New Wallet & Account',
    createAccountWithWalletButton: 'Create Account with Existing Wallet',
    importExistingAccountButton: 'Import Existing Account',
    loginButton: 'Import Existing Wallet',
    testnetDisclaimer: 'Transactions are on the Monad Testnet.',
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
    importToCreateAccountDesc: 'Import your existing wallet to create your new Codex App account.',
    importExistingAccountDesc: 'Import your wallet to log into your existing Codex App account.',
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
    disconnectButton: 'Disconnect',
    dashboardDesc: 'Send private transactions on the Monad testnet.',
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
    gasAlertSetDesc: (amount: string, ticker: string, address: string) => `We\'ll notify you when it\'s cheaper to send ${amount} ${ticker} to ${address.slice(0, 6)}...`,
    txSentTitle: 'Transaction Sent',
    txSentDesc: 'Your private transaction has been confirmed on Monad.',
    txHashLabel: 'L1 Transaction Hash',
    toLabel: 'To',
    blockNumberLabel: 'L1 Settlement Block',
    viewOnEtherscanButton: 'View on Explorer',
    backToWalletButton: 'Back to Wallet',
    shareButton: 'Share',
    shareTxTitle: 'My Transaction',
    shareTxText: (txHash: string) => `Check out my transaction on Monad Testnet Explorer! Hash: ${txHash}`,
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
    unlockAppTitle: 'Unlock Codex App',
    unlockAppDesc: 'Enter your password to access your Codex App.',
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
    tokenPortalInfo: 'This token is sent via a secure MPC transaction. This bundles your transaction with others for privacy. The details on the explorer reflect the L1 settlement of this bundle.',
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
        overallCsatTitle: "🍓 You've used Codex App a few times.",
        overallCsatQuestion: "How would you rate your overall experience?",

        // Options
        options: {
            receiveFlowEase: [
                { value: 'super_easy', labelKey: 'super_easy_label', icon: '😄' },
                { value: 'good_improvable', labelKey: 'good_improvable_label', icon: '🤔' },
                { value: 'difficult', labelKey: 'difficult_label', icon: '😕' },
            ],
            sendFlowFeeling: [
                { value: 'clear_confident', labelKey: 'clear_confident_label', icon: '😎' },
                { value: 'had_doubts', labelKey: 'had_doubts_label', icon: '🧐' },
                { value: 'confusing', labelKey: 'confusing_label', icon: '😵' },
            ],
            seedClarity: [
                { value: 'very_clear', labelKey: 'very_clear_label', icon: '👍' },
                { value: 'understood_but_difficult', labelKey: 'understood_but_difficult_label', icon: '😅' },
                { value: 'did_not_understand_well', labelKey: 'did_not_understand_well_label', icon: '🤯' },
            ],

            // Option labels
            super_easy_label: "Super easy",
            good_improvable_label: "Good, but improvable",
            difficult_label: "It was difficult",
            clear_confident_label: "Clear and confident",
            had_doubts_label: "I had doubts on some steps",
            confusing_label: "It was confusing",
            very_clear_label: "Yes, very clear",
            understood_but_difficult_label: "I understood, but it was difficult",
            did_not_understand_well_label: "I did not understand it well"
        }
    }
  },
  es: {
    // New UI
    chat: 'Chats',
    wallet: 'Billetera',
    settings: 'Ajustes',
    search: 'Buscar...',
    appearance: 'Apariencia',
    theme: 'Tema',
    themeDescription: 'Selecciona el tema para la aplicación.',
    profile: 'Perfil',
    contacts: 'Contactos',
    editProfile: 'Editar Perfil',
    publicAddress: 'Dirección Pública EVM',
    publicAddressDesc: 'Esta es tu dirección pública para recibir criptomonedas.',
    recentActivity: 'Actividad Reciente',
    transactions: 'Transacciones',

    account: {
        title: 'Cuenta',
        description: 'Gestiona la configuración de tu cuenta y cierra sesión.',
        logoutButton: 'Cerrar Sesión',
        logoutConfirmTitle: '¿Estás seguro de que quieres cerrar sesión?',
        logoutConfirmDescription: 'Esto bloqueará la aplicación y necesitarás introducir tu contraseña para acceder de nuevo.',
    },

    // Favorites
    favoritesTitle: 'Favoritos',
    editFavoritesButton: 'Editar Favoritos',
    editFavoritesTitle: 'Editar Activos Favoritos',
    editFavoritesDesc: 'Selecciona los activos que quieres ver en tu panel.',
    doneButton: 'Hecho',
    noFavoritesText: 'Aún no tienes activos favoritos. Haz clic en "Editar Favoritos" para añadir algunos.',

    // Dashboard
    loadingPrices: 'Cargando precios...',
    loadingPricesError: 'No se pudieron cargar los precios de los activos.',
    dashboardTitle: 'Panel de la Billetera',

    // Existing translations
    mainTitle: 'Bienvenido a Codex App',
    mainDescription: 'Tu billetera privada y de autocustodia para la red Monad, integrada con mensajería segura.',
    createWalletAndAccountButton: 'Crear Nueva Billetera y Cuenta',
    createAccountWithWalletButton: 'Crear Cuenta con Billetera Existente',
    importExistingAccountButton: 'Importar Cuenta Existente',
    loginButton: 'Importar Billetera Existente',
    testnetDisclaimer: 'Las transacciones se realizan en la Testnet de Monad.',
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
    importToCreateAccountDesc: 'Importa tu billetera existente para crear tu nueva cuenta de Codex App.',
    importExistingAccountDesc: 'Importa tu billetera para iniciar sesión en tu cuenta de Codex App existente.',
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
    disconnectButton: 'Desconectar',
    dashboardDesc: 'Envía transacciones privadas en la testnet de Monad.',
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
    txSentDesc: 'Tu transacción privada ha sido confirmada en Monad.',
    txHashLabel: 'Hash de Transacción L1',
    toLabel: 'Para',
    blockNumberLabel: 'Bloque de Liquidación L1',
    viewOnEtherscanButton: 'Ver en Explorador',
    backToWalletButton: 'Volver a la Billetera',
    shareButton: 'Compartir',
    shareTxTitle: 'Mi Transacción',
    shareTxText: (txHash: string) => `¡Mira mi transacción en el Explorador de la Testnet de Monad! Hash: ${txHash}`,
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
    unlockAppTitle: 'Desbloquear Codex App',
    unlockAppDesc: 'Ingresa tu contraseña para acceder a tu Codex App.',
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
    tokenPortalInfo: 'Este token se envía a través de una transacción MPC segura. Esto agrupa tu transacción con otras para mayor privacidad. Los detalles en el explorador reflejan la liquidación L1 de este paquete.',
    searchAssetPlaceholder: 'Buscar un activo...',
    noAssetFound: 'No se encontró ningún activo.',

    // Generic UI
    closeButtonLabel: "Cerrar",
    submitRatingButton: "Enviar Calificación",

    // Feedback Surveys
    feedback: {
        anonymousDisclaimer: "Tu respuesta es anónima y solo se usa para mejorar la app.",
        receiveFlowEaseTitle: "🎉 ¡Recibiste tu primer envío!",
        receiveFlowEaseQuestion: "¿Qué tan fácil fue recibirlo?",
        sendFlowFeelingTitle: "💸 Tu envío está en camino.",
        sendFlowFeelingQuestion: "¿Cómo te sentiste con el proceso?",
        seedClarityTitle: "🔐 Un último paso",
        seedClarityQuestion: "Acabas de confirmar tu frase de seguridad. ¿Fue claro este paso?",
        overallCsatTitle: "🍓 Has usado Codex App varias veces.",
        overallCsatQuestion: "¿Cómo calificarías tu experiencia general?",
        options: {
            receiveFlowEase: [
                { value: 'super_easy', labelKey: 'super_easy_label', icon: '😄' },
                { value: 'good_improvable', labelKey: 'good_improvable_label', icon: '🤔' },
                { value: 'difficult', labelKey: 'difficult_label', icon: '😕' },
            ],
            sendFlowFeeling: [
                { value: 'clear_confident', labelKey: 'clear_confident_label', icon: '😎' },
                { value: 'had_doubts', labelKey: 'had_doubts_label', icon: '🧐' },
                { value: 'confusing', labelKey: 'confusing_label', icon: '😵' },
            ],
            seedClarity: [
                { value: 'very_clear', labelKey: 'very_clear_label', icon: '👍' },
                { value: 'understood_but_difficult', labelKey: 'understood_but_difficult_label', icon: '😅' },
                { value: 'did_not_understand_well', labelKey: 'did_not_understand_well_label', icon: '🤯' },
            ],
            super_easy_label: "Súper fácil",
            good_improvable_label: "Bien, pero mejorable",
            difficult_label: "Fue difícil",
            clear_confident_label: "Claro y con confianza",
            had_doubts_label: "Tuve dudas en algunos pasos",
            confusing_label: "Fue confuso",
            very_clear_label: "Sí, muy claro",
            understood_but_difficult_label: "Entendí, pero fue difícil",
            did_not_understand_well_label: "No lo entendí bien"
        }
    }
  },
};

const base = translationsData.en;
type BaseTranslations = typeof base;

// Function to merge translations, ensuring all keys from 'en' are present
const mergeTranslations = (langTranslations: Partial<BaseTranslations>): BaseTranslations => {
    const merged = { ...base };

    // A simple deep merge for one level (e.g., feedback.options)
    for (const key in base) {
        const typedKey = key as keyof BaseTranslations;
        if (langTranslations[typedKey]) {
            if (typeof base[typedKey] === 'object' && base[typedKey] !== null && !Array.isArray(base[typedKey]) && !(base[typedKey] instanceof Function)) {
                // @ts-ignore
                merged[typedKey] = { ...base[typedKey], ...langTranslations[typedKey] };
                 if (key === 'feedback' && langTranslations.feedback?.options) {
                    // @ts-ignore
                    merged.feedback.options = { ...base.feedback.options, ...langTranslations.feedback.options };
                }
            } else {
                 // @ts-ignore
                merged[typedKey] = langTranslations[typedKey];
            }
        }
    }
    return merged;
};


// Pre-calculate all translations
export const translations: Record<Language, BaseTranslations> = {
    en: base,
    es: mergeTranslations(translationsData.es),
};
