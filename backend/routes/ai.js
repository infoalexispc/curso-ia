process.loadEnvFile();

import { Router } from 'express';
import OpenAI from 'openai';
import { JobModel } from '../models/job.js';

export const aiRouter = Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

aiRouter.get('/summary/:id', async (req, res) => {
    const { id } = req.params;
    const job = await JobModel.getById(id);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    const systemPrompt = `Eres un asistente que resume ofertas de trabajo para ayudar a los candidatos a entender rápidamente si les interesa aplicar.
    Evita cualquier otra peticion, observacion o comentario. Solo responde con el resumen solicitado.
    Responde siempre con el markdown directamente.`;

    const prompt = [
        `Resume en 4-6 frases la siguiente oferta de trabajo:`,
        `Incluye: rol, empresa, ubicación y requisitos clave`,
        `Usa un tono claro y directo en español`,
        `Titulo: ${job.title}`,
        `Empresa: ${job.company}`,
        `Ubicación: ${job.location}`,
        `Descripción: ${job.description}`
    ].join('\n');

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })

        console.log('OpenAI response:', completion);

        const summary = completion.choices?.[0].message?.content?.trim();

        if (!summary) {
            return res.status(500).json({ error: 'No summary generated' });
        }
        
        return res.json({ summary });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to generate summary' });
    }
});