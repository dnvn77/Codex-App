-- =========================================================
-- Prereqs
-- =========================================================
create extension if not exists "pgcrypto";

-- =========================================================
-- Tables (Core del producto)
-- =========================================================

-- 1) Users (opcional si usas Supabase Auth; mapea tu user externo)
create table if not exists public.users_app (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,                                         -- ej: "telegram:<id>" o "whatsapp:+52..."
  user_id uuid unique references auth.users(id) on delete set null, -- si usas Supabase Auth
  created_at timestamptz not null default now()
);

-- 2) Wallets: mapea cada usuario a su Smart Account (si aplica)
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_external_id text,                                            -- si NO usas auth
  user_id uuid references auth.users(id) on delete set null,        -- si SÍ usas auth
  address text unique not null,                                     -- smart account address (p. ej. ZeroDev)
  network text not null default 'scroll-sepolia',
  created_at timestamptz not null default now(),
  constraint wallets_owner_present check (user_id is not null or user_external_id is not null)
);

-- 3) Txs: historial de transacciones (producto)
create table if not exists public.txs (
  id uuid primary key default gen_random_uuid(),
  user_external_id text,                                            -- si NO usas auth
  user_id uuid references auth.users(id) on delete set null,        -- si SÍ usas auth
  from_address text not null,
  to_address text not null,
  amount_eth numeric not null check (amount_eth > 0),
  tx_hash text unique,
  block_number bigint,
  explorer_url text,
  created_at timestamptz not null default now(),
  constraint txs_owner_present check (user_id is not null or user_external_id is not null)
);

-- =========================================================
-- Tables (Analítica anónima)
-- =========================================================

-- A) EVENT LOGS (analítica pasiva: páginas vistas, tiempo en pantalla, clics, errores, abandonos)
create table if not exists public.event_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,                         -- generado en el front por sesión
  event_type text not null,                         -- ej: 'screen_view', 'button_click', 'seed_phrase_abandon', 'error_displayed'
  screen text,                                      -- ruta o pantalla
  screen_time_seconds int,                          -- tiempo en pantalla antes del evento
  device_type text,                                 -- 'mobile' | 'desktop' | 'telegram_webapp'
  language text,                                    -- ej: 'es-MX'
  ui_theme text,                                    -- 'dark' | 'light' | 'system'
  error_code text,                                  -- opcional: 'invalid_seed', 'tx_failed', etc.
  client_timestamp timestamptz,                     -- timestamp enviado por el front
  server_received_at timestamptz default now()      -- timestamp del servidor
);

-- B) FEEDBACK EVENTS (micro-encuestas: preguntas directas al usuario)
create table if not exists public.feedback_events (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null,                       -- generado en el front por sesión
    event_type text not null,                       -- ej: 'funds_received_first_time', 'tx_sent_first_time', 'seed_confirmed', 'repeated_usage_n'
    screen text,                                    -- ej: 'receipt_received', 'receipt_sent', 'seed_confirm_done', 'dashboard'
    question_id text not null,                      -- ej: 'receive_flow_ease', 'send_flow_feeling', 'seed_clarity', 'overall_csat'
    response_choice text,                           -- opciones tipo: 'super_facil', 'claro_confiado', etc.
    rating int check (rating between 1 and 5),      -- para overall_csat (1–5)
    screen_time_seconds int,                        -- tiempo previo a la respuesta
    ui_theme text,
    language text,
    device_type text,
    client_timestamp timestamptz,                   -- timestamp del front
    server_received_at timestamptz default now()    -- timestamp del server
);

-- =========================================================
-- Indexes
-- =========================================================
-- Core
create index if not exists wallets_user_id_idx on public.wallets (user_id);
create index if not exists wallets_user_external_id_idx on public.wallets (user_external_id);
create index if not exists wallets_created_at_idx on public.wallets (created_at);

create index if not exists txs_user_id_idx on public.txs (user_id);
create index if not exists txs_user_external_id_idx on public.txs (user_external_id);
create index if not exists txs_created_at_idx on public.txs (created_at);
create index if not exists txs_from_idx on public.txs (from_address);
create index if not exists txs_to_idx on public.txs (to_address);

-- Analítica
create index if not exists event_logs_session_idx   on public.event_logs (session_id);
create index if not exists event_logs_type_time_idx on public.event_logs (event_type, server_received_at);
create index if not exists event_logs_screen_idx    on public.event_logs (screen);

create index if not exists feedback_session_idx     on public.feedback_events (session_id);
create index if not exists feedback_question_idx    on public.feedback_events (question_id);
create index if not exists feedback_time_idx        on public.feedback_events (server_received_at);

-- =========================================================
-- Enable RLS
-- =========================================================
alter table public.users_app       enable row level security;
alter table public.wallets        enable row level security;
alter table public.txs            enable row level security;
alter table public.event_logs     enable row level security;
alter table public.feedback_events enable row level security;

-- =========================================================
-- RLS: Analítica (Permite inserción anónima segura desde el cliente)
-- =========================================================

-- EVENT_LOGS: Permite a cualquiera (rol 'anon') insertar registros. No permite leerlos, actualizarlos o borrarlos.
drop policy if exists "allow_anon_insert_only" on public.event_logs;
create policy "allow_anon_insert_only"
on public.event_logs
for insert
to anon
with check (true);

-- FEEDBACK_EVENTS: Permite a cualquiera (rol 'anon') insertar registros.
drop policy if exists "allow_anon_insert_only" on public.feedback_events;
create policy "allow_anon_insert_only"
on public.feedback_events
for insert
to anon
with check (true);


-- =========================================================
-- RLS: Producto (protegido, solo para usuarios autenticados)
-- =========================================================

-- USERS_APP
drop policy if exists "users_app_select_own" on public.users_app;
drop policy if exists "users_app_insert_self" on public.users_app;
drop policy if exists "users_app_update_self" on public.users_app;

create policy "users_app_select_own"
on public.users_app for select
to authenticated using (user_id = auth.uid());

create policy "users_app_insert_self"
on public.users_app for insert
to authenticated with check (user_id = auth.uid());

create policy "users_app_update_self"
on public.users_app for update
to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- WALLETS
drop policy if exists "wallets_select_owner" on public.wallets;
drop policy if exists "wallets_insert_owner" on public.wallets;
drop policy if exists "wallets_update_owner" on public.wallets;

create policy "wallets_select_owner"
on public.wallets for select
to authenticated using (user_id = auth.uid());

create policy "wallets_insert_owner"
on public.wallets for insert
to authenticated with check (user_id = auth.uid());

create policy "wallets_update_owner"
on public.wallets for update
to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- TXS
drop policy if exists "txs_select_owner" on public.txs;
drop policy if exists "txs_insert_owner" on public.txs;

create policy "txs_select_owner"
on public.txs for select
to authenticated using (user_id = auth.uid());

create policy "txs_insert_owner"
on public.txs for insert
to authenticated with check (user_id = auth.uid());
