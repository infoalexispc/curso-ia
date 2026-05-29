import { Router } from 'express';
import OpenAI from 'openai';
import { JobModel } from '../models/job.js';

export const aiRouter = Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});