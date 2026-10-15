import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

export type TransactionClient = Prisma.TransactionClient;

@Injectable()
export class TransactionRunner {
  constructor(private readonly prisma: PrismaService) {}

  run<T>(work: (client: TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((client) => work(client));
  }
}
