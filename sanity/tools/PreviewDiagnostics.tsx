'use client';

import {useCallback, useEffect, useState} from 'react';

type CheckStatus = 'running' | 'pass' | 'warn' | 'fail';

type Check = {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
};

type DiagnosticsResponse = {
  status: 'ok' | 'degraded';
  projectId: string;
  dataset: string;
  siteUrl: string;
  checks: {
    publicQuery: {ok: boolean; error: string | null};
    tokenConfigured: {ok: boolean};
    authenticatedQuery: {ok: boolean; error: string | null};
    writeTokenConfigured?: {ok: boolean};
  };
  deployment: {commit: string | null; environment: string};
};

const statusLabel: Record<CheckStatus, string> = {
  running: 'Validando',
  pass: 'OK',
  warn: 'Atenção',
  fail: 'Falhou',
};

export function PreviewDiagnostics() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(false);

  const run = useCallback(async () => {
    setRunning(true);
    const nextChecks: Check[] = [];

    try {
      const response = await fetch('/api/preview/diagnostics', {cache: 'no-store'});
      const server = (await response.json()) as DiagnosticsResponse;

      nextChecks.push({
        id: 'app',
        label: 'Aplicação / API de diagnóstico',
        status: response.ok || response.status === 503 ? 'pass' : 'fail',
        detail: `HTTP ${response.status} · ${server.deployment.environment} · commit ${server.deployment.commit || 'indisponível'}`,
      });

      nextChecks.push({
        id: 'public-sanity',
        label: 'Sanity Content Lake (consulta pública)',
        status: server.checks.publicQuery.ok ? 'pass' : 'fail',
        detail: server.checks.publicQuery.ok
          ? `Projeto ${server.projectId} / dataset ${server.dataset}`
          : server.checks.publicQuery.error || 'Falha na consulta pública.',
      });

      nextChecks.push({
        id: 'token',
        label: 'SANITY_API_READ_TOKEN na Vercel',
        status: server.checks.tokenConfigured.ok ? 'pass' : 'fail',
        detail: server.checks.tokenConfigured.ok
          ? 'Token Viewer privado presente no deployment.'
          : 'Token de leitura ausente no ambiente da Vercel.',
      });

      nextChecks.push({
        id: 'auth-sanity',
        label: 'Permissão do token para leitura de drafts',
        status: server.checks.authenticatedQuery.ok ? 'pass' : 'fail',
        detail: server.checks.authenticatedQuery.ok
          ? 'Consulta autenticada ao Content Lake concluída.'
          : server.checks.authenticatedQuery.error || 'Falha na consulta autenticada.',
      });

      nextChecks.push({
        id: 'write-token',
        label: 'Visual Builder · token de escrita',
        status: server.checks.writeTokenConfigured?.ok ? 'pass' : 'warn',
        detail: server.checks.writeTokenConfigured?.ok
          ? 'SANITY_API_WRITE_TOKEN está configurado somente no servidor.'
          : 'Adicione SANITY_API_WRITE_TOKEN na Vercel para edição inline, drag-and-drop e troca de imagens.',
      });

      const expectedOrigin = new URL(server.siteUrl).origin;
      const currentOrigin = window.location.origin;
      nextChecks.push({
        id: 'origin',
        label: 'Origin do Studio / Preview',
        status: expectedOrigin === currentOrigin ? 'pass' : 'warn',
        detail:
          expectedOrigin === currentOrigin
            ? expectedOrigin
            : `Studio em ${currentOrigin}; preview configurado para ${expectedOrigin}`,
      });

      const sanityApiUrl = `https://${server.projectId}.api.sanity.io/v2026-09-01/data/query/${server.dataset}?query=${encodeURIComponent('count(*)')}`;
      try {
        const corsResponse = await fetch(sanityApiUrl, {
          credentials: 'include',
          cache: 'no-store',
        });
        nextChecks.push({
          id: 'cors',
          label: 'CORS do Sanity com credentials',
          status: corsResponse.ok ? 'pass' : 'fail',
          detail: corsResponse.ok
            ? `Browser autorizado pelo Sanity (HTTP ${corsResponse.status}).`
            : `Sanity respondeu HTTP ${corsResponse.status}. Verifique CORS Origin + Allow credentials.`,
        });
      } catch (error) {
        nextChecks.push({
          id: 'cors',
          label: 'CORS do Sanity com credentials',
          status: 'fail',
          detail: error instanceof Error ? error.message : 'Falha de CORS no navegador.',
        });
      }

      try {
        const previewResponse = await fetch('/api/draft-mode/enable', {
          cache: 'no-store',
          redirect: 'manual',
        });
        const reachable = previewResponse.status === 0 || previewResponse.status < 500;
        nextChecks.push({
          id: 'draft-route',
          label: 'Endpoint de Draft Mode',
          status: reachable ? 'pass' : 'fail',
          detail: reachable
            ? `Endpoint respondeu (HTTP ${previewResponse.status || 'redirect'}). A ativação real exige o secret gerado pelo Presentation Tool.`
            : `Endpoint respondeu HTTP ${previewResponse.status}.`,
        });
      } catch (error) {
        nextChecks.push({
          id: 'draft-route',
          label: 'Endpoint de Draft Mode',
          status: 'fail',
          detail: error instanceof Error ? error.message : 'Não foi possível acessar o endpoint de Draft Mode.',
        });
      }
    } catch (error) {
      nextChecks.push({
        id: 'fatal',
        label: 'Diagnóstico do preview',
        status: 'fail',
        detail: error instanceof Error ? error.message : 'Erro inesperado ao executar diagnóstico.',
      });
    }

    setChecks(nextChecks);
    setRunning(false);
  }, []);

  useEffect(() => {
    void run();
  }, [run]);

  const failures = checks.filter((check) => check.status === 'fail').length;

  return (
    <main style={{padding: 32, maxWidth: 980, margin: '0 auto', fontFamily: 'system-ui, sans-serif'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24}}>
        <div>
          <h1 style={{fontSize: 28, margin: 0}}>Diagnóstico do editor visual</h1>
          <p style={{opacity: 0.72, marginTop: 8}}>
            Valida Vercel, Content Lake, tokens, CORS, Draft Mode e prontidão do Visual Builder sem expor credenciais.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void run()}
          disabled={running}
          style={{padding: '10px 16px', borderRadius: 8, border: '1px solid #666', cursor: running ? 'wait' : 'pointer'}}
        >
          {running ? 'Validando…' : 'Executar novamente'}
        </button>
      </div>

      {!running && checks.length > 0 && (
        <div style={{padding: 16, borderRadius: 10, marginBottom: 20, border: '1px solid #555'}}>
          <strong>{failures === 0 ? 'Todas as validações obrigatórias passaram.' : `${failures} validação(ões) obrigatória(s) falharam.`}</strong>
          <div style={{marginTop: 6, opacity: 0.72}}>
            Itens em Atenção são recursos opcionais ou ainda não configurados; itens em Falhou bloqueiam o Editor visual.
          </div>
        </div>
      )}

      <div style={{display: 'grid', gap: 12}}>
        {(running && checks.length === 0
          ? [{id: 'running', label: 'Executando validações', status: 'running' as CheckStatus, detail: 'Aguarde alguns segundos…'}]
          : checks
        ).map((check) => (
          <section key={check.id} style={{padding: 18, borderRadius: 10, border: '1px solid #444'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center'}}>
              <strong>{check.label}</strong>
              <span style={{fontWeight: 700}}>{statusLabel[check.status]}</span>
            </div>
            <div style={{marginTop: 8, opacity: 0.72, overflowWrap: 'anywhere'}}>{check.detail}</div>
          </section>
        ))}
      </div>
    </main>
  );
}
