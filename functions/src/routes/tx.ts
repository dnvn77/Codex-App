/**
 * @fileoverview Rutas de Express para el envío de transacciones.
 */

import { Router } from 'express';
import { ethers } from 'ethers';
import { getZeroDevSigner, getSmartAccountAddress } from '../services/zerodev';
import { getExplorerUrl } from '../services/chain';
import { validateRequest } from '../middleware/validateRequest';
import { SendTransactionRequestSchema } from '../types';

const router = Router();

/**
 * @route   POST /tx/send
 * @desc    Envía una transferencia de ETH desde una smart account de ZeroDev en Scroll Sepolia.
 * @access  Privado (requiere API Key)
 *
 * Documentación de envío de UserOperations con ZeroDev: https://docs.zerodev.app/sdk/sending-userops
 * Documentación del explorador de Scroll Sepolia: https://sepolia.scrollscan.com
 */
router.post('/send', validateRequest({body: SendTransactionRequestSchema}), async (req, res, next) => {
  try {
    const { fromUserId, to, amountEth } = req.body;

    // Obtener el signer de ZeroDev para el usuario.
    // Esto no expone claves privadas, ZeroDev lo gestiona internamente.
    const signer = await getZeroDevSigner(fromUserId);
    const fromAddress = await signer.getAddress();
    
    const shortTo = `${to.slice(0, 6)}...${to.slice(-4)}`;

    // Enviar la transacción (UserOperation)
    // El SDK de ZeroDev se encarga de empaquetar, firmar y enviar la UserOp al Bundler.
    const tx = await signer.sendTransaction({
      to: to,
      value: ethers.parseEther(amountEth),
    });

    res.status(200).json({
      message: `⏳ Transacción enviada a ${shortTo}. Esperando confirmación...\nHash: ${tx.hash}`,
      transactionHash: tx.hash,
      explorerUrl: getExplorerUrl(tx.hash),
    });

    // Esperar la confirmación de la transacción de forma asíncrona y luego notificar (opcional)
    // Para una mejor UX, no bloqueamos la respuesta esperando la confirmación.
    // En un caso de uso real, se podría usar un webhook o un sistema de colas para notificar al usuario final.
    tx.wait().then(receipt => {
      console.log(`Transacción confirmada para ${fromUserId}: ${receipt?.hash}`);
      // Aquí podrías enviar una notificación de vuelta a Make.com o directamente a WhatsApp.
    }).catch(console.error);

  } catch (error) {
    next(error);
  }
});

export default router;
