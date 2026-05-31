// src/lib/prisma.ts
    // src/lib/prisma.ts
    import { PrismaClient } from '@prisma/client'


    export const prisma = new PrismaClient({
      log: ['query', 'error'], // Isso vai mostrar os comandos SQL no terminal sempre que uma rota rodar!
         errorFormat: 'pretty', // Isso vai mostrar os erros de forma mais legível no terminal
    });
