/**
 * @fileoverview Servicio para interactuar con la blockchain (Monad Testnet).
 * Contiene utilidades como obtener el proveedor de ethers y consultar balances.
 */

import { ethers } from 'ethers';
import { config } from '../config';

// URL del RPC para Monad Testnet, obtenida desde la configuración.
const RPC_URL = config.MONAD_RPC_URL;

// Crea una instancia única del proveedor para reutilizarla.
const provider = new ethers.JsonRpcProvider(RPC_URL);

/**
 * Devuelve la instancia del proveedor de ethers.
 * @returns {ethers.JsonRpcProvider} La instancia del proveedor.
 */
export function getProvider(): ethers.JsonRpcProvider {
  return provider;
}

/**
 * Consulta el balance de una dirección en la red de Monad.
 * @param {string} address - La dirección a consultar.
 * @returns {Promise<string>} El balance formateado como una cadena en MONAD.
 */
export async function getBalance(address: string): Promise<string> {
  try {
    const balanceWei = await provider.getBalance(address);
    // Formatea el balance de Wei a la unidad principal (MONAD).
    return ethers.formatEther(balanceWei);
  } catch (error) {
    console.error(`Error al obtener el balance para ${address}:`, error);
    // Reintentar una vez en caso de error de red.
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo
      const balanceWei = await provider.getBalance(address);
      return ethers.formatEther(balanceWei);
    } catch (retryError) {
      console.error(`Error en el reintento de obtener balance para ${address}:`, retryError);
      throw new Error('No se pudo obtener el balance de la cuenta.');
    }
  }
}

/**
 * Construye la URL del explorador de Monad Testnet para un hash de transacción.
 * @param {string} txHash - El hash de la transacción.
 * @returns {string} La URL completa para ver la transacción en el explorador.
 */
export function getExplorerUrl(txHash: string): string {
  return `https://testnet.monadexplorer.com/tx/${txHash}`;
}
