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

    const payload = {
      jsonrpc: '2.0',
      method: 'createTask',
      id: 1,
      params: {
        project_id,
        title,
        description: description || '',
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch (_) {}

    if (!response.ok || (json && json.error)) {
      const message = (json && json.error && (json.error.message || JSON.stringify(json.error))) || `HTTP ${response.status}`;
      return new Response(
        JSON.stringify({ error: message }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, result: json?.result ?? null }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || 'Unexpected error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
