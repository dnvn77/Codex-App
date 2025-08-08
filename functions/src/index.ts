import * as functions from "firebase-functions";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import { config } from "dotenv";
import { createWallet, getBalance, sendTransaction, verifyProof } from "./aztec";

// Cargar variables de entorno
config();

const app = express();

// Middlewares
app.use(cors({ origin: true }));
app.use(bodyParser.json());

// Middleware de autenticación para proteger los endpoints
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const apiKey = req.header("x-api-key");
    if (apiKey !== process.env.MAKE_COM_API_KEY) {
        return res.status(401).send({ error: "Unauthorized: Invalid API Key" });
    }
    next();
};

// --- RUTAS DEL BACKEND ---

// Endpoint para registrar eventos anónimos (público, sin autenticación de API Key)
app.post("/log-event", (req, res) => {
    const eventData = req.body;

    // Validación básica
    if (!eventData.session_id || !eventData.event_type) {
        return res.status(400).send({ error: "Missing required event data: session_id and event_type are required." });
    }

    // Asegurarse de que no se estén registrando datos personales
    const forbiddenKeys = ['walletAddress', 'ip', 'email', 'password', 'seedPhrase'];
    for (const key of forbiddenKeys) {
        if (eventData[key]) {
            console.warn(`Attempted to log forbidden key: ${key}`);
            delete eventData[key]; // Eliminar la clave prohibida
        }
    }

    // En un entorno de producción, aquí guardarías el evento en tu base de datos (ej. Supabase)
    // TODO: Implement Supabase client to save eventData
    console.log("Anonymous event logged:", JSON.stringify(eventData, null, 2));


    res.status(200).send({ success: true, message: "Event logged successfully." });
});


app.use(authenticate); // Aplicar autenticación solo a las rutas que lo necesiten

/**
 * Endpoint para crear una nueva wallet de Aztec.
 * No recibe cuerpo de petición.
 */
app.post("/create-wallet", async (req, res) => {
    try {
        const { address, pxe } = await createWallet();
        const whatsappMessage = `✅ ¡Billetera creada con éxito!

Tu nueva dirección privada de Aztec es:
*${address.toString()}*

*Importante*: Esta es una billetera de auto-custodia. Tu clave privada se gestiona de forma segura en el entorno de ejecución privado (PXE) y nunca se expone.`;

        res.status(200).send({
            address: address.toString(),
            message: whatsappMessage
        });
    } catch (error: any) {
        console.error("Error creating wallet:", error);
        res.status(500).send({ error: "Failed to create wallet", details: error.message });
    }
});

/**
 * Endpoint para obtener el balance de un token específico.
 * Body: { "address": "0x...", "tokenSymbol": "ETH" }
 */
app.post("/get-balance", async (req, res) => {
    const { address, tokenSymbol } = req.body;

    if (!address || !tokenSymbol) {
        return res.status(400).send({ error: "Missing 'address' or 'tokenSymbol' in request body" });
    }

    try {
        const { balance, assetAddress } = await getBalance(address, tokenSymbol);
        
        const formattedBalance = (Number(balance) / 1e18).toFixed(6); // Asumiendo 18 decimales

        const whatsappMessage = `📊 *Balance de ${tokenSymbol}*

Dirección: \`${address}\`
Saldo disponible: *${formattedBalance} ${tokenSymbol}*`;

        res.status(200).send({
            address,
            assetAddress: assetAddress.toString(),
            balance: balance.toString(),
            message: whatsappMessage,
        });

    } catch (error: any) {
        console.error(`Error getting balance for ${address}:`, error);
        res.status(500).send({ error: "Failed to get balance", details: error.message });
    }
});

/**
 * Endpoint para enviar una transacción privada.
 * Body: { "fromAddress": "0x...", "toAddress": "0x...", "amount": "0.01", "tokenSymbol": "ETH" }
 */
app.post("/send-transaction", async (req, res) => {
    const { fromAddress, toAddress, amount, tokenSymbol } = req.body;

    if (!fromAddress || !toAddress || !amount || !tokenSymbol) {
        return res.status(400).send({ error: "Missing required fields: fromAddress, toAddress, amount, tokenSymbol" });
    }

    try {
        const { txHash, receipt } = await sendTransaction(fromAddress, toAddress, amount, tokenSymbol);
        
        const proposedOnL1 = receipt.blockNumber; // Este es el campo que buscamos
        const txLink = `https://aztec-explorer.aztec.network/tx/${txHash.toString()}`;

        const whatsappMessage = `🚀 ¡Transacción enviada con éxito!

*Monto*: ${amount} ${tokenSymbol}
*Desde*: \`${fromAddress}\`
*Hacia*: \`${toAddress}\`

*Hash de la transacción*: \`${txHash.toString()}\`
*Bloque de liquidación L1*: ${proposedOnL1}

Tu transacción ha sido enviada a la red privada de Aztec y se liquidará en la red principal en un lote. La privacidad está garantizada por pruebas ZK.

Puedes intentar ver tu transacción aquí (puede tardar en aparecer):
${txLink}`;

        res.status(200).send({
            transactionHash: txHash.toString(),
            proposedOnL1,
            explorerLink: txLink,
            message: whatsappMessage,
        });

    } catch (error: any) {
        console.error("Error sending transaction:", error);
        res.status(500).send({ error: "Failed to send transaction", details: error.message });
    }
});


/**
 * Endpoint para verificar una prueba ZKP (simulado/opcional).
 * Body: { "proof": "..." }
 */
app.post("/verify-proof", async (req, res) => {
    const { proof } = req.body;
    if (!proof) {
        return res.status(400).send({ error: "Missing 'proof' in request body" });
    }

    try {
        const isValid = await verifyProof(proof);
        res.status(200).send({
            isValid,
            message: `La prueba proporcionada es ${isValid ? "válida" : "inválida"}.`
        });
    } catch (error: any) {
        console.error("Error verifying proof:", error);
        res.status(500).send({ error: "Failed to verify proof", details: error.message });
    }
});

// Exportar la app de Express como una Firebase Function
export const api = functions.https.onRequest(app);
