import { PhaseId } from "enums";
import { Phase } from "./Phase";
import { GameBuilder } from "../GameBuilder";
import {
  AuctionAndPlaceOutletTilePhase,
  context,
  PlaceMarkerPhase,
  type Game,
} from "game";
import { GameError } from "errors";
import { PlaceWallTilePhase } from "./PlaceWallTilePhase";
import { WallTile } from "objects";
import { OutletTile } from "objects";
import { PrepareSelectActionPhase } from "./PrepareSelectActionPhase";

export class SelectActionPhase extends Phase {
  public readonly id = PhaseId.SELECT_ACTION;

  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static prepare(b: GameBuilder): GameBuilder {
    throw new Error("Not implemented");
  }

  public get message(): string {
    const { g } = context();

    if (g.turnPlayer === null) throw new Error("turn player is null");

    return `${g.turnPlayer.name}はアクションを選択してください。`;
  }

  public isTurnPlayer(): boolean {
    const { p } = context();

    return p?.hasTurn ?? false;
  }

  public canSelectPlaceMarkerAction(): boolean {
    const { g, p } = context();

    if (p === null) throw new Error("player is null");
    if (!p.hasTurn) throw new Error("player does not have turn");

    return p.hasRemainingMarker && g.hasEmptyMapSpace;
  }

  public actionSelectPlaceMarkerAction(): Game {
    const { g } = context();
    const b = new GameBuilder(g);

    if (!this.canSelectPlaceMarkerAction()) {
      throw new GameError("Cannot select place marker action");
    }

    return b.setPhase(new PlaceMarkerPhase()).build();
  }

  public canSelectPlaceTileAction(): boolean {
    const { g, p } = context();

    if (p === null) throw new Error("player is null");
    if (!p.hasTurn) throw new Error("player does not have turn");

    return p.hasReservingMarker && g.hasRemainingDrawableTile;
  }

  public actionSelectPlaceTileAction(): Game {
    const { g, p } = context();
    const b = new GameBuilder(g);

    if (!this.canSelectPlaceTileAction()) {
      throw new GameError("Cannot select place tile action");
    }

    const tile = g.drawTile();

    if (tile instanceof WallTile) {
      return PlaceWallTilePhase.prepare(b, tile).build();
    }

    if (tile instanceof OutletTile) {
      return AuctionAndPlaceOutletTilePhase.prepare(b, p!, tile).build();
    }

    throw new Error("tile is not WallTile or OutletTile");
  }

  public canSelectPassAction(): boolean {
    const { p } = context();

    if (p === null) throw new Error("player is null");
    if (!p.hasTurn) throw new Error("player does not have turn");

    return (
      !this.canSelectPlaceMarkerAction() && !this.canSelectPlaceTileAction()
    );
  }

  public actionSelectPassAction(): Game {
    const { g } = context();
    const b = new GameBuilder(g);

    if (!this.canSelectPassAction()) {
      throw new GameError("Cannot select pass action");
    }

    return PrepareSelectActionPhase.prepare(b, g.nextPlayer).build();
  }
}
