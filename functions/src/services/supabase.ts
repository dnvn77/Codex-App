

/**
 * @fileoverview Servicio para interactuar con Supabase Admin.
 * Centraliza las operaciones de base de datos relacionadas con la lógica de negocio.
 * Utiliza la Service Role Key para operaciones con privilegios.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import type { TransactionLogData, AnalyticsEventData } from '../types';

// Cliente de Supabase con privilegios de administrador.
// Usar solo en el backend.
const supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Busca un usuario por su dirección de wallet, y si no existe, lo crea.
 * También crea una entrada en la tabla 'wallets' si es la primera vez que se ve esa dirección.
 * @param {string} userId - El ID de usuario (por ejemplo, de Telegram).
 * @param {string} walletAddress - La dirección de la wallet del usuario.
 * @param {string} walletType - El tipo de wallet (e.g., 'zerodev', 'portal').
 * @returns {Promise<{user: any, wallet: any}>} El objeto de usuario y el de la wallet de la BD.
 */
export async function createOrRetrieveUserAndWallet(userId: string, walletAddress: string, walletType: string) {
    // 1. Buscar o crear el usuario.
    let { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('telegram_user_id', userId)
        .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error al buscar usuario por telegram_user_id:', userError);
        throw new Error('Error al interactuar con la base de datos de usuarios.');
    }

    if (!user) {
        // Si el usuario no existe por telegram_id, intentamos buscarlo por wallet_address
        let { data: existingUser, error: existingUserError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('wallet_address', walletAddress)
            .single();
        
        if (existingUserError && existingUserError.code !== 'PGRST116') {
            console.error('Error al buscar usuario por wallet_address:', existingUserError);
            throw new Error('Error al interactuar con la base de datos de usuarios.');
        }
        
        if (existingUser) {
            // El usuario existe con otra telegram_id, lo cual es un caso borde
            // Por ahora, simplemente lo usamos
            user = existingUser;
        } else {
            // El usuario realmente no existe, lo creamos
            const { data: newUser, error: newUserError } = await supabaseAdmin
                .from('users')
                .insert({ 
                    telegram_user_id: userId, 
                    wallet_address: walletAddress,
                    username: `user_${userId}` // Default username
                })
                .select()
                .single();

            if (newUserError) {
                console.error('Error al crear usuario:', newUserError);
                throw new Error('No se pudo crear el registro de usuario.');
            }
            user = newUser;
        }
    }

    // 2. Buscar o crear la wallet asociada
    let { data: wallet, error: walletError } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('address', walletAddress)
        .single();
    
    if (walletError && walletError.code !== 'PGRST116') {
        console.error('Error al buscar wallet:', walletError);
        throw new Error('Error al interactuar con la base de datos de wallets.');
    }

    if (!wallet) {
        const { data: newWallet, error: newWalletError } = await supabaseAdmin
            .from('wallets')
            .insert({ 
                user_id: user.id, // Enlace con el UUID del usuario
                address: walletAddress,
                wallet_type: walletType,
            })
            .select()
            .single();
        
        if (newWalletError) {
            console.error('Error al crear la wallet:', newWalletError);
            throw new Error('No se pudo crear el registro de la wallet.');
        }
        wallet = newWallet;
    }

    return { user, wallet };
}


/**
 * Registra una transacción en la base de datos.
 * @param {TransactionLogData} txData - Los datos de la transacción a registrar.
 * @returns {Promise<any>} El registro de la transacción creada.
 */
export async function logTransaction(txData: TransactionLogData) {
    
    // Primero, encontrar el user_id basado en la dirección del sender.
    const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('wallet_address', txData.from)
        .single();

    if (userError || !user) {
        console.error('Error al buscar el usuario para la transacción:', userError);
        throw new Error('No se pudo encontrar el usuario para registrar la transacción.');
    }

    const transactionToInsert = {
        user_id: user.id,
        hash: txData.txHash,
        from_address: txData.from,
        to_address: txData.to,
        amount: txData.amount,
        token_symbol: txData.ticker,
        block_number: txData.blockNumber,
        status: 'confirmed',
    };

    const { data: loggedTx, error: txError } = await supabaseAdmin
        .from('transactions')
        .insert(transactionToInsert)
        .select()
        .single();
    
    if (txError) {
        console.error('Error al registrar la transacción:', txError);
        throw new Error('No se pudo registrar la transacción.');
    }

    return loggedTx;
}

/**
 * Registra un evento de analítica en la base de datos.
 * @param {AnalyticsEventData} eventData - Los datos del evento a registrar.
 * @returns {Promise<any>} El registro del evento creado.
 */
export async function logAnalyticsEvent(eventData: AnalyticsEventData) {
    const { data, error } = await supabaseAdmin
        .from('event_logs')
        .insert(eventData)
        .select()
        .single();
    
    if (error) {
        console.error('Error al registrar evento de analítica:', error);
        throw new Error('No se pudo registrar el evento de analítica.');
    }

    return data;
}
