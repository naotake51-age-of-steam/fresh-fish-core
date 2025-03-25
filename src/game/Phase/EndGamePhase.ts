import { PhaseId } from "enums";
import { Phase } from "./Phase";
import { GameBuilder } from "../GameBuilder";

export class EndGamePhase extends Phase {
  public readonly id = PhaseId.END_GAME;

  constructor() {
    super();
  }

  public static prepare(b: GameBuilder): GameBuilder {
    return b.setTurnPlayer(null);
  }

  public get message(): string {
    return "";
  }
}
