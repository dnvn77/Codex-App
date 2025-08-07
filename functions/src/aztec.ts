import {
  createPXEClient,
  AztecAddress,
  Wallet,
  Fr,
  PXE,
  waitForSandbox,
  getSandboxAccounts,
  AccountWallet,
  TxReceipt,
  CompleteAddress,
  Point,
  EthAddress
} from "@aztec/aztec.js";
import { getEthAddress } from "@aztec/circuits.js";

const { PXE_URL = "http://localhost:8080" } = process.env;

let pxe: PXE;

/**
 * Inicializa y devuelve una instancia del cliente PXE.
 * Mantiene una única instancia para reutilizarla.
 */
const getPXE = async (): Promise<PXE> => {
    if (!pxe) {
        const pxeUrl = PXE_URL;
        console.log(`Connecting to PXE at ${pxeUrl}...`);
        pxe = createPXEClient(pxeUrl);
        // Espera a que el sandbox esté listo si estás usando uno local
        // await waitForSandbox(pxe); 
        console.log("PXE client connected.");
    }
    return pxe;
};


/**
 * Crea una nueva wallet de Aztec y la registra en el PXE.
 */
export const createWallet = async (): Promise<{ address: CompleteAddress, pxe: PXE }> => {
    const pxe = await getPXE();
    const newWallet: AccountWallet = await pxe.registerAccount();
    return { address: newWallet.getCompleteAddress(), pxe };
};

/**
 * Obtiene el balance de un token para una dirección específica.
 * Por ahora, se asume ETH como token principal.
 */
export const getBalance = async (address: string, tokenSymbol: string): Promise<{ balance: bigint, assetAddress: AztecAddress }> => {
    const pxe = await getPXE();
    const ownerAddress = AztecAddress.fromString(address);
    
    // Aquí deberíamos tener un registro de direcciones de tokens.
    // Por ahora, usaremos ETH como ejemplo, que es el activo nativo para pagar fees.
    const assetAddress = (await pxe.getRegisteredTokens())[0]?.address;
    if (!assetAddress) {
        throw new Error("No registered tokens found in PXE. Deploy a token contract first.");
    }

    const balance = await pxe.getPublicBalance(ownerAddress, assetAddress);
    return { balance: balance.value, assetAddress };
};

/**
 * Crea y envía una transacción privada.
 */
export const sendTransaction = async (
    fromAddress: string,
    toAddress: string,
    amount: string,
    tokenSymbol: string
): Promise<{ txHash: Fr, receipt: TxReceipt }> => {
    const pxe = await getPXE();

    // Obtener la wallet del remitente desde el PXE. La clave privada nunca sale del PXE.
    const fromWallet = await getWallet(fromAddress, pxe);
    
    const { assetAddress } = await getBalance(fromAddress, tokenSymbol);

    const recipientAddress = AztecAddress.fromString(toAddress);
    const amountFr = new Fr(BigInt(parseFloat(amount) * 1e18)); // Convertir a Fr

    // Construye la llamada al método 'transfer' del contrato del token
    const call = {
        to: assetAddress,
        functionData: { // Esto asume una función de transferencia estándar
            function_selector: "transfer", // Reemplazar con el selector de función correcto
            args: [recipientAddress, amountFr]
        }
    };
    
    // El PXE se encarga de crear el AuthWitness internamente
    const tx = await fromWallet.createTx(call);
    const sentTx = await fromWallet.sendTx(tx);
    const receipt = await sentTx.getReceipt();
    
    if (receipt.status !== 'mined') {
        throw new Error(`Transaction failed with status: ${receipt.status}`);
    }

    return { txHash: sentTx.getTxHash(), receipt };
};


/**
 * Verifica una prueba ZKP (simulación).
 * En una implementación real, esto interactuaría con el verificador del PXE.
 */
export const verifyProof = async (proof: any): Promise<boolean> => {
    const pxe = await getPXE();
    // La verificación de pruebas es un proceso complejo que depende del circuito específico.
    // El PXE maneja esto internamente al validar una transacción.
    // Este endpoint es más bien conceptual a menos que tengas un caso de uso específico
    // para verificar pruebas fuera de una transacción.
    console.log("Verifying proof (conceptual):", proof);
    // En una implementación real: await pxe.verifyProof(proof);
    return true; // Simulado
};


/**
 * Helper para obtener una instancia de Wallet para una dirección dada.
 */
const getWallet = async (address: string, pxe: PXE): Promise<Wallet> => {
    const aztecAddress = AztecAddress.fromString(address);
    const accounts = await pxe.getRegisteredAccounts();
    const account = accounts.find(a => a.address.equals(aztecAddress));

    if (!account) {
        throw new Error(`Account ${address} is not registered with the PXE.`);
    }

    return await pxe.getWallet(account);
};
