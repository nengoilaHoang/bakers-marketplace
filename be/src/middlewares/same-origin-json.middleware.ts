import type { Request, Response, NextFunction } from 'express';

export function sameOriginJsonMiddleware(req: Request, res: Response, next: NextFunction): void {
  const fetchSite = req.get('Sec-Fetch-Site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    res.status(403).json({ message: 'Yêu cầu phải được gửi từ cùng website.' });
    return;
  }
  // Check the header directly: req.is() returns null for bodyless requests.
  if (req.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    res.status(415).json({ message: 'Yêu cầu phải dùng application/json.' });
    return;
  }
  next();
}
