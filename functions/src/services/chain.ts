/**
 * @fileoverview Servicio para interactuar con la blockchain (Scroll Sepolia).
 * Contiene utilidades como obtener el proveedor de ethers y consultar balances.
 *
 * Documentación de ethers.js v6: https://docs.ethers.org/v6/
 * Documentación de Scroll: https://docs.scroll.io/en/developers
 */

import { ethers } from 'ethers';
import { config } from '../config';

// URL del RPC para Scroll Sepolia, obtenida desde la configuración.
const RPC_URL = config.SCROLL_SEPOLIA_RPC;

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
 * Consulta el balance de una dirección en la red de Scroll Sepolia.
 * @param {string} address - La dirección a consultar.
 * @returns {Promise<string>} El balance formateado como una cadena en ETH.
 */
export async function getBalance(address: string): Promise<string> {
  try {
    const balanceWei = await provider.getBalance(address);
    // Formatea el balance de Wei a ETH.
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
 * Construye la URL del explorador de Scroll Sepolia para un hash de transacción.
 * @param {string} txHash - El hash de la transacción.
 * @returns {string} La URL completa para ver la transacción en el explorador.
 */
export function getExplorerUrl(txHash: string): string {
  // Explorador de Scroll Sepolia: https://sepolia.scrollscan.com
  return `https://sepolia.scrollscan.com/tx/${txHash}`;
}
