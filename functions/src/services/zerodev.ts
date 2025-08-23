/**
 * @fileoverview Servicio para interactuar con el SDK de PortalHQ.
 * Abstrae la creación de clientes y la obtención de direcciones de wallets MPC.
 *
 * Documentación de PortalHQ Gateway: https://docs.portalhq.io/gateway
 */

import { Gateway } from '@portal-hq/gateway';
import { ethers } from 'ethers';
import { config, monadTestnet } from '../config';
import { getProvider } from './chain';

// Inicializa el Gateway de Portal con la configuración del backend.
const gateway = new Gateway(config.PORTAL_GATEWAY_URL, config.PORTAL_API_KEY);
const provider = getProvider();

/**
 * Obtiene o crea un cliente de Portal para un ID de usuario específico.
 * Este cliente representa al usuario en el sistema de Portal.
 *
 * @param {string} userId - El identificador único del usuario.
 * @returns {Promise<any>} Una promesa que resuelve al cliente de Portal.
 */
async function getPortalClient(userId: string) {
    // El 'autocreated' es importante. Si el cliente no existe, Portal lo crea.
    // Si ya existe, simplemente lo recupera. Esto es idempotente.
    return await gateway.clients.autocreate({ id: userId, passcode: userId });
}

/**
 * Obtiene la dirección de la MPC wallet para un ID de usuario específico.
 * Es una función determinista basada en el cliente de Portal.
 *
 * @param {string} userId - El identificador único del usuario.
 * @returns {Promise<string>} La dirección de la wallet.
 */
export async function getWalletAddress(userId: string): Promise<string> {
    const client = await getPortalClient(userId);
    const wallets = await gateway.wallets.list({ clientId: client.id });
    
    // Si el usuario no tiene wallets, creamos una de tipo EVM
    if (wallets.results.length === 0) {
        const newWallet = await gateway.wallets.create({
            clientId: client.id,
            chains: [`eip155:${monadTestnet.id}`], // Chain ID para Monad Testnet
        });
        return newWallet.address;
    }
    
    // Devolvemos la dirección de la primera wallet encontrada
    return wallets.results[0].address;
}

/**
 * Obtiene un Ethers Signer para un usuario a través del Gateway de Portal.
 * Este signer puede usarse para firmar y enviar transacciones desde la MPC wallet.
 *
 * @param {string} userId - El identificador único del usuario.
 * @returns {Promise<ethers.JsonRpcSigner>} Un signer de Ethers conectado al provider y a la wallet de Portal.
 */
export async function getPortalSigner(userId: string): Promise<ethers.JsonRpcSigner> {
    const client = await getPortalClient(userId);
    
    // Obtenemos un EIP-1193 provider desde el gateway de Portal para el cliente específico.
    // Este provider especial se encarga de comunicarse con Portal para firmar transacciones.
    const portalProvider = await gateway.getEip1193Provider({
        clientId: client.id,
        chains: [`eip155:${monadTestnet.id}`], // Monad Testnet Chain ID
    });

    // Envolvemos el provider de Portal con el provider de Ethers.
    const ethersProvider = new ethers.BrowserProvider(portalProvider);
    
    // Obtenemos el signer, que ahora puede firmar transacciones usando la MPC wallet de Portal.
    return await ethersProvider.getSigner();
}
