import { analysisQueue } from './analysisQueue.js';
import Project from '../models/Project.js';

export async function getJobStatus(jobId, userId) {
  const job = await analysisQueue.getJob(jobId);
  if (!job) return null;
  const state = await job.getState();
  const result = await job.getReturnValue().catch(() => null);

  // Ownership check: job.data.userId must match requester
  if (userId && job.data?.userId && job.data.userId !== userId) {
    return { unauthorized: true };
  }

  // Also check project ownership if projectId present
  if (job.data?.projectId && userId) {
    const project = await Project.findById(job.data.projectId).select('user');
    if (project && project.user.toString() !== userId) {
      return { unauthorized: true };
    }
  }

  return { jobId, state, result };
}
