import { NotFoundException } from '@nestjs/common';
import { Request } from 'express';

export const getUserIdFromReq = (req: Request): string => {
  const token = req['user'];
  if (!token) {
    throw new NotFoundException('User not found');
  }

  return token.sub;
};
