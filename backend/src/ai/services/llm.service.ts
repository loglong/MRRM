/**
 * LLM Service - MiniMax implementation using OpenAI-compatible API
 * Supports fallback to rule-based engine when LLM is unavailable
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { FollowupRecommendation } from './followup-recommendation.service';

// --- Types ---

export interface LlmResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  raw?: any;
}

// --- MiniMax Provider (OpenAI-compatible) ---

@Injectable()
export class MiniMaxProvider {
  name = 'minimax';
  private readonly apiKey: string;
  private readonly groupId: string;
  private readonly model: string;
  private readonly baseUrl = 'https://api.minimaxi.com/v1';

  get isConfigured(): boolean {
    return !!this.apiKey && !!this.groupId;
  }

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MINIMAX_API_KEY') || '';
    this.groupId = this.configService.get<string>('MINIMAX_GROUP_ID') || '';
    // Default to abab6.5s, can be overridden via MINIMAX_MODEL env
    this.model = this.configService.get<string>('MINIMAX_MODEL') || 'abab6.5s';
    const configured = this.apiKey.length > 0 && this.groupId.length > 0;
    process.stderr.write(`[STARTUP] MiniMaxProvider init: apiKey=${this.apiKey.substring(0, Math.min(10, this.apiKey.length))}... groupId=${this.groupId.substring(0, 8)}... isConfigured=${configured}\n`);
    if (!configured) {
      process.stderr.write(`[STARTUP] WARNING: MINIMAX_API_KEY or MINIMAX_GROUP_ID not configured in environment\n`);
    }
  }

  async generate(prompt: string): Promise<LlmResponse> {
    if (!this.apiKey || !this.groupId) {
      const err = new Error('MiniMax API key or group ID not configured');
      process.stderr.write(`[MiniMax] ERROR: ${err.message}\n`);
      throw err;
    }

    const url = `${this.baseUrl}/chat/completions`;
    const logger = new Logger('MiniMaxProvider');
    logger.log(`[MiniMax] Calling API at ${url} with model ${this.model}`);
    logger.log(`[MiniMax] Prompt length: ${prompt.length} chars`);
    process.stderr.write(`[MiniMax] Calling API at ${url} with model ${this.model}\n`);

    try {
      const response = await axios.post(
        url,
        {
          model: this.model,
          group_id: this.groupId,
          messages: [
            {
              role: 'system',
              content: '你是一位专业的口腔医院随访顾问，为患者生成个性化的随访建议。请用JSON格式输出，包含recommendedContent（3-5条建议数组）、optimalTime（最佳联系时间段）、seasonalAdjustment（包含topic字段）、confidence（0-1置信度）、reasons（1-3条推荐理由）。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 60000,
        },
      );
      logger.log(`[MiniMax] Response received successfully`);
      process.stderr.write(`[MiniMax] Response received\n`);

      const data = response.data as {
        choices?: Array<{
          message: { content: string };
          finish_reason: string;
        }>;
        usage?: {
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
        };
      };

      const content = data.choices?.[0]?.message?.content || '';

      return {
        content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
        } : undefined,
        raw: data,
      };
    } catch (err) {
      const error = err as AxiosError<{ message?: string; error?: string }>;
      const logger = new Logger('MiniMaxProvider');
      logger.error(`MiniMax API error: ${error.response?.data?.message || error.message}`);
      throw new Error(`MiniMax API error: ${error.response?.data?.message || error.message}`);
    }
  }
}

// --- Caching ---

interface CacheEntry {
  value: any;
  expiresAt: number;
}

@Injectable()
export class LlmCache {
  private cache = new Map<string, CacheEntry>();
  private ttl: number;

  constructor(private configService: ConfigService) {
    this.ttl = (this.configService.get<number>('LLM_CACHE_TTL_SECONDS') || 3600) * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set(key: string, value: any, ttlMs?: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs || this.ttl),
    });
  }

  static patientCacheKey(patientId: string, demandHash: string): string {
    return `followup:${patientId}:${demandHash}`;
  }
}

// --- LLM Service (main orchestrator) ---

@Injectable()
export class LlmService {
  private readonly logger = new Logger('LlmService');

  constructor(
    private readonly minimaxProvider: MiniMaxProvider,
    private readonly llmCache: LlmCache,
  ) {}

  get isAvailable(): boolean {
    return this.minimaxProvider.isConfigured;
  }

  async generateFollowupRecommendation(params: {
    patientId: string;
    patientName: string;
    age: number;
    tier: string;
    allergyHistory: string | null;
    pastHistory: string | null;
    demands: Array<{ type: string; title: string; status: string }>;
    touchpoints: Array<{ type: string; followupDate: Date | null; outcome: string | null }>;
  }): Promise<FollowupRecommendation | null> {
    // Build cache key
    const demandHash = this.hashDemands(params.demands);
    const cacheKey = LlmCache.patientCacheKey(params.patientId, demandHash);

    // Check cache
    const cached = this.llmCache.get<FollowupRecommendation>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for patient ${params.patientId}, key=${cacheKey}`);
      return cached;
    }

    this.logger.log(`[LLM] Cache miss for patient ${params.patientId}, calling MiniMax API...`);
    this.logger.log(`[LLM] isConfigured=${this.minimaxProvider.isConfigured}, apiKey length=${this.minimaxProvider['apiKey']?.length || 0}`);
    process.stderr.write(`[DEBUG] MiniMax isConfigured: ${this.minimaxProvider.isConfigured}\n`);

    // Build prompt
    const prompt = this.buildFollowupPrompt(params);

    try {
      const response = await this.minimaxProvider.generate(prompt);
      this.logger.log(`LLM response for patient ${params.patientId}: ${response.content.substring(0, 100)}...`);

      // Parse JSON from response
      const result = this.parseJsonResponse(response.content);
      if (!result) {
        throw new Error('Failed to parse LLM JSON response');
      }

      // Cache the result
      this.llmCache.set(cacheKey, result);
      return result;
    } catch (err) {
      this.logger.warn(`LLM failed: ${(err as Error).message}`);
      return null;
    }
  }

  private parseJsonResponse(content: string): FollowupRecommendation | null {
    // Try to extract JSON from the response
    // MiniMax may include reasoning text, so find JSON block
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      this.logger.warn('No JSON found in LLM response');
      return null;
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields exist
      if (!parsed.recommendedContent || !parsed.optimalTime) {
        this.logger.warn('LLM response missing required fields');
        return null;
      }

      return {
        recommendedContent: Array.isArray(parsed.recommendedContent)
          ? parsed.recommendedContent
          : [String(parsed.recommendedContent)],
        optimalTime: String(parsed.optimalTime),
        seasonalAdjustment: parsed.seasonalAdjustment
          ? { topic: parsed.seasonalAdjustment.topic || '' }
          : { topic: '' },
        confidence: typeof parsed.confidence === 'number'
          ? Math.min(Math.max(parsed.confidence, 0), 1)
          : 0.5,
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
      };
    } catch (err) {
      this.logger.warn(`Failed to parse JSON: ${(err as Error).message}, content: ${content.substring(0, 200)}`);
      return null;
    }
  }

  private buildFollowupPrompt(params: {
    patientName: string;
    age: number;
    tier: string;
    allergyHistory: string | null;
    pastHistory: string | null;
    demands: Array<{ type: string; title: string; status: string }>;
    touchpoints: Array<{ type: string; followupDate: Date | null; outcome: string | null }>;
  }): string {
    const now = new Date();
    const seasonal = this.getSeasonalInfo(now);

    const demandList = params.demands.length > 0
      ? params.demands.map(d => `- ${d.type}: ${d.title} (状态: ${d.status})`).join('\n')
      : '无治疗历史';

    const touchpointList = params.touchpoints.length > 0
      ? params.touchpoints
          .filter(t => t.outcome)
          .slice(0, 5)
          .map(t => `- ${t.type}: ${t.outcome}`)
          .join('\n')
      : '无历史触点记录';

    return `患者信息：
- 姓名：${params.patientName}
- 年龄：${params.age > 0 ? params.age : '未知'}岁
- 患者等级：${params.tier === 'HIGH_VALUE' ? '高价值患者' : params.tier === 'LOST_RISK' ? '流失风险患者' : '普通患者'}
- 过敏史：${params.allergyHistory || '无'}
- 既往史：${params.pastHistory || '无'}

治疗历史：
${demandList}

触点反馈历史：
${touchpointList}

当前季节/节日：${seasonal}

请为这位患者生成个性化随访建议。`;
  }

  private getSeasonalInfo(date: Date): string {
    const month = date.getMonth();
    const day = date.getDate();

    if (month === 0 && day <= 3) return '元旦 - 新年新气象，口腔健康从齿开始';
    if (month === 1 && day >= 10 && day <= 16) return '春节期间 - 注意口腔卫生，健康过大年';
    if (month === 3 && day >= 4 && day <= 6) return '清明节 - 清明养生，口腔健康';
    if (month === 4 && day >= 1 && day <= 5) return '劳动节 - 劳动最光荣，健康好生活';
    if (month === 8 && day >= 10 && day <= 12) return '教师节 - 感恩教师，健康口腔';
    if (month === 9 && day >= 1 && day <= 8) return '国庆节 - 国庆假期，注意口腔健康';

    if (month >= 2 && month <= 4) return '春季 - 春季养生，养龈护齿';
    if (month >= 5 && month <= 7) return '夏季 - 夏季清爽口腔护理指南';
    if (month >= 8 && month <= 10) return '秋季 - 秋季进补，口腔先行';
    return '冬季 - 冬季暖心护齿指南';
  }

  private hashDemands(demands: Array<{ type: string; title: string; status: string }>): string {
    const key = demands.map(d => `${d.type}:${d.status}`).sort().join('|');
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) & 0xffffffff;
    }
    return hash.toString(16);
  }
}
