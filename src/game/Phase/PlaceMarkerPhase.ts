import { PhaseId } from "enums";
import { Phase } from "./Phase";
import { GameBuilder } from "../GameBuilder";
import { context, type Game } from "game";
import { MapSpace } from "objects";
import { MarkerMapSpace } from "game/MarkerMapSpace";
import { PrepareSelectActionPhase } from "./PrepareSelectActionPhase";

export class PlaceMarkerPhase extends Phase {
  public readonly id = PhaseId.PLACE_MARKER;

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

    return `${g.turnPlayer.name}はマーカーを配置するスペースを選択してください。`;
  }

  public canPlaceMapSpace(mapSpace: MapSpace): boolean {
    const { p } = context();

    if (!p?.hasTurn) return false;

    return mapSpace.isEmpty;
  }

  public actionPlaceMapSpace(mapSpaceId: number): Game {
    const { g, p } = context();
    const b = new GameBuilder(g);

    const mapSpace = g.mapSpaces[mapSpaceId];

    if (!mapSpace) throw new Error("map space is undefined");

    if (!this.canPlaceMapSpace(mapSpace)) {
      throw new Error("Cannot place map space");
    }

    const remainingMarker = p!.remainingMarkers[0];
    if (!remainingMarker) {
      throw new Error("remaining marker is undefined");
    }

    b.addMarkerMapSpace(new MarkerMapSpace(remainingMarker.id, mapSpace.id));

    return PrepareSelectActionPhase.prepare(b, g.nextPlayer).build();
  }
}
