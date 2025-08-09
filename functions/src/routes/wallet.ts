/**
 * @fileoverview Rutas de Express para la gestión de billeteras (smart accounts).
 * Define los endpoints para crear billeteras y consultar balances.
 */

import { Router } from 'express';
import { z } from 'zod';
import { getZeroDevSigner, getSmartAccountAddress } from '../services/zerodev';
import { getBalance } from '../services/chain';
import { validateRequest } from '../middleware/validateRequest';
import {CreateWalletRequestSchema, GetBalanceRequestSchema} from '../types'

const router = Router();

/**
 * @route   POST /wallet/create
 * @desc    Crea una nueva smart account con ZeroDev para un User ID.
 * @access  Privado (requiere API Key)
 *
 * Documentación de ZeroDev SDK: https://docs.zerodev.app/sdk/getting-started
 */
router.post('/create', validateRequest({body: CreateWalletRequestSchema}), async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Obtener la dirección de la smart account para el userId.
    // ZeroDev deriva la dirección de forma determinista a partir del Project ID y el signer (que aquí es un EOA generado y gestionado por ZeroDev).
    // No necesitamos una clave privada, solo el Project ID.
    const address = await getSmartAccountAddress(userId);
    
    // Aquí se podría guardar el mapeo userId -> address en Firestore.
    // Ejemplo:
    // import { db } from '../services/firebase';
    // await db.collection('users').doc(userId).set({ smartAccountAddress: address });

    res.status(200).json({
      address: address,
      message: `✅ Smart account creada/obtenida para ${userId}:\n\`${address}\``,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /wallet/balance
 * @desc    Consulta el balance de una dirección en Scroll Sepolia.
 * @access  Privado (requiere API Key)
 *
 * Documentación de ethers.js: https://docs.ethers.org/v6/
 */
router.post('/balance', validateRequest({body: GetBalanceRequestSchema}), async (req, res, next) => {
  try {
    const { address } = req.body;

    const balance = await getBalance(address);
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    res.status(200).json({
      address: address,
      balanceEth: balance,
      message: `🔍 Balance de ${shortAddress}:\n*${balance} ETH* (Scroll Sepolia)`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
