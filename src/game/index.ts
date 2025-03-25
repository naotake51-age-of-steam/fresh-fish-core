export * from "./Game";
export * from "./User";
export * from "./Player";
export * from "./State";
export * from "./Phase";

import { plainToInstance, instanceToPlain } from "class-transformer";

import { Game } from "./Game";
import { User } from "./User";
import { type Player } from "./Player";

interface Context {
  g: Game;
  u: User;
  p: Player | null;
}

let _context: Context | null = null;

export function setContext(g: Game, u: User): Readonly<Context> {
  _context = { g, u, p: g.players.find((_) => _.uid === u.id) ?? null };
  return _context;
}

export function context(): Readonly<Context> {
  if (_context === null) throw new Error("Context is not initialized");

  return _context;
}

export function withContext<T>(g: Game, u: User, callback: () => T): T {
  // NOTE:: 現状、非同期処理は考慮していない。必要であればAsyncLocalStorageを使って実すする。
  const prevContext = _context;
  try {
    _context = setContext(g, u);

    return callback();
  } finally {
    _context = prevContext;
  }
}

export function toPlain(game: Game): object {
  return instanceToPlain(game);
}

export function toInstance(plain: object): Game {
  return plainToInstance(Game, plain);
}
