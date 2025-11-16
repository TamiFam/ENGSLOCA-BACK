// websocket/wsAuthMiddleware.js
import { authenticateToken, parseCookies } from '../utils/authUtils.js';

export const wsAuthMiddleware = async (request) => {
  const cookies = parseCookies(request.headers.cookie);
  return await authenticateToken(cookies);
};