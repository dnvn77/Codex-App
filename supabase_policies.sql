-- Eliminar políticas antiguas si existen, para evitar conflictos.
DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.event_logs;
DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.feedback_events;

-- Habilitar Row-Level Security (RLS) en las tablas si aún no está habilitado.
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_events ENABLE ROW LEVEL SECURITY;

-- Nueva política para la tabla event_logs
-- Permite a cualquier usuario (rol anon) insertar un nuevo evento.
-- No se necesita una cláusula USING porque los usuarios anónimos no deben poder leer/modificar datos existentes.
CREATE POLICY "Allow anonymous insert access"
ON public.event_logs
FOR INSERT
TO anon
WITH CHECK (true);


-- Nueva política para la tabla feedback_events
-- Permite a cualquier usuario (rol anon) insertar un nuevo evento de feedback.
CREATE POLICY "Allow anonymous insert access"
ON public.feedback_events
FOR INSERT
TO anon
WITH CHECK (true);
