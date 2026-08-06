import { VercelRequest, VercelResponse } from '@vercel/node';
import reportHandler from './report';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return reportHandler(req, res);
}
