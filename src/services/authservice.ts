import { supabase } from '../lib/supabase.ts';

/**
 * Registra un nuevo usuario, crea su empresa y lo asigna como administrador.
 */
export const registerOwnerAndCompany = async (
  email: string, 
  password: string, 
  fullName: string, 
  companyName: string
) => {
  // 1. Registro en Supabase Auth
  // Esto dispara automáticamente el trigger que crea la fila en 'profiles'
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName } // El trigger usa este metadato
    }
  });

  if (authError) throw authError;
  const userId = authData.user?.id;

  if (userId) {
    // 2. Crear la Empresa (Tenant)
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([
        { 
          name: companyName, 
          created_by: userId 
        }
      ])
      .select()
      .single();

    if (companyError) throw companyError;

    // 3. Crear la membresía como 'company_admin'
    // Esto es vital para que las políticas de RLS de Storage funcionen
    const { error: membershipError } = await supabase
      .from('company_memberships')
      .insert([
        {
          company_id: company.id,
          user_id: userId,
          role: 'company_admin',
          status: 'active'
        }
      ]);

    if (membershipError) throw membershipError;

    return { user: authData.user, company };
  }
};