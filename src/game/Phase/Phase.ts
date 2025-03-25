import { type PhaseId } from "../../enums";
import { type Game, State } from "../../game";

export abstract class Phase extends State {
  abstract id: PhaseId;
  abstract message: string;
}

export interface HasDelayExecute {
  executeDelay: () => Game;
}

export function hasDelayExecute(value: unknown): value is HasDelayExecute {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const { executeDelay } = value as Record<keyof HasDelayExecute, unknown>;
  if (typeof executeDelay !== "function") {
    return false;
  }
  return true;
}
