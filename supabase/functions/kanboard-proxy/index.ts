
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Encryption helpers for decrypting stored credentials (AES-GCM with base64 fields)
const ENC_KEY_B64 = Deno.env.get('INTEGRATIONS_ENC_KEY') || '';

function b64ToBytes(b64: string): Uint8Array {
  try {
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } catch {
    return new Uint8Array();
  }
}

async function importAesKey(b64: string): Promise<CryptoKey> {
  const raw = b64ToBytes(b64);
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']);
}

async function decryptField(cipherB64?: string | null, ivB64?: string | null): Promise<string | null> {
  if (!cipherB64 || !ivB64 || !ENC_KEY_B64) return null;
  try {
    const key = await importAesKey(ENC_KEY_B64);
    const iv = b64ToBytes(ivB64);
    const cipher = b64ToBytes(cipherB64);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description = '', project_id = 1 } = await req.json();

    if (!title || typeof title !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing required field: title' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' },
        },
      }
    );

    const { data: integration, error: intError } = await supabase
      .from('integrations')
      .select('*')
      .eq('type', 'kanboard')
      .single();

    if (intError || !integration) {
      return new Response(
        JSON.stringify({ error: 'Kanboard integration not configured for this user.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const baseUrl = (integration.url || '').toString().trim();
    const apiKey = (integration.api_key || '').toString().trim();
    const username = (integration.username || '').toString().trim();
    const password = (integration.password || '').toString().trim();

    // Try to decrypt encrypted fields if present and key is configured
    let decApiKey = apiKey;
    let decPassword = password;
    try {
      const decApi = await decryptField(integration.encrypted_api_key, integration.encrypted_api_key_iv);
      const decPass = await decryptField(integration.encrypted_password, integration.encrypted_password_iv);
      if (decApi) decApiKey = decApi;
      if (decPass) decPassword = decPass;
    } catch (_e) {
      // Ignore decryption errors and fall back to plaintext fields
    }

    if (!baseUrl) {
      return new Response(
        JSON.stringify({ error: 'Kanboard URL is missing in the integration.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

// Using either API key or username/password; will validate later

    const endpoint = baseUrl.endsWith('/jsonrpc.php')
      ? baseUrl
      : `${baseUrl.replace(/\/$/, '')}/jsonrpc.php`;

    // Build HTTP Basic auth per Kanboard docs
    let authUser = 'jsonrpc';
    let authPass = decApiKey;

    if (username) {
      // Prefer user credentials: password or personal access token (api_key)
      authUser = username;
      authPass = decPassword || decApiKey;
    }

    if (!authPass) {
      return new Response(
        JSON.stringify({ error: 'Kanboard credentials missing: provide api_key or password' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const payload = {
      jsonrpc: '2.0',
      method: 'createTask',
      id: 1,
      params: {
        title,
        description: description || '',
        project_id,
      },
    };

    console.log('Sending request to Kanboard:', { endpoint, method: 'createTask', project_id, authMode: username ? 'user' : 'application' });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TaskManager/1.0',
        'Authorization': 'Basic ' + btoa(`${authUser}:${authPass}`),
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log('Kanboard response:', { status: response.status, body: text });

    let json: any = null;
    try { 
      json = JSON.parse(text); 
    } catch (parseError) {
      console.error('Failed to parse Kanboard response:', parseError);
      return new Response(
        JSON.stringify({ error: `Invalid JSON response from Kanboard: ${text}` }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!response.ok) {
      console.error('Kanboard HTTP error:', response.status, text);
      return new Response(
        JSON.stringify({ error: `Kanboard HTTP ${response.status}: ${text}` }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (json && json.error) {
      console.error('Kanboard JSON-RPC error:', json.error);
      const errorMessage = json.error.message || JSON.stringify(json.error);
      return new Response(
        JSON.stringify({ error: `Kanboard error: ${errorMessage}` }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Successfully created task in Kanboard:', json?.result);

    return new Response(
      JSON.stringify({ success: true, result: json?.result ?? null }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (e: any) {
    console.error('Edge function error:', e);
    return new Response(
      JSON.stringify({ error: e?.message || 'Unexpected error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
