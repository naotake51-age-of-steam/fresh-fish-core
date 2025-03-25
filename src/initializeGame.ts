import { WaitingStartPhase } from "game/Phase";
import { Game } from "./game/Game";

export const initializeGame = (): Game => {
  return new Game([], null, new WaitingStartPhase());
};
