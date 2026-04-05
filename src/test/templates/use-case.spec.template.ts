// Template base para tests unitarios de Use Cases
// 1) Copia este archivo junto al use case y renombralo a <nombre>.spec.ts
// 2) Reemplaza tokens __UseCaseName__ y __executeMethod__
// 3) Ajusta tipos/contratos de repositorios y asserts del escenario real

import type { ILogger } from '../../core/application/services/logger.interface';

describe('__UseCaseName__', () => {
  type Deps = ReturnType<typeof makeDeps>;

  function makeLogger(): ILogger {
    return {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
  }

  function makeDeps() {
    // Reemplaza estos mocks con puertos reales del use case.
    const repository = {
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const notifier = {
      emitNewMessage: jest.fn(),
      emitStatusUpdate: jest.fn(),
      emitChatUpdate: jest.fn(),
    };

    const logger = makeLogger();

    return {
      repository,
      notifier,
      logger,
    };
  }

  function makeSut(deps: Deps) {
    // Reemplaza con el constructor real de tu use case.
    // return new __UseCaseName__(deps.repository, deps.notifier, deps.logger);
    return {
      __executeMethod__: async (_input: unknown) => Promise.resolve(undefined),
    };
  }

  it('executes happy path', async () => {
    const deps = makeDeps();
    const sut = makeSut(deps);

    await sut.__executeMethod__({});

    expect(true).toBe(true);
  });

  it('handles error path', async () => {
    const deps = makeDeps();
    const sut = makeSut(deps);

    await sut.__executeMethod__({});

    expect(true).toBe(true);
  });
});
