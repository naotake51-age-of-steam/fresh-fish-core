import { context, type Player } from "../game";
import { State } from "./State";
export class User extends State {
  constructor(public readonly id: string, public readonly name: string) {
    super();
  }

  public get player(): Player | null {
    const { g } = context();
    return g.players.find((_) => _.uid === this.id) ?? null;
  }
}
