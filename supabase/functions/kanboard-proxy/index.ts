
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    if (!baseUrl) {
      return new Response(
        JSON.stringify({ error: 'Kanboard URL is missing in the integration.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Kanboard API key is missing in the integration.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const endpoint = baseUrl.endsWith('/jsonrpc.php')
      ? baseUrl
      : `${baseUrl.replace(/\/$/, '')}/jsonrpc.php`;

    // Build HTTP Basic auth per Kanboard docs
    let authUser = 'jsonrpc';
    let authPass = apiKey;

    if (username) {
      // Prefer user credentials: password or personal access token (api_key)
      authUser = username;
      authPass = password || apiKey;
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
