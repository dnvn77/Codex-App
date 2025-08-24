# Codex App (Wallet No Custodial) 💬💸  

Codex App integra en un solo flujo **funciones de wallet no custodial, mensajería cifrada y pagos**.  
Está diseñada con una **UI minimalista**, fuerte **seguridad** y funciona en un entorno **descentralizado**.  

---

## ⚙️ Stack Tecnológico  

- **Monad** → Red base para pagos rápidos y verificación ([Docs](https://github.com/portal-hq/portal-hackathon-kit-web-mobil3))  
- **ZeroDeV** → Creación y manejo de wallets (**gestiona las llaves privadas, no el usuario**) ([Docs](https://docs.zerodev.app))  
- **CoinMarketCap API** → Precios de tokens en tiempo real ([Docs](https://coinmarketcap.com/api/documentation/v1))  
- **Supabase** → PostgreSQL + auth + almacenamiento de chats  
- **Firebase Studio** → Backend + seguridad  
- **Next.js + React + Tailwind** → Sitio web y aplicación web  
- **Expo Go** → Despliegue de app móvil  
- **ChatGPT** → Asistente interno para prompts y FAQs  

---

## 📱 Navegación de la App  

Menú inferior con **5 secciones principales**:  
1. Perfil  
2. Chats  
3. Wallet  
4. Configuración  
5. Contactos  

---

## 🔑 Funcionalidades Principales  

### 👤 Onboarding & Login  
- **Nueva Cuenta** → Creación de seed phrase + wallet + cuenta en la app al mismo tiempo.  
- **Importar Wallet** → Importar una wallet existente.  
- **Seguridad de Password** →  
  - 8–12 caracteres  
  - Debe incluir: 1 mayúscula, 1 minúscula, 1 número, 1 símbolo  
  - Validación contra los **100 passwords más usados en el mundo**  
- **Almacenamiento Cifrado** → La seed phrase se cifra con el password y se guarda en **local storage**.  
- **Gestión de Llaves** → ZeroDev administra las llaves privadas en segundo plano, el usuario no interactúa directamente con ellas.  
- Si no hay wallet creada → Mensaje *“Wallet no creada aún, por favor crea o importa una”*.  

### 🪪 Perfil  
- Nombre, foto, contactos guardados.  
- Resumen de actividad.  

### 💬 Chats Cifrados  
- **E2EE con cifrado híbrido AES-GCM** (mensajes y transacciones).  
- Chats vinculados directamente a los pagos.  
- Almacenamiento de conversaciones, mensajes y comprobantes en **Supabase (7 tablas)**.  
- Comprobantes enviados automáticamente dentro del chat tras la transacción.  

### 💳 Wallet Integrada  
- **Lista de Tokens** → Tokens soportados con precios en tiempo real y % de cambio en la última hora (verde ▲ / rojo ▼).  
- **Ocultar Balances** → Opción de privacidad.  
- **Gas Fees** → Comparación de tarifa promedio vs. real.  
- **Copiar Dirección** → Botón rápido.  
- **Historial de Transacciones** → Entre usuarios (P2P).  
- **Conversión a USD** → Mostrar montos tanto en token como en dólares.  
- **Candados de Seguridad**:  
  - > $1,000 → Pop-up de confirmación (Sí/No).  
  - > $3,000 → Requiere ingresar password.  
- **Comprobantes incluyen**:  
  - Hash de transacción  
  - Dirección del receptor  
  - Número de bloque  
  - Token + cantidad  
  - Link a [Monad Scan](https://testnet.monadexplorer.com) con el hash  
  - **Móvil**: opción de compartir comprobante (PNG o auto-mensaje).  

### 🔒 Seguridad Adicional  
- Desbloqueo de la wallet con password.  
- Validaciones adicionales para transacciones grandes.  
- Cifrado de datos sensibles en almacenamiento local.  
- Manejo de llaves por ZeroDev para mayor seguridad del usuario.  

### 💸 Pagos en el Chat  
- Flujo completo: **enviar → recibir → confirmar → adjuntar comprobante**.  
- Pagos embebidos dentro de la conversación.  

### 🔄 Suscripción & Retiros  
- Retiros sin tarjeta.  
- Tokens soportados: **USDT, USDC, ETH**.  

### 🌍 Multi-idioma  
- Auto-detección según configuración del dispositivo.  
- Soporte para los **10 idiomas más hablados en el mundo**.  

---

## 🛡️ Seguridad  

- Reglas estrictas de password con validación contra contraseñas comunes.  
- **Cifrado híbrido AES-GCM** para mensajes y transacciones.  
- **Seed phrase cifrada con password** y almacenada en local storage.  
- **Supabase + Firebase** para control seguro de acceso y almacenamiento.  
- **Pop-ups de confirmación** para transacciones sensibles.  
- **ZeroDev maneja las llaves privadas** → el usuario nunca expone directamente sus claves.  

---

## 📊 Base de Datos  

La app utiliza **7 tablas principales**:  
- Usuarios  
- Conversaciones  
- Mensajes  
- Transacciones  
- Contactos  
- Analítica (tracking)  
- Wallets  

---

## 🔗 APIs & Documentación  

- **CoinMarketCap API** → [Docs](https://coinmarketcap.com/api/documentation/v1)  
- **ZeroDev API** → [Docs](https://docs.zerodev.app)  
- **Monad Explorer (Scan)** → [Testnet](https://testnet.monadexplorer.com)  
- **Monad Quick Start** → [Guía de Desarrolladores](https://developers.monad.xyz/#quick-start)  

---

## 🚀 Cómo Ejecutar  

### 1. Clonar repositorio  
```bash
git clone git@github.com:dnvn77/Codex-App.git
cd Codex-App

2. Configurar Node.js

Este proyecto requiere Node.js 18. Se recomienda usar nvm:

# Instalar nvm (si no lo tienes)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Cargar nvm en la terminal
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"

# Instalar y usar Node 18
nvm install 18
nvm use 18

3. Instalar dependencias (instalación limpia)

rm -rf node_modules package-lock.json
npm install

4. Ejecutar en desarrollo
npm run dev

5. Compilar y servir en producción
npm run build
npm start   # o npx next start -p 3000
