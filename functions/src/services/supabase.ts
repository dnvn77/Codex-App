

/**
 * @fileoverview Servicio para interactuar con Supabase Admin.
 * Centraliza las operaciones de base de datos relacionadas con la lógica de negocio.
 * Utiliza la Service Role Key para operaciones con privilegios.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import type { LogTransactionRequest } from '../types';

// Cliente de Supabase con privilegios de administrador.
// Usar solo en el backend.
const supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Crea o recupera un usuario y su billetera asociada.
 * @param {string} telegramUserId - El ID de usuario de Telegram.
 * @param {string} walletAddress - La dirección de la smart account.
 * @param {string} provider - El proveedor de la billetera (ej. 'zerodev').
 * @returns {Promise<{user: any, wallet: any}>} El usuario y la billetera de la BD.
 */
export async function createOrRetrieveUserAndWallet(telegramUserId: string, walletAddress: string, provider: string) {
    // 1. Buscar o crear el usuario de la app.
    let { data: user, error: userError } = await supabaseAdmin
        .from('users_app')
        .select('*')
        .eq('telegram_user_id', telegramUserId)
        .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error al buscar usuario:', userError);
        throw new Error('Error al interactuar con la base de datos de usuarios.');
    }
    
    if (!user) {
        const { data: newUser, error: newUserError } = await supabaseAdmin
            .from('users_app')
            .insert({ 
                telegram_user_id: telegramUserId,
                // Establece los favoritos por defecto al crear el usuario
                favorite_tokens: ['ETH', 'USDC', 'WBTC'] 
            })
            .select()
            .single();

        if (newUserError) {
            console.error('Error al crear usuario:', newUserError);
            throw new Error('No se pudo crear el registro de usuario.');
        }
        user = newUser;
    }

    // 2. Buscar o crear la billetera.
    let { data: wallet, error: walletError } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('address', walletAddress)
        .single();
    
    if (walletError && walletError.code !== 'PGRST116') {
        console.error('Error al buscar billetera:', walletError);
        throw new Error('Error al interactuar con la base de datos de billeteras.');
    }

    if (!wallet) {
        const { data: newWallet, error: newWalletError } = await supabaseAdmin
            .from('wallets')
            .insert({
                user_id: user.id,
                address: walletAddress,
                wallet_provider: provider
            })
            .select()
            .single();
        
        if (newWalletError) {
            console.error('Error al crear billetera:', newWalletError);
            throw new Error('No se pudo crear el registro de la billetera.');
        }
        wallet = newWallet;
    }

    return { user, wallet };
}

/**
 * Registra una transacción en la base de datos.
 * @param {LogTransactionRequest} txData - Los datos de la transacción a registrar.
 * @returns {Promise<any>} El registro de la transacción creada.
 */
export async function logTransaction(txData: LogTransactionRequest) {
    // Primero, obtener el ID de la billetera a partir de la dirección.
    const { data: wallet, error: walletError } = await supabaseAdmin
        .from('wallets')
        .select('id')
        .eq('address', txData.from_address)
        .single();
    
    if (walletError || !wallet) {
        console.error('Error buscando la billetera para registrar la TX:', walletError);
        throw new Error('La billetera de origen no se encuentra en la base de datos.');
    }

    const { data: loggedTx, error: txError } = await supabaseAdmin
        .from('txs')
        .insert({
            wallet_id: wallet.id,
            tx_hash: txData.tx_hash,
            network: txData.network,
            to_address: txData.to_address,
            amount: txData.amount,
            status: txData.status
        })
        .select()
        .single();
    
    if (txError) {
        console.error('Error al registrar la transacción:', txError);
        throw new Error('No se pudo registrar la transacción.');
    }

    return loggedTx;
}

/**
 * Actualiza la lista de tokens favoritos para un usuario.
 * @param {string} telegramUserId - El ID de usuario de Telegram.
 * @param {string[]} favoriteTokens - El array de tickers de tokens favoritos.
 * @returns {Promise<any>} El registro del usuario actualizado.
 */
export async function updateUserFavoriteTokens(telegramUserId: string, favoriteTokens: string[]) {
    const { data, error } = await supabaseAdmin
        .from('users_app')
        .update({ favorite_tokens: favoriteTokens })
        .eq('telegram_user_id', telegramUserId)
        .select()
        .single();

    if (error) {
        console.error('Error actualizando los tokens favoritos:', error);
        throw new Error('No se pudieron guardar las preferencias de tokens.');
    }

    return data;
}

