
/**
 * @fileoverview Rutas de Express para la gestión de billeteras (smart accounts).
 * Define los endpoints para crear billeteras y consultar balances.
 */

import { Router } from 'express';
import { getBalance } from '../services/chain';
import { validateRequest } from '../middleware/validateRequest';
import {CreateWalletRequestSchema, GetBalanceRequestSchema, GetBalanceBodySchema} from '../types'
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


const handleGetBalance = async (address: string, res: any, next: any) => {
    try {
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
}


/**
 * @route   GET /wallet/balance/:address
 * @desc    Consulta el balance de una dirección en Scroll Sepolia (desde la URL).
 * @access  Privado (requiere API Key)
 */
router.get('/balance/:address', validateRequest({params: GetBalanceRequestSchema}), async (req, res, next) => {
    handleGetBalance(req.params.address, res, next);
});

/**
 * @route   POST /wallet/balance
 * @desc    Consulta el balance de una dirección en Scroll Sepolia (desde el body).
 * @access  Privado (requiere API Key)
 */
router.post('/balance', validateRequest({body: GetBalanceBodySchema}), async (req, res, next) => {
    handleGetBalance(req.body.address, res, next);
});


export default router;
