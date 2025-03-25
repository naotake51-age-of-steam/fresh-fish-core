import { PhaseId } from "enums";
import { Phase } from "./Phase";
import { GameBuilder } from "../GameBuilder";
import { context, type Game } from "game";
import { WallTile, MapSpace } from "objects";
import { WallTileMapSpace } from "game/WallTileMapSpace";
import { PrepareSelectActionPhase } from "./PrepareSelectActionPhase";

export class PlaceWallTilePhase extends Phase {
  public readonly id = PhaseId.PLACE_WALL_TILE;

  constructor(public readonly wallTileId: number) {
    super();
  }

  public static prepare(b: GameBuilder, wallTile: WallTile): GameBuilder {
    return b.setPhase(new PlaceWallTilePhase(wallTile.id));
  }

  public get message(): string {
    const { g } = context();

    if (g.turnPlayer === null) throw new Error("turn player is null");

    return `${g.turnPlayer.name}は壁タイルを配置するスペースを選択してください。`;
  }

  public get wallTile(): WallTile {
    const { g } = context();

    return g.wallTiles[this.wallTileId];
  }

  public canPlaceMapSpace(mapSpace: MapSpace): boolean {
    const { p } = context();

    if (!p?.hasTurn) return false;

    return !mapSpace.hasTile && mapSpace.marker?.playerId === p.id;
  }

  public actionPlaceMapSpace(mapSpaceId: number): Game {
    const { g } = context();
    const b = new GameBuilder(g);

    const mapSpace = g.mapSpaces[mapSpaceId];

    if (!mapSpace) throw new Error("map space is undefined");

    if (!this.canPlaceMapSpace(mapSpace)) {
      throw new Error("Cannot place map space");
    }

    // TODO:: 道タイルを配置する処理を追加する

    b.addWallTileMapSpace(
      new WallTileMapSpace(this.wallTile.id, mapSpace.id)
    ).removeMarkerMapSpace(mapSpace.marker!);

    return PrepareSelectActionPhase.prepare(b, g.nextPlayer).build();
  }
}
