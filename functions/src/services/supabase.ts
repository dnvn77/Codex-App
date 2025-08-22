

/**
 * @fileoverview Servicio para interactuar con Supabase Admin.
 * Centraliza las operaciones de base de datos relacionadas con la lógica de negocio.
 * Utiliza la Service Role Key para operaciones con privilegios.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import type { TransactionLogData } from '../types';

// Cliente de Supabase con privilegios de administrador.
// Usar solo en el backend.
const supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Busca un usuario por su dirección de wallet, y si no existe, lo crea.
 * @param {string} walletAddress - La dirección de la wallet del usuario.
 * @returns {Promise<any>} El objeto de usuario de la BD.
 */
export async function findOrCreateUserByWallet(walletAddress: string) {
    let { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error al buscar usuario:', userError);
        throw new Error('Error al interactuar con la base de datos de usuarios.');
    }
    
    if (!user) {
        const { data: newUser, error: newUserError } = await supabaseAdmin
            .from('users')
            .insert({ 
                wallet_address: walletAddress,
                username: `user_${walletAddress.slice(0, 8)}` // Default username
            })
            .select()
            .single();

        if (newUserError) {
            console.error('Error al crear usuario:', newUserError);
            throw new Error('No se pudo crear el registro de usuario.');
        }
        user = newUser;
    }
    return user;
}


/**
 * Registra una transacción en la base de datos.
 * @param {TransactionLogData} txData - Los datos de la transacción a registrar.
 * @returns {Promise<any>} El registro de la transacción creada.
 */
export async function logTransaction(txData: TransactionLogData) {
    
    const transactionToInsert = {
        sender: txData.from,
        recipient: txData.to,
        token: txData.ticker,
        amount: txData.amount,
        tx_hash: txData.txHash,
        block_number: txData.blockNumber,
        status: 'confirmed',
        is_private: false, // Assuming public transactions for now
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
