/**
 * @fileoverview Rutas de Express para el envío de transacciones en la red Monad.
 */

import { Router } from 'express';
import { ethers } from 'ethers';
import { getPortalSigner } from '../services/portal';
import { getExplorerUrl } from '../services/chain';
import { validateRequest } from '../middleware/validateRequest';
import { SendTransactionRequestSchema, LogTransactionRequestSchema } from '../types';
import { logTransaction } from '../services/supabase';

const router = Router();

/**
 * @route   POST /tx/send
 * @desc    Envía una transferencia de ETH desde una wallet MPC de Portal en la Testnet de Monad.
 * @access  Privado (requiere API Key)
 */
router.post('/send', validateRequest({body: SendTransactionRequestSchema}), async (req, res, next) => {
  try {
    const { fromUserId, to, amountEth } = req.body;

    // Obtener el signer de Portal para el usuario.
    // Esto no expone claves privadas, PortalHQ lo gestiona internamente con MPC.
    const signer = await getPortalSigner(fromUserId);
    
    const shortTo = `${to.slice(0, 6)}...${to.slice(-4)}`;

    // Enviar la transacción
    const tx = await signer.sendTransaction({
      to: to,
      value: ethers.parseEther(amountEth),
    });

    res.status(200).json({
      message: `⏳ Transacción enviada a ${shortTo}. Esperando confirmación...\nHash: ${tx.hash}`,
      transactionHash: tx.hash,
      explorerUrl: getExplorerUrl(tx.hash),
    });

    // Esperar la confirmación de la transacción de forma asíncrona (opcional)
    tx.wait().then(receipt => {
      console.log(`Transacción confirmada para ${fromUserId}: ${receipt?.hash}`);
      // Aquí se podría notificar al usuario final.
    }).catch(console.error);

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /tx/log
 * @desc    Registra una transacción en la base de datos de Supabase.
 * @access  Privado (requiere API Key)
 */
router.post('/log', validateRequest({body: LogTransactionRequestSchema}), async (req, res, next) => {
    try {
        const txData = req.body;
        const result = await logTransaction(txData);

        res.status(201).json({
            message: 'Transacción registrada exitosamente.',
            data: result
        });
    } catch(error) {
        next(error);
    }
});


export default router;
