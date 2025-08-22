/**
 * @fileoverview Rutas de Express para la gestión de billeteras MPC con PortalHQ.
 * Define los endpoints para crear billeteras y consultar balances.
 */

import { Router } from 'express';
import { getBalance } from '../services/chain';
import { validateRequest } from '../middleware/validateRequest';
import { CreateWalletRequestSchema, GetBalanceRequestSchema, GetBalanceBodySchema } from '../types';
import { findOrCreateUserByWallet } from '../services/supabase';
import { getWalletAddress } from '../services/portal';

const router = Router();

/**
 * @route   POST /wallet/create
 * @desc    Crea o recupera una MPC wallet con PortalHQ para un User ID y la guarda en la BD.
 * @access  Privado (requiere API Key)
 */
router.post('/create', validateRequest({body: CreateWalletRequestSchema}), async (req, res, next) => {
  try {
    const { userId, walletAddress } = req.body;
    
    // Obtener la dirección de la wallet MPC para el usuario
    const addressFromPortal = await getWalletAddress(userId);

    if (addressFromPortal.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(400).json({ error: { code: 'ADDRESS_MISMATCH', message: 'Wallet address does not match Portal records.' } });
    }

    // Guardar el usuario en Supabase usando la dirección de la wallet.
    const user = await findOrCreateUserByWallet(walletAddress);

    res.status(200).json({
      address: user.wallet_address,
      message: `✅ Usuario con wallet ${user.wallet_address} creado/obtenido.`,
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
            message: `🔍 Balance de ${shortAddress}:\n*${balance} MONAD* (Testnet)`,
        });
    } catch (error) {
        next(error);
    }
}


/**
 * @route   GET /wallet/balance/:address
 * @desc    Consulta el balance de una dirección en la Testnet de Monad (desde la URL).
 * @access  Privado (requiere API Key)
 */
router.get('/balance/:address', validateRequest({params: GetBalanceRequestSchema}), async (req, res, next) => {
    handleGetBalance(req.params.address, res, next);
});

/**
 * @route   POST /wallet/balance
 * @desc    Consulta el balance de una dirección en la Testnet de Monad (desde el body).
 * @access  Privado (requiere API Key)
 */
router.post('/balance', validateRequest({body: GetBalanceBodySchema}), async (req, res, next) => {
    handleGetBalance(req.body.address, res, next);
});


export default router;
