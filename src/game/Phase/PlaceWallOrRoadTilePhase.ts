import { PhaseId } from "enums";
import { Phase } from "./Phase";
import { GameBuilder } from "../GameBuilder";
import { context, Game } from "game";
import { WallTile, MapSpace, RoadTile } from "objects";
import { PrepareSelectActionPhase } from "./PrepareSelectActionPhase";
import { WallTileMapSpace } from "game/WallTileMapSpace";
import { RoadTileMapSpace } from "game/RoadTileMapSpace";

export class PlaceWallOrRoadTilePhase extends Phase {
  public readonly id = PhaseId.PLACE_WALL_OR_ROAD_TILE;

  constructor() {
    super();
  }

  public get message(): string {
    const { g } = context();

    if (g.turnPlayer === null) throw new Error("turn player is null");

    return `${g.turnPlayer.name}は配置するタイルとスペースを選択してください。`;
  }

  public isTurnPlayer(): boolean {
    const { p } = context();

    return p?.hasTurn ?? false;
  }

  public get roadTile(): RoadTile | null {
    const { g } = context();

    return g.remainingRoadTiles[0] ?? null;
  }

  public get wallTile(): WallTile | null {
    const { g } = context();

    return g.remainingWallTiles[0] ?? null;
  }

  public canPlaceMapSpace(mapSpace: MapSpace): boolean {
    const { p } = context();

    if (!p?.hasTurn) return false;

    return !mapSpace.hasTile && mapSpace.marker?.playerId === p.id;
  }

  public actionPlaceMapSpace(
    mapSpaceId: number,
    type: "RoadTile" | "WallTile"
  ): Game {
    const { g } = context();
    const b = new GameBuilder(g);

    const mapSpace = g.mapSpaces[mapSpaceId];

    if (!mapSpace) throw new Error("map space is undefined");

    if (!this.canPlaceMapSpace(mapSpace)) {
      throw new Error("Cannot place map space");
    }

    if (type === "RoadTile") {
      if (!this.roadTile) {
        throw new Error("Cannot select road tile");
      }

      b.addRoadTileMapSpace(
        new RoadTileMapSpace(this.roadTile!.id, mapSpace.id)
      );
    } else {
      if (!this.wallTile) {
        throw new Error("Cannot select wall tile");
      }

      b.addWallTileMapSpace(
        new WallTileMapSpace(this.wallTile!.id, mapSpace.id)
      );
    }

    b.removeMarkerMapSpace(mapSpace.marker!);

    return PrepareSelectActionPhase.prepare(b, g.nextPlayer).build();
  }

  public canPass(): boolean {
    const { p } = context();

    if (!p?.hasTurn) return false;

    return !p.hasReservingMarker;
  }

  public actionPass(): Game {
    const { g } = context();
    const b = new GameBuilder(g);

    return PrepareSelectActionPhase.prepare(b, g.nextPlayer).build();
  }
}
