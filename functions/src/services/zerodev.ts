/**
 * @fileoverview Servicio para interactuar con el SDK de ZeroDev.
 * Abstrae la creación de signers y la obtención de direcciones de smart accounts.
 *
 * Documentación de ZeroDev SDK: https://docs.zerodev.app/sdk/getting-started
 * Conceptos de ERC-4337: https://eips.ethereum.org/EIPS/eip-4337
 */

import { ECDSAProvider } from '@zerodev/sdk';
import { config } from '../config';

const projectId = config.ZERODEV_PROJECT_ID;

/**
 * Obtiene un signer de ZeroDev (ECDSAProvider) para un ID de usuario específico.
 * Este signer puede ser usado para enviar transacciones (UserOperations) en nombre
 * de la smart account del usuario.
 * La clave privada subyacente es gestionada por ZeroDev y no se expone aquí.
 *
 * @param {string} userId - El identificador único del usuario (ej: "whatsapp:+12345").
 * @returns {Promise<ECDSAProvider>} Una promesa que resuelve a un ECDSAProvider.
 */
export async function getZeroDevSigner(userId: string): Promise<ECDSAProvider> {
  // El ECDSAProvider de ZeroDev crea un signer (EOA) determinista para cada `userId`,
  // el cual es el "dueño" de la smart account. La clave privada de este EOA es
  // gestionada de forma segura por los servidores de ZeroDev.
  return await ECDSAProvider.init({
    projectId,
    owner: {
        // Usamos un signer de tipo `portal` que se conecta con el servicio de ZeroDev
        // para firmar las UserOperations.
        // El `userId` actúa como un identificador para la clave privada del usuario en el sistema de ZeroDev.
        type: 'portal',
        portalId: userId, 
    }
  });
}

/**
 * Obtiene la dirección de la smart account para un ID de usuario específico.
 * Es una función determinista basada en el Project ID y el signer del usuario.
 *
 * @param {string} userId - El identificador único del usuario.
 * @returns {Promise<string>} La dirección de la smart account.
 */
export async function getSmartAccountAddress(userId: string): Promise<string> {
  const signer = await getZeroDevSigner(userId);
  return await signer.getAddress();
}
