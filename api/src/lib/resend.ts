import { Resend } from 'resend';
import { getInfisicalSecret } from '@/utils/infisical/get-infisical-secret.ts';

export const resend = new Resend(await getInfisicalSecret({ secretName: "RESEND_API_KEY" }));
