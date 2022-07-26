import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class NoCacheMiddleware implements NestMiddleware {
  use(req, res, next) {
    res.header('Cache-Control', 'no-cache, no-store');
    res.header('Pragma', 'no-cache');
    res.header('Expires', 0);
    next();
  }
}
