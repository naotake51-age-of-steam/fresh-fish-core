import { context } from "game";
import { State } from "./State";
import { CenterTile, MapSpace } from "objects";

export class CenterTileMapSpace extends State {
  constructor(
    public readonly centerTileId: number,
    public readonly mapSpaceId: number
  ) {
    super();
  }

  get centerTile(): CenterTile {
    const { g } = context();

    return g.centerTiles[this.centerTileId];
  }

  get mapSpace(): MapSpace {
    const { g } = context();

    return g.mapSpaces[this.mapSpaceId];
  }
}
