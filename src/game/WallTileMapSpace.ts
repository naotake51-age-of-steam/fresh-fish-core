import { context } from "game";
import { State } from "./State";
import { MapSpace, WallTile } from "objects";

export class WallTileMapSpace extends State {
  constructor(
    public readonly wallTileId: number,
    public readonly mapSpaceId: number
  ) {
    super();
  }

  get wallTile(): WallTile {
    const { g } = context();

    return g.wallTiles[this.wallTileId];
  }

  get mapSpace(): MapSpace {
    const { g } = context();

    return g.mapSpaces[this.mapSpaceId];
  }
}
