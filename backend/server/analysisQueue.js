import { Queue, Worker, QueueScheduler, JobsOptions } from 'bullmq';
import { analyzeLinks } from './geminiService.js';
import logger from './logger.js';
import { setCachedAnalysis } from './cache.js';

const connection = process.env.REDIS_URL ? { url: process.env.REDIS_URL } : null;

export const analysisQueue = new Queue('analysis', { connection });
new QueueScheduler('analysis', { connection });

const DEFAULT_JOB_OPTS = {
  attempts: Number(process.env.ANALYSIS_JOB_ATTEMPTS || 3),
  backoff: { type: 'exponential', delay: Number(process.env.ANALYSIS_JOB_BACKOFF_MS || 5000) },
  removeOnComplete: 100,
  removeOnFail: 500
};

export function enqueueAnalysis({ links, userId, projectId }) {
  return analysisQueue.add('analyze', { links, userId, projectId }, DEFAULT_JOB_OPTS);
}

// Worker (run in same process for simplicity)
export const analysisWorker = new Worker('analysis', async job => {
  const { links, userId, projectId } = job.data;
  const result = await analyzeLinks(links);

  // Best-effort cache write with a deterministic key
  try {
    const crypto = await import('crypto');
    const cacheKey = crypto.createHash('sha256').update(JSON.stringify({ model: process.env.GEMINI_MODEL, links: links.sort() })).digest('hex');
    await setCachedAnalysis(cacheKey, result);
  } catch (err) {
    logger.warn({ err }, 'Failed to cache analysis in worker');
  }

  // Persist result back to project if available
  if (projectId) {
    try {
      const { default: Project } = await import('../models/Project.js');
      await Project.findByIdAndUpdate(projectId, { $set: { analysis: { status: 'completed', result } } });
    } catch (err) {
      logger.warn({ err, projectId }, 'Failed to persist analysis to project');
    }
  }

  return { result, userId, projectId };
}, { connection });

analysisWorker.on('completed', job => {
  logger.info({ jobId: job.id }, 'Analysis job completed');
});
analysisWorker.on('failed', (job, err) => {
  logger.warn({ jobId: job?.id, err }, 'Analysis job failed');
});
