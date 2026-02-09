import { useApp } from '../../contexts/AppContext';

/**
 * RoleSwitcher - Componente de depuración para cambiar roles.
 * Actualmente desactivado para producción/modo real.
 * Para reactivar, restaurar el retorno del JSX.
 */
export function RoleSwitcher() {
  // Mantenemos el hook por si el Context requiere que sus suscriptores estén activos,
  // pero no declaramos variables que no usemos para evitar warnings de TS.
  useApp();

  // Al retornar null, el componente no ocupa espacio ni recursos en la UI.
  return null;
}