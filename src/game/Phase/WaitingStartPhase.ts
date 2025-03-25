import { type PlayerColor, PhaseId } from "enums";
import { type Game, context, Player } from "game";
import { shuffleArray } from "utility";
import { Phase } from "./Phase";
import { GameBuilder } from "../GameBuilder";
import { GameError } from "errors";
import { CenterTileMapSpace } from "../CenterTileMapSpace";
import { PrepareSelectActionPhase } from "./PrepareSelectActionPhase";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 5;
const INITIALIZE_MARKER_COUNT = 6;
const INITIALIZE_MONEY = 15;

export class WaitingStartPhase extends Phase {
  public readonly id = PhaseId.WAITING_START;

  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static prepare(b: GameBuilder): GameBuilder {
    throw new Error("Not implemented");
  }

  public get message(): string {
    return "参加者募集中";
  }

  public canJoinUser(): boolean {
    const { g, p } = context();

    if (MAX_PLAYERS <= g.players.length) {
      return false;
    }

    return p === null;
  }

  public canSelectColor(color: PlayerColor): boolean {
    const { g } = context();

    return g.players.every((_) => _.color !== color);
  }

  public actionJoinUser(color: PlayerColor): Game {
    const { g, u } = context();
    const b = new GameBuilder(g);

    if (!this.canJoinUser()) {
      throw new GameError("Cannot join user");
    }

    if (!this.canSelectColor(color)) {
      throw new GameError("Cannot select color");
    }

    return b
      .setPlayers([
        ...g.players,
        new Player(
          Math.max(...g.players.map((_) => _.id), 0) + 1,
          u.id,
          u.name,
          color,
          0,
          INITIALIZE_MARKER_COUNT,
          INITIALIZE_MONEY
        ),
      ])
      .build();
  }

  public canRemoveUser(): boolean {
    const { p } = context();

    return p !== null;
  }

  public actionRemoveUser(): Game {
    const { g, p } = context();
    const b = new GameBuilder(g);

    if (!this.canRemoveUser()) {
      throw new GameError("Cannot remove user");
    }

    return b.setPlayers(g.players.filter((_) => _.id !== p?.id)).build();
  }

  public canStartGame(): boolean {
    const { g, p } = context();

    if (p === null) {
      // 参加しているユーザーでない場合はゲーム開始できない
      return false;
    }

    return MIN_PLAYERS <= g.players.length && g.players.length <= MAX_PLAYERS;
  }

  public actionStartGame(): Game {
    const { g } = context();
    const b = new GameBuilder(g);

    if (!this.canStartGame()) {
      throw new GameError("Cannot start game");
    }

    const players = shuffleArray(g.players).map((_, i) => {
      return _.produce((draft) => {
        draft.order = i + 1;
      });
    });

    const _shuffleMapSpaces = shuffleArray(
      g.mapSpaces.filter((_) => !_.isEdge)
    );

    b.setPlayers(players).setCenterTileMapSpaces(
      g.centerTiles.map(
        (centerTile) =>
          new CenterTileMapSpace(centerTile.id, _shuffleMapSpaces.pop()!.id)
      )
    );

    return PrepareSelectActionPhase.prepare(b, players[0]).build();
  }
}
