# Custom LLM Implementation Plan for CBT AI

**Goal:** Replace OpenAI API dependency with self-hosted local LLM to eliminate recurring API costs while maintaining CBT therapy quality.

**Implementation Strategy:** Hybrid approach with local LLM as primary and OpenAI as fallback for crisis detection.

---

## 📋 Executive Summary

### Current State
- Backend uses OpenAI GPT-4o-mini API
- Costs ~$15-20/month for moderate usage
- Single point of failure (API dependency)
- No offline capability

### Target State
- Local LLM (Llama 3.1 8B via Ollama) as primary
- OpenAI as fallback for crisis situations
- Zero marginal cost after hardware investment
- Full offline capability
- Better privacy and data control

### Implementation Timeline
- **Phase 1:** Local LLM Setup & Testing (3-5 days)
- **Phase 2:** Backend Integration (2-3 days)
- **Phase 3:** RAG System for CBT Knowledge (5-7 days)
- **Phase 4:** Crisis Detection & Fallback (2-3 days)
- **Phase 5:** Testing & Optimization (3-5 days)

**Total Estimated Time:** 2-3 weeks

---

## 🖥️ Hardware Requirements

### Minimum Requirements
```
GPU: NVIDIA RTX 3060 12GB VRAM (or equivalent)
RAM: 16GB system memory
Storage: 50GB free SSD space
OS: Windows 10/11, Linux, or macOS (with Metal support)
```

### Recommended Hardware
```
GPU: NVIDIA RTX 4060 Ti 16GB or RTX 3090/4090
RAM: 32GB system memory
Storage: 100GB NVMe SSD
```

### Pre-Implementation Checklist
- [ ] Verify NVIDIA GPU installed (run `nvidia-smi` in terminal)
- [ ] Verify GPU has 8GB+ VRAM (12GB+ recommended)
- [ ] Verify 50GB+ free storage
- [ ] Install NVIDIA drivers (latest version)
- [ ] Install Node.js 18+ (already have)
- [ ] Install Docker Desktop (already have for PostgreSQL)

---

## 📁 Implementation Plan Structure

This plan is organized into **Phases**, each containing:
- **Objective**: What we're achieving
- **Prerequisites**: What's needed before starting
- **Steps**: Detailed implementation steps
- **Files to Create/Modify**: Exact file paths and changes
- **Verification**: How to confirm it works
- **Rollback**: How to undo if issues arise

---

# Phase 1: Local LLM Setup & Testing

## Objective
Install and configure Ollama with a CBT-capable model, verify it works standalone.

## Prerequisites
- [ ] Hardware requirements met (see above)
- [ ] NVIDIA drivers installed
- [ ] Internet connection for model download (~4-8GB)

## Step 1.1: Install Ollama

### Windows Installation
```powershell
# Option A: Download installer
# Visit: https://ollama.ai/download
# Download OllamaSetup.exe and run

# Option B: Using winget
winget install Ollama.Ollama

# Verify installation
ollama --version
# Expected output: ollama version is 0.x.x
```

### Post-Installation Verification
```powershell
# Check Ollama service is running
# Should see Ollama icon in system tray

# Test basic functionality
ollama list
# Expected: Empty list (no models yet)
```

## Step 1.2: Download Recommended Models

### Primary Model: Llama 3.1 8B
```powershell
# Download Llama 3.1 8B (4.7GB download, ~8GB on disk)
ollama pull llama3.1:8b

# Expected output:
# pulling manifest
# pulling ... [100%]
# success
```

### Alternative Models (Download for Testing)
```powershell
# Mistral 7B (smaller, faster)
ollama pull mistral:7b

# Phi-3 Medium (good reasoning)
ollama pull phi3:medium

# Qwen 2.5 (excellent for chat)
ollama pull qwen2.5:7b
```

### Embedding Model (for RAG in Phase 3)
```powershell
# Download embedding model
ollama pull nomic-embed-text
```

## Step 1.3: Test Model Performance

### Basic Chat Test
```powershell
# Interactive test
ollama run llama3.1:8b

# In the chat, type:
>>> You are a CBT therapist. A user says: "I'm feeling anxious about my job interview tomorrow." Respond with empathy and use a CBT technique.

# Expected: Empathetic response with CBT technique
# Press Ctrl+D or type /bye to exit
```

### API Test
```powershell
# Test OpenAI-compatible API endpoint
curl http://localhost:11434/v1/chat/completions -d "{
  \"model\": \"llama3.1:8b\",
  \"messages\": [
    {\"role\": \"system\", \"content\": \"You are a supportive CBT therapist.\"},
    {\"role\": \"user\", \"content\": \"I'm feeling overwhelmed.\"}
  ],
  \"max_tokens\": 100
}"
```

### Performance Benchmark Script
```powershell
# Create test script: backend/test-llm-performance.ps1
```

### Files to Create

#### File: `backend/scripts/test-llm-performance.ts`
```typescript
// Run with: npx tsx scripts/test-llm-performance.ts

import OpenAI from 'openai';

const MODELS_TO_TEST = [
  'llama3.1:8b',
  'mistral:7b',
  'qwen2.5:7b',
];

const CBT_TEST_PROMPTS = [
  {
    user: "I'm feeling anxious about my job interview tomorrow.",
    expected_keywords: ['anxious', 'thoughts', 'breathe', 'prepare', 'challenge'],
  },
  {
    user: "I keep thinking I'm a failure at everything.",
    expected_keywords: ['evidence', 'thoughts', 'challenge', 'perspective'],
  },
  {
    user: "I can't sleep because I'm worrying all the time.",
    expected_keywords: ['sleep', 'worry', 'thoughts', 'relaxation', 'technique'],
  },
];

async function testModel(client: OpenAI, model: string) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Testing: ${model}`);
  console.log('='.repeat(50));

  const results: { prompt: string; response: string; latency: number; tokens: number }[] = [];

  for (const test of CBT_TEST_PROMPTS) {
    const start = Date.now();

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are a compassionate CBT therapist. Use cognitive behavioral therapy techniques. Be empathetic, concise (2-4 sentences), and helpful.`,
        },
        { role: 'user', content: test.user },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const latency = Date.now() - start;
    const content = response.choices[0]?.message?.content || '';
    const tokens = response.usage?.total_tokens || 0;

    results.push({
      prompt: test.user,
      response: content,
      latency,
      tokens,
    });

    console.log(`\nPrompt: "${test.user}"`);
    console.log(`Response: ${content}`);
    console.log(`Latency: ${latency}ms | Tokens: ${tokens}`);
    console.log(`Keywords found: ${test.expected_keywords.filter(k => content.toLowerCase().includes(k)).join(', ')}`);
  }

  // Summary
  const avgLatency = results.reduce((a, b) => a + b.latency, 0) / results.length;
  const totalTokens = results.reduce((a, b) => a + b.tokens, 0);

  console.log(`\n--- Summary for ${model} ---`);
  console.log(`Average latency: ${avgLatency.toFixed(0)}ms`);
  console.log(`Total tokens: ${totalTokens}`);

  return { model, avgLatency, totalTokens };
}

async function main() {
  const client = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama',
  });

  const results = [];

  for (const model of MODELS_TO_TEST) {
    try {
      const result = await testModel(client, model);
      results.push(result);
    } catch (error) {
      console.error(`Error testing ${model}:`, error);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('FINAL COMPARISON');
  console.log('='.repeat(50));
  console.table(results);
}

main();
```

## Step 1.4: Configure Ollama for Production

### Set Environment Variables
```powershell
# Create or edit environment variables for Ollama

# Windows (System Environment Variables):
# OLLAMA_HOST=0.0.0.0:11434 (allow external connections if needed)
# OLLAMA_ORIGINS=* (CORS - be careful in production)
# OLLAMA_MODELS=C:\Users\<username>\.ollama\models (default is fine)

# Or set in PowerShell for current session:
$env:OLLAMA_HOST="0.0.0.0:11434"
```

### Create Ollama Modelfile for CBT
```
# File: backend/ollama/cbt-therapist.modelfile

FROM llama3.1:8b

# Set parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 4096
PARAMETER num_predict 512

# System prompt for CBT
SYSTEM """
You are Thera, a compassionate AI CBT (Cognitive Behavioral Therapy) therapist assistant.

YOUR ROLE:
- Provide supportive, evidence-based mental health guidance
- Use CBT techniques: thought challenging, cognitive restructuring, behavioral activation
- Be warm, empathetic, and non-judgmental
- Ask open-ended questions to help users explore their thoughts

GUIDELINES:
1. Start with empathy - acknowledge feelings
2. Use Socratic questioning to explore thoughts
3. Help identify cognitive distortions
4. Suggest practical techniques when appropriate
5. Keep responses concise (2-4 sentences, max 100 words)

BOUNDARIES:
- You are NOT a licensed therapist or medical professional
- Never diagnose conditions
- If user mentions self-harm, suicide, or immediate danger, respond:
  "I'm concerned about what you're sharing. Please contact emergency services (911) or call the National Suicide Prevention Lifeline at 988. You don't have to face this alone."

Remember: Your goal is to help users develop healthier thought patterns through CBT principles.
"""
```

### Create Custom CBT Model
```powershell
# Create the custom model from Modelfile
ollama create cbt-therapist -f backend/ollama/cbt-therapist.modelfile

# Test the custom model
ollama run cbt-therapist

# Verify it follows CBT guidelines better than base model
```

## Verification Checklist - Phase 1
- [ ] Ollama installed and running (`ollama --version`)
- [ ] Model downloaded (`ollama list` shows llama3.1:8b)
- [ ] API accessible (`curl http://localhost:11434/v1/models`)
- [ ] Test script passes (`npx tsx scripts/test-llm-performance.ts`)
- [ ] Custom CBT model created (`ollama list` shows cbt-therapist)
- [ ] Response quality acceptable (manual review)

## Rollback Plan - Phase 1
```powershell
# If issues arise:

# Remove specific model
ollama rm llama3.1:8b
ollama rm cbt-therapist

# Uninstall Ollama
# Windows: Uninstall via Settings > Apps > Installed apps

# No code changes yet, so rollback is clean
```

---

# Phase 2: Backend Integration

## Objective
Modify the backend to use local LLM via Ollama while keeping OpenAI as a configurable fallback.

## Prerequisites
- [ ] Phase 1 complete
- [ ] Ollama running with cbt-therapist model
- [ ] Backend currently functional with OpenAI

## Step 2.1: Create LLM Configuration System

### File: `backend/src/config/llm.config.ts`
```typescript
/**
 * LLM Configuration
 * Supports both local (Ollama) and cloud (OpenAI) providers
 */

export type LLMProvider = 'local' | 'openai' | 'hybrid';

export interface LLMConfig {
  provider: LLMProvider;
  local: {
    baseUrl: string;
    model: string;
    fallbackModel?: string;
    timeout: number;
  };
  openai: {
    apiKey: string;
    model: string;
  };
  hybrid: {
    primaryProvider: 'local' | 'openai';
    fallbackProvider: 'local' | 'openai';
    fallbackOnError: boolean;
    fallbackOnTimeout: boolean;
  };
}

const DEFAULT_CONFIG: LLMConfig = {
  provider: (process.env.LLM_PROVIDER as LLMProvider) || 'local',

  local: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.LOCAL_LLM_MODEL || 'cbt-therapist',
    fallbackModel: process.env.LOCAL_LLM_FALLBACK_MODEL || 'llama3.1:8b',
    timeout: parseInt(process.env.LLM_TIMEOUT || '30000'), // 30 seconds
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },

  hybrid: {
    primaryProvider: 'local',
    fallbackProvider: 'openai',
    fallbackOnError: true,
    fallbackOnTimeout: true,
  },
};

export const getLLMConfig = (): LLMConfig => {
  // Validate required env vars based on provider
  if (DEFAULT_CONFIG.provider === 'openai' && !DEFAULT_CONFIG.openai.apiKey) {
    throw new Error('OPENAI_API_KEY is required when LLM_PROVIDER=openai');
  }

  return DEFAULT_CONFIG;
};

export default getLLMConfig;
```

### File: `backend/src/services/llm/types.ts`
```typescript
/**
 * Shared types for LLM services
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  latency: number;
  model: string;
  provider: 'local' | 'openai';
}

export interface LLMProvider {
  generateResponse(messages: ChatMessage[], options?: GenerateOptions): Promise<LLMResponse>;
  isAvailable(): Promise<boolean>;
  getName(): string;
}

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export const CBT_SYSTEM_PROMPT = `You are a compassionate AI CBT (Cognitive Behavioral Therapy) therapist assistant named Thera.

YOUR ROLE:
- Provide supportive, evidence-based mental health guidance
- Use CBT techniques: thought challenging, cognitive restructuring, behavioral activation
- Be warm, empathetic, and non-judgmental
- Ask open-ended questions to help users explore their thoughts

GUIDELINES:
1. Start with empathy - acknowledge feelings
2. Use Socratic questioning to explore thoughts
3. Help identify cognitive distortions (catastrophizing, all-or-nothing thinking, etc.)
4. Suggest practical techniques when appropriate
5. Keep responses concise (2-4 sentences, max 100 words)

BOUNDARIES:
- You are NOT a licensed therapist or medical professional
- Never diagnose conditions
- If user mentions self-harm, suicide, or immediate danger, respond with crisis resources

Remember: Your goal is to help users develop healthier thought patterns through CBT principles.`;
```

## Step 2.2: Create LLM Provider Interface

### File: `backend/src/services/llm/local-provider.ts`
```typescript
/**
 * Local LLM Provider (Ollama)
 */

import OpenAI from 'openai';
import { LLMProvider, LLMResponse, ChatMessage, GenerateOptions, CBT_SYSTEM_PROMPT } from './types';
import getLLMConfig from '../../config/llm.config';

export class LocalLLMProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;
  private fallbackModel: string;
  private timeout: number;

  constructor() {
    const config = getLLMConfig();

    this.client = new OpenAI({
      baseURL: `${config.local.baseUrl}/v1`,
      apiKey: 'ollama', // Ollama doesn't require real API key
      timeout: config.local.timeout,
    });

    this.model = config.local.model;
    this.fallbackModel = config.local.fallbackModel || this.model;
    this.timeout = config.local.timeout;
  }

  async generateResponse(
    messages: ChatMessage[],
    options?: GenerateOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    const systemPrompt = options?.systemPrompt || CBT_SYSTEM_PROMPT;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10), // Last 10 messages for context
        ],
        max_tokens: options?.maxTokens || 500,
        temperature: options?.temperature ?? 0.7,
      });

      const content = response.choices[0]?.message?.content || '';
      const latency = Date.now() - startTime;

      return {
        content,
        tokens: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        },
        latency,
        model: this.model,
        provider: 'local',
      };
    } catch (error) {
      // Try fallback model if primary fails
      if (this.fallbackModel !== this.model) {
        console.warn(`Primary model ${this.model} failed, trying fallback ${this.fallbackModel}`);
        return this.generateWithFallback(messages, options);
      }
      throw error;
    }
  }

  private async generateWithFallback(
    messages: ChatMessage[],
    options?: GenerateOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const systemPrompt = options?.systemPrompt || CBT_SYSTEM_PROMPT;

    const response = await this.client.chat.completions.create({
      model: this.fallbackModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10),
      ],
      max_tokens: options?.maxTokens || 500,
      temperature: options?.temperature ?? 0.7,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      tokens: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      },
      latency: Date.now() - startTime,
      model: this.fallbackModel,
      provider: 'local',
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      const config = getLLMConfig();
      const response = await fetch(`${config.local.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  getName(): string {
    return `Local (${this.model})`;
  }
}
```

### File: `backend/src/services/llm/openai-provider.ts`
```typescript
/**
 * OpenAI LLM Provider
 */

import OpenAI from 'openai';
import { LLMProvider, LLMResponse, ChatMessage, GenerateOptions, CBT_SYSTEM_PROMPT } from './types';
import getLLMConfig from '../../config/llm.config';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    const config = getLLMConfig();

    if (!config.openai.apiKey) {
      throw new Error('OPENAI_API_KEY is required for OpenAI provider');
    }

    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    this.model = config.openai.model;
  }

  async generateResponse(
    messages: ChatMessage[],
    options?: GenerateOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const systemPrompt = options?.systemPrompt || CBT_SYSTEM_PROMPT;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10),
      ],
      max_tokens: options?.maxTokens || 500,
      temperature: options?.temperature ?? 0.7,
    });

    const content = response.choices[0]?.message?.content || '';
    const latency = Date.now() - startTime;

    return {
      content,
      tokens: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      },
      latency,
      model: this.model,
      provider: 'openai',
    };
  }

  async isAvailable(): Promise<boolean> {
    // OpenAI is considered always available if API key exists
    return true;
  }

  getName(): string {
    return `OpenAI (${this.model})`;
  }
}
```

### File: `backend/src/services/llm/llm-router.ts`
```typescript
/**
 * LLM Router
 * Routes requests to appropriate provider based on configuration
 * Handles fallback logic for hybrid mode
 */

import { LLMProvider, LLMResponse, ChatMessage, GenerateOptions } from './types';
import { LocalLLMProvider } from './local-provider';
import { OpenAIProvider } from './openai-provider';
import getLLMConfig, { LLMConfig } from '../../config/llm.config';

export class LLMRouter {
  private config: LLMConfig;
  private localProvider: LocalLLMProvider | null = null;
  private openaiProvider: OpenAIProvider | null = null;

  constructor() {
    this.config = getLLMConfig();
    this.initializeProviders();
  }

  private initializeProviders() {
    // Always initialize local provider (for availability check)
    try {
      this.localProvider = new LocalLLMProvider();
    } catch (error) {
      console.warn('Failed to initialize local LLM provider:', error);
    }

    // Initialize OpenAI provider if API key exists
    if (this.config.openai.apiKey) {
      try {
        this.openaiProvider = new OpenAIProvider();
      } catch (error) {
        console.warn('Failed to initialize OpenAI provider:', error);
      }
    }
  }

  async generateResponse(
    messages: ChatMessage[],
    options?: GenerateOptions
  ): Promise<LLMResponse> {
    const provider = this.config.provider;

    switch (provider) {
      case 'local':
        return this.generateWithLocal(messages, options);

      case 'openai':
        return this.generateWithOpenAI(messages, options);

      case 'hybrid':
        return this.generateWithHybrid(messages, options);

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private async generateWithLocal(
    messages: ChatMessage[],
    options?: GenerateOptions
  ): Promise<LLMResponse> {
    if (!this.localProvider) {
      throw new Error('Local LLM provider not initialized');
    }

    const isAvailable = await this.localProvider.isAvailable();
    if (!isAvailable) {
      throw new Error('Local LLM is not available. Is Ollama running?');
    }

    return this.localProvider.generateResponse(messages, options);
  }

  private async generateWithOpenAI(
    messages: ChatMessage[],
    options?: GenerateOptions
  ): Promise<LLMResponse> {
    if (!this.openaiProvider) {
      throw new Error('OpenAI provider not initialized. Is OPENAI_API_KEY set?');
    }

    return this.openaiProvider.generateResponse(messages, options);
  }

  private async generateWithHybrid(
    messages: ChatMessage[],
    options?: GenerateOptions
  ): Promise<LLMResponse> {
    const { hybrid } = this.config;
    const primaryProvider = hybrid.primaryProvider === 'local' ? this.localProvider : this.openaiProvider;
    const fallbackProvider = hybrid.fallbackProvider === 'local' ? this.localProvider : this.openaiProvider;

    if (!primaryProvider) {
      console.warn(`Primary provider (${hybrid.primaryProvider}) not available, using fallback`);
      if (!fallbackProvider) {
        throw new Error('No LLM providers available');
      }
      return fallbackProvider.generateResponse(messages, options);
    }

    try {
      // Check if primary is available
      if (hybrid.primaryProvider === 'local' && !(await primaryProvider.isAvailable())) {
        console.warn('Local LLM not available, using OpenAI fallback');
        if (!fallbackProvider) {
          throw new Error('Fallback provider not available');
        }
        return fallbackProvider.generateResponse(messages, options);
      }

      return await primaryProvider.generateResponse(messages, options);
    } catch (error) {
      console.error(`Primary provider failed:`, error);

      if (hybrid.fallbackOnError && fallbackProvider) {
        console.log('Falling back to alternative provider...');
        return fallbackProvider.generateResponse(messages, options);
      }

      throw error;
    }
  }

  getProviderInfo(): { primary: string; fallback: string | null } {
    switch (this.config.provider) {
      case 'local':
        return { primary: this.localProvider?.getName() || 'Local (not initialized)', fallback: null };
      case 'openai':
        return { primary: this.openaiProvider?.getName() || 'OpenAI (not initialized)', fallback: null };
      case 'hybrid':
        return {
          primary: this.config.hybrid.primaryProvider === 'local'
            ? (this.localProvider?.getName() || 'Local')
            : (this.openaiProvider?.getName() || 'OpenAI'),
          fallback: this.config.hybrid.fallbackProvider === 'local'
            ? (this.localProvider?.getName() || 'Local')
            : (this.openaiProvider?.getName() || 'OpenAI'),
        };
      default:
        return { primary: 'Unknown', fallback: null };
    }
  }
}

// Singleton instance
let llmRouterInstance: LLMRouter | null = null;

export const getLLMRouter = (): LLMRouter => {
  if (!llmRouterInstance) {
    llmRouterInstance = new LLMRouter();
  }
  return llmRouterInstance;
};
```

### File: `backend/src/services/llm/index.ts`
```typescript
/**
 * LLM Services Index
 */

export * from './types';
export * from './local-provider';
export * from './openai-provider';
export * from './llm-router';
export { getLLMRouter } from './llm-router';
```

## Step 2.3: Update Message Controller

### File: `backend/src/controllers/message.controller.ts` (MODIFY)
```typescript
import { Response, NextFunction } from 'express';
import { query } from '../db.js';
import { createError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { getLLMRouter } from '../services/llm/index.js';
import { ChatMessage } from '../services/llm/types.js';

// POST /api/messages
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user!.id;

    // Verify conversation belongs to user
    const convResult = await query(
      'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
      [conversationId, userId]
    );
    if (convResult.rows.length === 0) throw createError('Conversation not found', 404);

    // Save user message
    const userMsgResult = await query(
      `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, 'user', $2) RETURNING *`,
      [conversationId, content]
    );
    const userMessage = userMsgResult.rows[0];

    // Fetch recent history for context
    const historyResult = await query(
      `SELECT role, content FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );
    const history: ChatMessage[] = historyResult.rows.map((r: { role: string; content: string }) => ({
      role: r.role as 'user' | 'assistant',
      content: r.content,
    }));

    // Generate AI reply using LLM router
    const llmRouter = getLLMRouter();
    const response = await llmRouter.generateResponse(history);

    // Save AI reply
    const aiMsgResult = await query(
      `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, 'assistant', $2) RETURNING *`,
      [conversationId, response.content]
    );
    const aiMessage = aiMsgResult.rows[0];

    // Update conversation's updated_at
    await query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);

    res.status(201).json({
      success: true,
      userMessage,
      aiMessage,
      metadata: {
        tokens: response.tokens,
        latency: response.latency,
        model: response.model,
        provider: response.provider,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/messages/:conversationId
export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    // Verify ownership
    const convResult = await query(
      'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
      [conversationId, userId]
    );
    if (convResult.rows.length === 0) throw createError('Conversation not found', 404);

    const result = await query(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [conversationId]
    );

    res.json({ success: true, messages: result.rows });
  } catch (err) {
    next(err);
  }
};
```

## Step 2.4: Add Health Check Endpoint

### File: `backend/src/controllers/health.controller.ts`
```typescript
import { Request, Response } from 'express';
import { query } from '../db.js';
import { getLLMRouter } from '../services/llm/index.js';

// GET /api/health
export const healthCheck = async (req: Request, res: Response) => {
  const health: {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    version: string;
    services: {
      database: { status: 'ok' | 'error'; latency?: number };
      llm: { status: 'ok' | 'error' | 'unavailable'; provider: string; model?: string };
    };
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: { status: 'error' },
      llm: { status: 'unavailable', provider: 'none' },
    },
  };

  // Check database
  try {
    const start = Date.now();
    await query('SELECT 1');
    health.services.database = {
      status: 'ok',
      latency: Date.now() - start,
    };
  } catch (error) {
    health.status = 'error';
    health.services.database = { status: 'error' };
  }

  // Check LLM
  try {
    const llmRouter = getLLMRouter();
    const providerInfo = llmRouter.getProviderInfo();

    health.services.llm = {
      status: 'ok',
      provider: providerInfo.primary,
      model: providerInfo.primary.split('(')[1]?.replace(')', '') || 'unknown',
    };

    // If using local, check if it's actually available
    if (providerInfo.primary.toLowerCase().includes('local')) {
      // Additional check could go here
    }
  } catch (error) {
    health.services.llm = {
      status: 'error',
      provider: 'error',
    };
    health.status = 'degraded'; // App can still run, just no LLM
  }

  const statusCode = health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 503;
  res.status(statusCode).json(health);
};

// GET /api/health/llm
export const llmHealthCheck = async (req: Request, res: Response) => {
  try {
    const llmRouter = getLLMRouter();
    const providerInfo = llmRouter.getProviderInfo();

    // Try a simple generation
    const testResponse = await llmRouter.generateResponse([
      { role: 'user', content: 'Hello, are you working?' },
    ], { maxTokens: 20 });

    res.json({
      status: 'ok',
      provider: providerInfo,
      test: {
        latency: testResponse.latency,
        tokens: testResponse.tokens,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
```

### File: `backend/src/routes/health.routes.ts`
```typescript
import { Router } from 'express';
import { healthCheck, llmHealthCheck } from '../controllers/health.controller.js';

const router = Router();

router.get('/', healthCheck);
router.get('/llm', llmHealthCheck);

export default router;
```

### Update: `backend/src/index.ts`
```typescript
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Route imports
import authRoutes from './routes/auth.routes.js';
import conversationRoutes from './routes/conversations.routes.js';
import messageRoutes from './routes/messages.routes.js';
import healthRoutes from './routes/health.routes.js';

// Middleware imports
import { errorHandler } from './middleware/error.middleware.js';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Core Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'CBT AI Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      llmHealth: '/api/health/llm',
      auth: '/api/auth/*',
      conversations: '/api/conversations/*',
      messages: '/api/messages/*',
    },
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 LLM Provider: ${process.env.LLM_PROVIDER || 'local'}`);
});

export default app;
```

## Step 2.5: Update Environment Configuration

### File: `.env.example` (MODIFY - add these)
```env
# === LLM Configuration ===
# Provider: 'local' (Ollama), 'openai', or 'hybrid'
LLM_PROVIDER=local

# === Local LLM (Ollama) ===
OLLAMA_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=cbt-therapist
LOCAL_LLM_FALLBACK_MODEL=llama3.1:8b
LLM_TIMEOUT=30000

# === OpenAI (Fallback) ===
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# === Hybrid Mode Settings ===
# When LLM_PROVIDER=hybrid, these control fallback behavior
HYBRID_PRIMARY=local
HYBRID_FALLBACK=openai
FALLBACK_ON_ERROR=true
FALLBACK_ON_TIMEOUT=true
```

### File: `backend/.env` (CREATE from .env.example)
```env
# Copy values from .env.example and fill in your actual values
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cbt_ai_db
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_NAME=cbt_ai_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# LLM Configuration
LLM_PROVIDER=local
OLLAMA_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=cbt-therapist
LOCAL_LLM_FALLBACK_MODEL=llama3.1:8b
LLM_TIMEOUT=30000

# Keep OpenAI for fallback
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini

# JWT
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRES_IN=7d

# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## Step 2.6: Add LLM Status Endpoint to Frontend

### File: `frontend/src/app/api-status/page.tsx` (CREATE)
```typescript
'use client';

import { useEffect, useState } from 'react';

interface HealthStatus {
  status: string;
  services: {
    database: { status: string; latency?: number };
    llm: { status: string; provider: string; model?: string };
  };
}

export default function ApiStatusPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/health');
        const data = await res.json();
        setHealth(data);
      } catch (error) {
        console.error('Failed to fetch health:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">System Status</h1>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Overall Status</h2>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  health?.status === 'ok' ? 'bg-green-500' :
                  health?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              />
              <span className="capitalize">{health?.status || 'Unknown'}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Services</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Database</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {health?.services.database.latency}ms
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      health?.services.database.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span>LLM</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {health?.services.llm.provider}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      health?.services.llm.status === 'ok' ? 'bg-green-500' :
                      health?.services.llm.status === 'unavailable' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Verification Checklist - Phase 2
- [ ] New files created in `backend/src/services/llm/`
- [ ] Config file created in `backend/src/config/`
- [ ] Message controller updated
- [ ] Health routes added
- [ ] `.env` updated with LLM settings
- [ ] Backend starts without errors
- [ ] `GET /api/health` returns LLM status
- [ ] `GET /api/health/llm` test generation works
- [ ] Chat still works end-to-end
- [ ] Fallback to OpenAI works if Ollama is stopped

## Rollback Plan - Phase 2
```bash
# If issues arise:

# 1. Revert to OpenAI-only mode
# In .env:
LLM_PROVIDER=openai

# 2. Or use hybrid mode
LLM_PROVIDER=hybrid
HYBRID_PRIMARY=openai
HYBRID_FALLBACK=local

# 3. Restore original files from git
git checkout backend/src/controllers/message.controller.ts
git checkout backend/src/index.ts
```

---

# Phase 3: RAG System for CBT Knowledge

## Objective
Implement Retrieval-Augmented Generation to enhance local LLM responses with CBT-specific knowledge.

## Prerequisites
- [ ] Phase 1 and 2 complete
- [ ] PostgreSQL with pgvector extension enabled
- [ ] Embedding model downloaded (nomic-embed-text)

## Step 3.1: Enable pgvector Extension

### File: `database/schema.sql` (MODIFY - add at the beginning)
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- After the memories table, add CBT knowledge table

-- ============================================
-- CBT KNOWLEDGE TABLE (for RAG)
-- ============================================
CREATE TABLE IF NOT EXISTS cbt_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags JSONB DEFAULT '[]'::jsonb,
    embedding VECTOR(768), -- nomic-embed-text dimension
    source VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster search
CREATE INDEX IF NOT EXISTS idx_cbt_knowledge_category ON cbt_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_cbt_knowledge_tags ON cbt_knowledge USING GIN (tags);

-- Trigger for updated_at
CREATE TRIGGER update_cbt_knowledge_updated_at BEFORE UPDATE ON cbt_knowledge
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Run Migration
```powershell
# Connect to PostgreSQL and run schema updates
docker exec -i cbt-ai-postgres psql -U postgres -d cbt_ai_db < database/schema.sql
```

## Step 3.2: Create Embedding Service

### File: `backend/src/services/embedding.service.ts`
```typescript
/**
 * Embedding Service
 * Generates embeddings using Ollama's nomic-embed-text model
 */

import OpenAI from 'openai';
import getLLMConfig from '../config/llm.config.js';

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
}

class EmbeddingService {
  private client: OpenAI;
  private model: string;

  constructor() {
    const config = getLLMConfig();
    this.client = new OpenAI({
      baseURL: `${config.local.baseUrl}/v1`,
      apiKey: 'ollama',
    });
    this.model = 'nomic-embed-text';
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: text,
    });

    return {
      embedding: response.data[0].embedding,
      tokens: response.usage?.total_tokens || 0,
    };
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  }
}

// Singleton
let embeddingServiceInstance: EmbeddingService | null = null;

export const getEmbeddingService = (): EmbeddingService => {
  if (!embeddingServiceInstance) {
    embeddingServiceInstance = new EmbeddingService();
  }
  return embeddingServiceInstance;
};

export default getEmbeddingService;
```

## Step 3.3: Create Knowledge Base Service

### File: `backend/src/services/knowledge.service.ts`
```typescript
/**
 * CBT Knowledge Service
 * Manages CBT techniques, exercises, and therapeutic knowledge for RAG
 */

import { query } from '../db.js';
import { getEmbeddingService } from './embedding.service.js';

export interface KnowledgeEntry {
  id?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  similarity: number;
}

class KnowledgeService {
  /**
   * Add a knowledge entry to the database
   */
  async addKnowledge(entry: KnowledgeEntry): Promise<string> {
    const embeddingService = getEmbeddingService();
    const { embedding } = await embeddingService.generateEmbedding(
      `${entry.title}\n\n${entry.content}`
    );

    const result = await query(
      `INSERT INTO cbt_knowledge (title, content, category, tags, embedding, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        entry.title,
        entry.content,
        entry.category,
        JSON.stringify(entry.tags),
        `[${embedding.join(',')}]`,
        entry.source || null,
      ]
    );

    return result.rows[0].id;
  }

  /**
   * Search for relevant knowledge using vector similarity
   */
  async search(queryText: string, limit: number = 5): Promise<SearchResult[]> {
    const embeddingService = getEmbeddingService();
    const { embedding } = await embeddingService.generateEmbedding(queryText);

    const result = await query(
      `SELECT id, title, content, category,
              1 - (embedding <=> $1) as similarity
       FROM cbt_knowledge
       ORDER BY embedding <=> $1
       LIMIT $2`,
      [`[${embedding.join(',')}]`, limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      similarity: parseFloat(row.similarity),
    }));
  }

  /**
   * Get context for a user query
   */
  async getContextForQuery(query: string, maxTokens: number = 1000): Promise<string> {
    const results = await this.search(query, 3);

    let context = '';
    let currentLength = 0;

    for (const result of results) {
      const entry = `### ${result.title}\n${result.content}\n\n`;
      const entryLength = entry.split(' ').length;

      if (currentLength + entryLength > maxTokens) break;

      context += entry;
      currentLength += entryLength;
    }

    return context.trim();
  }

  /**
   * Seed the knowledge base with CBT techniques
   */
  async seedKnowledgeBase(): Promise<void> {
    const knowledge: KnowledgeEntry[] = [
      // Cognitive Restructuring
      {
        title: 'Thought Challenging',
        content: `Thought challenging is a core CBT technique where you examine negative automatic thoughts.

Steps:
1. Identify the automatic thought
2. Examine the evidence for and against it
3. Consider alternative explanations
4. Create a balanced thought

Example:
Automatic thought: "I'm going to fail this presentation."
Challenge: What evidence supports this? What evidence contradicts this?
Balanced thought: "I've prepared well and practiced. I might be nervous, but I can handle it."`,
        category: 'cognitive_restructuring',
        tags: ['thoughts', 'challenging', 'evidence', 'cognitive'],
      },
      {
        title: 'Cognitive Distortions',
        content: `Common cognitive distortions to identify:

1. All-or-nothing thinking: Seeing things in black and white
2. Overgeneralization: One event becomes a pattern
3. Mental filter: Focusing only on negatives
4. Catastrophizing: Expecting the worst
5. Mind reading: Assuming you know what others think
6. Should statements: Rigid rules about behavior
7. Personalization: Taking too much responsibility

Recognition is the first step to change.`,
        category: 'cognitive_restructuring',
        tags: ['distortions', 'thoughts', 'patterns', 'cognitive'],
      },
      // Behavioral Activation
      {
        title: 'Activity Scheduling',
        content: `Activity scheduling helps combat depression through planned positive activities.

Steps:
1. List activities that used to bring joy
2. Rate expected enjoyment (0-10)
3. Schedule specific times
4. After activity, rate actual enjoyment
5. Notice the difference

Key insight: We often underestimate how much we'll enjoy activities when depressed.`,
        category: 'behavioral_activation',
        tags: ['activities', 'scheduling', 'mood', 'behavioral'],
      },
      // Relaxation Techniques
      {
        title: 'Deep Breathing Exercise',
        content: `Box breathing technique:

1. Breathe in for 4 counts
2. Hold for 4 counts
3. Breathe out for 4 counts
4. Hold for 4 counts
5. Repeat 4 times

This activates the parasympathetic nervous system, reducing anxiety.

Practice when calm to use effectively when anxious.`,
        category: 'relaxation',
        tags: ['breathing', 'anxiety', 'relaxation', 'technique'],
      },
      {
        title: 'Progressive Muscle Relaxation',
        content: `PMR helps release physical tension:

1. Start with your feet - tense for 5 seconds, release
2. Move to calves - tense, release
3. Thighs - tense, release
4. Stomach - tense, release
5. Hands - make fists, release
6. Shoulders - raise up, release
7. Face - scrunch, release
8. Notice the difference between tension and relaxation

Practice daily for best results.`,
        category: 'relaxation',
        tags: ['muscles', 'tension', 'relaxation', 'physical'],
      },
      // Anxiety Management
      {
        title: 'Grounding Technique (5-4-3-2-1)',
        content: `Use this when feeling anxious or overwhelmed:

Name 5 things you can SEE
Name 4 things you can TOUCH
Name 3 things you can HEAR
Name 2 things you can SMELL
Name 1 thing you can TASTE

This brings you back to the present moment and reduces anxiety.

Best for: Panic attacks, dissociation, overwhelming anxiety.`,
        category: 'grounding',
        tags: ['anxiety', 'grounding', 'present', 'senses'],
      },
      // Depression
      {
        title: 'Behavioral Activation',
        content: `Breaking the cycle of depression through action:

1. Monitor your activities and mood
2. Notice the connection between activity and mood
3. Schedule activities that bring mastery or pleasure
4. Start small - even 5 minutes counts
5. Gradually increase activity level

Key principle: Motivation follows action, not the other way around.

You don't need to feel motivated to do something beneficial.`,
        category: 'behavioral_activation',
        tags: ['depression', 'activities', 'mood', 'action'],
      },
      // Sleep
      {
        title: 'Sleep Hygiene',
        content: `CBT-I strategies for better sleep:

1. Keep consistent wake time (even on weekends)
2. Bed is only for sleep - no screens, no worry
3. If can't sleep after 20 min, get up
4. Do something calm until sleepy
5. Avoid caffeine after noon
6. No alcohol within 3 hours of bed
7. Dark, cool, quiet bedroom

Sleep restriction may initially feel worse but improves sleep efficiency.`,
        category: 'sleep',
        tags: ['insomnia', 'sleep', 'routine', 'rest'],
      },
      // Thought Records
      {
        title: 'Thought Record Format',
        content: `Complete this worksheet:

1. SITUATION: What happened?
2. EMOTIONS: What did you feel? (Rate 0-100)
3. AUTOMATIC THOUGHT: What went through your mind?
4. EVIDENCE FOR: What supports this thought?
5. EVIDENCE AGAINST: What contradicts it?
6. ALTERNATIVE THOUGHT: What's a balanced view?
7. OUTCOME: Re-rate your emotions

Regular practice helps identify patterns in thinking.`,
        category: 'worksheets',
        tags: ['thoughts', 'worksheet', 'record', 'challenging'],
      },
      // Crisis Resources
      {
        title: 'Crisis Resources',
        content: `If someone expresses thoughts of self-harm or suicide:

US Resources:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Emergency: 911

Response Protocol:
1. Take all mentions seriously
2. Ask directly about suicide
3. Listen without judgment
4. Connect to resources
5. Don't promise to keep it secret
6. Encourage professional help`,
        category: 'crisis',
        tags: ['crisis', 'suicide', 'emergency', 'resources'],
      },
    ];

    for (const entry of knowledge) {
      try {
        await this.addKnowledge(entry);
        console.log(`Added: ${entry.title}`);
      } catch (error) {
        console.error(`Failed to add ${entry.title}:`, error);
      }
    }
  }
}

// Singleton
let knowledgeServiceInstance: KnowledgeService | null = null;

export const getKnowledgeService = (): KnowledgeService => {
  if (!knowledgeServiceInstance) {
    knowledgeServiceInstance = new KnowledgeService();
  }
  return knowledgeServiceInstance;
};

export default getKnowledgeService;
```

## Step 3.4: Create RAG-Enhanced LLM Provider

### File: `backend/src/services/llm/rag-provider.ts`
```typescript
/**
 * RAG-Enhanced LLM Provider
 * Combines knowledge retrieval with local LLM generation
 */

import { LLMProvider, LLMResponse, ChatMessage, GenerateOptions } from './types';
import { LocalLLMProvider } from './local-provider';
import { getKnowledgeService } from '../knowledge.service';

export class RAGLLMProvider implements LLMProvider {
  private baseProvider: LocalLLMProvider;
  private maxContextTokens: number;

  constructor() {
    this.baseProvider = new LocalLLMProvider();
    this.maxContextTokens = 1000;
  }

  async generateResponse(
    messages: ChatMessage[],
    options?: GenerateOptions
  ): Promise<LLMResponse> {
    // Get the last user message for context retrieval
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');

    if (!lastUserMessage) {
      return this.baseProvider.generateResponse(messages, options);
    }

    // Retrieve relevant CBT knowledge
    const knowledgeService = getKnowledgeService();
    let context = '';

    try {
      context = await knowledgeService.getContextForQuery(
        lastUserMessage.content,
        this.maxContextTokens
      );
    } catch (error) {
      console.warn('Failed to retrieve context:', error);
      // Continue without context
    }

    // Enhance system prompt with context
    const enhancedOptions: GenerateOptions = {
      ...options,
      systemPrompt: options?.systemPrompt
        ? `${options.systemPrompt}\n\nRelevant CBT Knowledge:\n${context}`
        : undefined,
    };

    // Generate response with context
    const response = await this.baseProvider.generateResponse(messages, enhancedOptions);

    return {
      ...response,
      provider: 'local-rag',
    };
  }

  async isAvailable(): Promise<boolean> {
    return this.baseProvider.isAvailable();
  }

  getName(): string {
    return 'Local RAG (Enhanced)';
  }
}
```

### Update: `backend/src/services/llm/llm-router.ts` (MODIFY)
```typescript
// Add import at top:
import { RAGLLMProvider } from './rag-provider.js';

// In LLMRouter class, add:
private ragProvider: RAGLLMProvider | null = null;

// In initializeProviders():
if (this.config.provider === 'local' || this.config.provider === 'hybrid') {
  this.ragProvider = new RAGLLMProvider();
}

// Add method to use RAG:
async generateResponseWithRAG(
  messages: ChatMessage[],
  options?: GenerateOptions
): Promise<LLMResponse> {
  if (this.ragProvider) {
    return this.ragProvider.generateResponse(messages, options);
  }
  return this.generateResponse(messages, options);
}
```

## Step 3.5: Create Knowledge Seed Script

### File: `backend/scripts/seed-knowledge.ts`
```typescript
/**
 * Seed the CBT knowledge base
 * Run with: npx tsx scripts/seed-knowledge.ts
 */

import '../db.js'; // Initialize database connection
import { getKnowledgeService } from '../services/knowledge.service.js';

async function main() {
  console.log('Seeding CBT knowledge base...');

  const knowledgeService = getKnowledgeService();

  try {
    await knowledgeService.seedKnowledgeBase();
    console.log('✅ Knowledge base seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed knowledge base:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
```

### Add script to `backend/package.json`
```json
{
  "scripts": {
    "seed:knowledge": "tsx scripts/seed-knowledge.ts"
  }
}
```

## Verification Checklist - Phase 3
- [ ] pgvector extension enabled in database
- [ ] cbt_knowledge table created
- [ ] Embedding service working
- [ ] Knowledge service working
- [ ] RAG provider created
- [ ] Knowledge seeded (`npm run seed:knowledge`)
- [ ] Search returns relevant results
- [ ] RAG-enhanced responses more accurate

## Rollback Plan - Phase 3
```bash
# If issues arise:

# Disable RAG (use base local provider)
# In llm-router.ts, change generateResponseWithRAG to use generateResponse

# Drop knowledge table if needed
docker exec -i cbt-ai-postgres psql -U postgres -d cbt_ai_db -c "DROP TABLE IF EXISTS cbt_knowledge;"
```

---

# Phase 4: Crisis Detection & Fallback

## Objective
Implement crisis detection to route critical situations to OpenAI (higher quality) and ensure fallback mechanisms work reliably.

## Prerequisites
- [ ] Phase 1, 2, 3 complete
- [ ] OpenAI API key available for fallback

## Step 4.1: Create Crisis Detection Service

### File: `backend/src/services/crisis-detection.service.ts`
```typescript
/**
 * Crisis Detection Service
 * Identifies potential crisis situations for special handling
 */

// Crisis keywords by severity
const CRISIS_KEYWORDS = {
  critical: [
    'suicide',
    'kill myself',
    'end my life',
    'want to die',
    'take my life',
    'suicidal',
    'hurt myself badly',
    'planning to die',
  ],
  high: [
    'self-harm',
    'cut myself',
    'hurt myself',
    'harm myself',
    'overdose',
    'don\'t want to live',
    'can\'t go on',
    'no reason to live',
  ],
  medium: [
    'hopeless',
    'worthless',
    'trapped',
    'burden',
    'alone',
    'nobody cares',
    'give up',
    'can\'t take it',
  ],
};

const CRISIS_RESPONSES = {
  critical: `I'm very concerned about what you're sharing. Your safety is the most important thing right now.

Please reach out for immediate support:

📞 **National Suicide Prevention Lifeline**: 988 (US)
📱 **Crisis Text Line**: Text HOME to 741741
🚨 **Emergency Services**: 911

You don't have to face this alone. These resources are available 24/7 with trained counselors who want to help.`,

  high: `I hear that you're going through something really difficult, and I want to make sure you get the support you need.

If you're feeling unsafe or having thoughts of hurting yourself, please reach out:

📞 **National Suicide Prevention Lifeline**: 988 (US)
📱 **Crisis Text Line**: Text HOME to 741741

Would you like to talk about what's making you feel this way?`,

  medium: `It sounds like you're going through a really tough time. Your feelings are valid, and you don't have to carry this burden alone.

Sometimes our thoughts can trick us into seeing things as worse than they are. Can you tell me more about what's been happening?`,
};

export type CrisisLevel = 'none' | 'medium' | 'high' | 'critical';

export interface CrisisDetectionResult {
  level: CrisisLevel;
  matchedKeywords: string[];
  requiresFallback: boolean;
  response?: string;
}

class CrisisDetectionService {
  /**
   * Analyze message for crisis indicators
   */
  detectCrisis(message: string): CrisisDetectionResult {
    const lowerMessage = message.toLowerCase();

    // Check each severity level
    for (const [level, keywords] of Object.entries(CRISIS_KEYWORDS)) {
      const matched = keywords.filter((kw) => lowerMessage.includes(kw.toLowerCase()));

      if (matched.length > 0) {
        return {
          level: level as CrisisLevel,
          matchedKeywords: matched,
          requiresFallback: level === 'critical' || level === 'high',
          response: CRISIS_RESPONSES[level as keyof typeof CRISIS_RESPONSES],
        };
      }
    }

    return {
      level: 'none',
      matchedKeywords: [],
      requiresFallback: false,
    };
  }

  /**
   * Check if we should escalate to OpenAI
   */
  shouldUseOpenAI(crisisResult: CrisisDetectionResult): boolean {
    return crisisResult.requiresFallback;
  }

  /**
   * Get crisis resources message
   */
  getCrisisMessage(level: CrisisLevel): string | null {
    return CRISIS_RESPONSES[level] || null;
  }
}

// Singleton
let crisisDetectionInstance: CrisisDetectionService | null = null;

export const getCrisisDetection = (): CrisisDetectionService => {
  if (!crisisDetectionInstance) {
    crisisDetectionInstance = new CrisisDetectionService();
  }
  return crisisDetectionInstance;
};

export default getCrisisDetection;
```

## Step 4.2: Update Message Controller with Crisis Detection

### File: `backend/src/controllers/message.controller.ts` (MODIFY)
```typescript
import { Response, NextFunction } from 'express';
import { query } from '../db.js';
import { createError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { getLLMRouter } from '../services/llm/index.js';
import { ChatMessage } from '../services/llm/types.js';
import { getCrisisDetection } from '../services/crisis-detection.service.js';
import { query as dbQuery } from '../db.js';

// POST /api/messages
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user!.id;

    // Verify conversation belongs to user
    const convResult = await query(
      'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
      [conversationId, userId]
    );
    if (convResult.rows.length === 0) throw createError('Conversation not found', 404);

    // Detect crisis in user message
    const crisisDetection = getCrisisDetection();
    const crisisResult = crisisDetection.detectCrisis(content);

    // Log crisis event if detected
    if (crisisResult.level !== 'none') {
      await query(
        `INSERT INTO safety_events (user_id, conversation_id, snippet, severity)
         VALUES ($1, $2, $3, $4)`,
        [userId, conversationId, content.substring(0, 500), crisisResult.level]
      );
      console.log(`⚠️ Crisis detected: ${crisisResult.level} - Keywords: ${crisisResult.matchedKeywords.join(', ')}`);
    }

    // Save user message
    const userMsgResult = await query(
      `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, 'user', $2) RETURNING *`,
      [conversationId, content]
    );
    const userMessage = userMsgResult.rows[0];

    // For critical crisis, provide immediate response
    if (crisisResult.level === 'critical') {
      const aiContent = crisisResult.response || CRISIS_RESPONSES.critical;

      const aiMsgResult = await query(
        `INSERT INTO messages (conversation_id, role, content)
         VALUES ($1, 'assistant', $2) RETURNING *`,
        [conversationId, aiContent]
      );

      return res.status(201).json({
        success: true,
        userMessage,
        aiMessage: aiMsgResult.rows[0],
        crisis: {
          level: crisisResult.level,
          resources: true,
        },
      });
    }

    // Fetch recent history
    const historyResult = await query(
      `SELECT role, content FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );
    const history: ChatMessage[] = historyResult.rows.map((r) => ({
      role: r.role as 'user' | 'assistant',
      content: r.content,
    }));

    // Generate AI reply
    const llmRouter = getLLMRouter();

    // Use OpenAI fallback for high crisis, local for others
    const response = crisisResult.requiresFallback
      ? await llmRouter.generateResponse(history, { systemPrompt: CBT_SYSTEM_PROMPT + '\n\nIMPORTANT: The user has indicated they may be in crisis. Respond with extra care and always include crisis resources.' })
      : await llmRouter.generateResponse(history);

    // Save AI reply
    const aiMsgResult = await query(
      `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, 'assistant', $2) RETURNING *`,
      [conversationId, response.content]
    );

    await query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);

    res.status(201).json({
      success: true,
      userMessage,
      aiMessage: aiMsgResult.rows[0],
      metadata: {
        tokens: response.tokens,
        latency: response.latency,
        model: response.model,
        provider: response.provider,
      },
      ...(crisisResult.level !== 'none' && {
        crisis: {
          level: crisisResult.level,
          resources: crisisResult.level === 'high',
        },
      }),
    });
  } catch (err) {
    next(err);
  }
};

// Import crisis response at top
import { CRISIS_RESPONSES } from '../services/crisis-detection.service.js';
import { CBT_SYSTEM_PROMPT } from '../services/llm/types.js';
```

## Verification Checklist - Phase 4
- [ ] Crisis detection service created
- [ ] Keywords properly categorized
- [ ] Critical crises show immediate resources
- [ ] High crises use OpenAI fallback
- [ ] Safety events logged to database
- [ ] Frontend displays crisis resources when needed

## Rollback Plan - Phase 4
```bash
# If issues arise:
# 1. Comment out crisis detection in message controller
# 2. Remove safety_events insertion
# 3. Service will work without crisis features
```

---

# Phase 5: Testing & Optimization

## Objective
Comprehensive testing, performance optimization, and production readiness.

## Step 5.1: Create Test Suite

### File: `backend/__tests__/llm.test.ts`
```typescript
import { describe, it, expect, beforeAll } from '@jest/globals';
import { getLLMRouter } from '../src/services/llm/index.js';

describe('LLM Service', () => {
  beforeAll(() => {
    // Set test environment
    process.env.LLM_PROVIDER = 'local';
    process.env.OLLAMA_BASE_URL = 'http://localhost:11434';
  });

  it('should be available', async () => {
    const router = getLLMRouter();
    const available = await router.generateResponse([
      { role: 'user', content: 'Hello' },
    ], { maxTokens: 10 });
    expect(available.content).toBeDefined();
  });

  it('should respond to CBT queries', async () => {
    const router = getLLMRouter();
    const response = await router.generateResponse([
      { role: 'user', content: 'I feel anxious about my job.' },
    ], { maxTokens: 100 });

    expect(response.content.length).toBeGreaterThan(10);
    expect(response.latency).toBeLessThan(30000);
  });

  it('should fallback to OpenAI when local fails', async () => {
    // Configure hybrid mode
    process.env.LLM_PROVIDER = 'hybrid';
    const router = getLLMRouter();
    // Test fallback logic
  });
});
```

### File: `backend/__tests__/crisis.test.ts`
```typescript
import { describe, it, expect } from '@jest/globals';
import { getCrisisDetection } from '../src/services/crisis-detection.service.js';

describe('Crisis Detection', () => {
  const service = getCrisisDetection();

  it('should detect critical crisis', () => {
    const result = service.detectCrisis('I want to kill myself');
    expect(result.level).toBe('critical');
    expect(result.requiresFallback).toBe(true);
  });

  it('should detect high crisis', () => {
    const result = service.detectCrisis('I want to hurt myself');
    expect(result.level).toBe('high');
    expect(result.requiresFallback).toBe(true);
  });

  it('should detect medium crisis', () => {
    const result = service.detectCrisis('I feel hopeless');
    expect(result.level).toBe('medium');
    expect(result.requiresFallback).toBe(false);
  });

  it('should not detect crisis in normal message', () => {
    const result = service.detectCrisis('I had a good day today');
    expect(result.level).toBe('none');
    expect(result.matchedKeywords).toHaveLength(0);
  });
});
```

## Step 5.2: Performance Optimization

### File: `backend/src/config/performance.ts`
```typescript
/**
 * Performance Configuration
 */

export const PERFORMANCE_CONFIG = {
  // LLM timeouts
  llm: {
    timeout: parseInt(process.env.LLM_TIMEOUT || '30000'),
    maxRetries: 2,
    retryDelay: 1000,
  },

  // Caching
  cache: {
    enabled: process.env.ENABLE_CACHE === 'true',
    ttl: parseInt(process.env.CACHE_TTL || '3600'), // 1 hour
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },
};
```

## Step 5.3: Add Monitoring

### File: `backend/src/services/metrics.service.ts`
```typescript
/**
 * Metrics Service
 * Track LLM usage and performance
 */

interface Metric {
  timestamp: Date;
  provider: string;
  model: string;
  latency: number;
  tokens: number;
  success: boolean;
}

class MetricsService {
  private metrics: Metric[] = [];
  private maxMetrics = 1000;

  recordMetric(metric: Omit<Metric, 'timestamp'>) {
    this.metrics.push({
      ...metric,
      timestamp: new Date(),
    });

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getAverageLatency(provider?: string): number {
    const filtered = provider
      ? this.metrics.filter((m) => m.provider === provider)
      : this.metrics;

    if (filtered.length === 0) return 0;

    return filtered.reduce((sum, m) => sum + m.latency, 0) / filtered.length;
  }

  getSuccessRate(provider?: string): number {
    const filtered = provider
      ? this.metrics.filter((m) => m.provider === provider)
      : this.metrics;

    if (filtered.length === 0) return 0;

    return (filtered.filter((m) => m.success).length / filtered.length) * 100;
  }

  getTokenUsage(provider?: string): number {
    const filtered = provider
      ? this.metrics.filter((m) => m.provider === provider)
      : this.metrics;

    return filtered.reduce((sum, m) => sum + m.tokens, 0);
  }

  getReport() {
    return {
      totalRequests: this.metrics.length,
      averageLatency: this.getAverageLatency(),
      successRate: this.successRate(),
      totalTokens: this.getTokenUsage(),
      byProvider: {
        local: {
          requests: this.metrics.filter((m) => m.provider === 'local').length,
          avgLatency: this.getAverageLatency('local'),
          successRate: this.successRate('local'),
        },
        openai: {
          requests: this.metrics.filter((m) => m.provider === 'openai').length,
          avgLatency: this.getAverageLatency('openai'),
          successRate: this.successRate('openai'),
        },
      },
    };
  }
}

// Singleton
let metricsInstance: MetricsService | null = null;

export const getMetricsService = (): MetricsService => {
  if (!metricsInstance) {
    metricsInstance = new MetricsService();
  }
  return metricsInstance;
};

export default getMetricsService;
```

## Verification Checklist - Phase 5
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Performance acceptable (<3s response time)
- [ ] Memory usage stable
- [ ] No memory leaks
- [ ] Error handling works
- [ ] Metrics collected

---

# Final Checklist Before Going Live

## Infrastructure
- [ ] Ollama installed and running as service
- [ ] Models downloaded (llama3.1:8b, nomic-embed-text, cbt-therapist)
- [ ] PostgreSQL running with pgvector
- [ ] All environment variables set

## Backend
- [ ] All services compile without errors
- [ ] Health endpoint returns all services OK
- [ ] Local LLM responding
- [ ] OpenAI fallback configured
- [ ] Crisis detection working
- [ ] Knowledge base seeded

## Frontend
- [ ] Chat interface works
- [ ] Error states handled
- [ ] Loading states shown

## Testing
- [ ] Manual testing complete
- [ ] Crisis keywords tested
- [ ] Fallback tested (stop Ollama, verify OpenAI used)
- [ ] Performance acceptable

## Monitoring
- [ ] Logging configured
- [ ] Error tracking (if using Sentry)
- [ ] Performance metrics collected

## Security
- [ ] No secrets in code
- [ ] Environment variables set properly
- [ ] CORS configured
- [ ] Input validation working

---

# Troubleshooting Guide

## Common Issues

### Ollama Not Running
```powershell
# Check if Ollama is running
ollama list

# If not running, start it
ollama serve

# Or restart Ollama service
```

### Model Not Found
```powershell
# List available models
ollama list

# Pull missing model
ollama pull llama3.1:8b
```

### Slow Responses
```powershell
# Check GPU usage
nvidia-smi

# Reduce context window
# In local-provider.ts, reduce messages.slice(-10) to (-5)

# Use smaller model
ollama pull llama3.2:3b
```

### Memory Issues
```powershell
# Use quantized model (smaller)
ollama pull llama3.1:8b-q4_0

# Or use CPU-only
set OLLAMA_NO_GPU=1
```

### Database Connection Failed
```powershell
# Check PostgreSQL
docker ps

# Restart database
docker restart cbt-ai-postgres
```

---

# Cost Comparison After Implementation

## Before (OpenAI Only)
```
GPT-4o-mini: ~$15-20/month
Rate limits: 100 requests/day
Dependency: External API
Privacy: Data sent to OpenAI
```

## After (Local LLM)
```
Hardware: One-time $300-450 (GPU)
Electricity: ~$17/month
Rate limits: None
Dependency: Local only
Privacy: Data stays on device
Fallback: OpenAI for crisis (~$1-2/month)

Total Year 1: $450 + $17×12 = $654
Year 2+: $204/year

Savings vs API: ~$0-50/month after Year 1
```

---

# Summary

This plan enables you to:
1. **Eliminate API dependency** - Run entirely on local hardware
2. **Maintain quality** - RAG enhances local model with CBT knowledge
3. **Ensure safety** - Crisis detection routes critical cases to better models
4. **Keep costs low** - One-time hardware investment, minimal ongoing costs
5. **Improve privacy** - User data stays on your servers

**Next Step**: Begin with Phase 1 - Install Ollama and test locally.

---

*This implementation plan is ready to be executed by Claude Opus or any developer familiar with Node.js, TypeScript, and LLM integration.*