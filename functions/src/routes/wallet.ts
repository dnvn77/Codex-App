
/**
 * @fileoverview Rutas de Express para la gestión de billeteras (smart accounts).
 * Define los endpoints para crear billeteras y consultar balances.
 */

import { Router } from 'express';
import { getSmartAccountAddress } from '../services/zerodev';
import { getBalance } from '../services/chain';
import { validateRequest } from '../middleware/validateRequest';
import {CreateWalletRequestSchema, GetBalanceRequestSchema} from '../types'
import { createOrRetrieveUserAndWallet } from '../services/supabase';


const router = Router();

/**
 * @route   POST /wallet/create
 * @desc    Crea una nueva smart account con ZeroDev para un User ID y la guarda en la BD.
 * @access  Privado (requiere API Key)
 *
 * Documentación de ZeroDev SDK: https://docs.zerodev.app/sdk/getting-started
 */
router.post('/create', validateRequest({body: CreateWalletRequestSchema}), async (req, res, next) => {
  try {
    const { userId, walletAddress } = req.body;

    // Guardar el mapeo userId -> address en Supabase.
    const { user, wallet } = await createOrRetrieveUserAndWallet(userId, walletAddress, 'zerodev');

    res.status(200).json({
      address: wallet.address,
      message: `✅ Smart account creada/obtenida para ${user.telegram_user_id}:\n\`${wallet.address}\``,
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
