// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { name,email,idPais,idProvincia,direccion,celular,telefono,fechaNacimiento,idTipo,pass,Apellido1,Apellido2 } = await req.json()
  

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const adminAuthClient = supabaseClient.auth.admin;


    const { data, error } = await adminAuthClient.createUser({
      email: email,
      password: pass,
      email_confirm: true
    });

    if (error) throw error

    if(data.user.id){
      const { data: miembro, error: errorMiembro } = await supabaseClient
      .from('Miembros')
      .insert(
          {
          idauth: data.user.id,
          Nombre: name,
          Email: email,
          idPais: Number(idPais),
          idProvincia: Number(idProvincia),
          Direccion: direccion,
          Celular: celular,
          Telefono: telefono,
          Apellido1: Apellido1,
          Apellido2: Apellido2,
          FechaNacimiento: new Date(fechaNacimiento),
          idTipo: Number(idTipo),
          }
      );
      if (errorMiembro) {
          throw new Error(errorMiembro);
      }
    }


    return new Response(JSON.stringify({ ok: 'si'  }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.log('error',error);
    return new Response(JSON.stringify({ error: error }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
