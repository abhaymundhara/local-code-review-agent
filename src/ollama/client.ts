/**
 * Ollama HTTP client
 * Talks to a locally running Ollama instance (default: http://localhost:11434)
 * No cloud, no auth, no latency beyond your own machine.
 * Built by SureThing.
 */

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    num_ctx?: number;
  };
}

export interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Generate a completion from a prompt.
   */
  async generate(request: OllamaGenerateRequest): Promise<OllamaGenerateResponse> {
    const response = await this.fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, stream: false }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama API error ${response.status}: ${text}`);
    }

    return response.json() as Promise<OllamaGenerateResponse>;
  }

  /**
   * List available models.
   */
  async listModels(): Promise<OllamaModel[]> {
    const response = await this.fetch('/api/tags');
    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.status}`);
    }
    const data = (await response.json()) as { models: OllamaModel[] };
    return data.models ?? [];
  }

  /**
   * Check if Ollama is running and the specified model is available.
   */
  async healthCheck(model: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const models = await this.listModels();
      const available = models.map((m) => m.name.split(':')[0]);
      const modelBase = model.split(':')[0];

      if (!available.includes(modelBase)) {
        return {
          ok: false,
          error: `Model "${model}" not found. Available: ${available.join(', ')}\nRun: ollama pull ${model}`,
        };
      }
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: `Ollama not running or unreachable at ${this.baseUrl}\nStart it with: ollama serve`,
      };
    }
  }

  private fetch(path: string, init?: RequestInit): Promise<Response> {
    return fetch(`${this.baseUrl}${path}`, init);
  }
}
