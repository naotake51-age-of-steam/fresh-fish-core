import { context } from "game";
import { State } from "./State";
import { MapSpace, OutletTile } from "objects";

export class OutletTileMapSpace extends State {
  constructor(
    public readonly outletTileId: number,
    public readonly mapSpaceId: number
  ) {
    super();
  }

  get outletTile(): OutletTile {
    const { g } = context();

    return g.outletTiles[this.outletTileId];
  }

  get mapSpace(): MapSpace {
    const { g } = context();

    return g.mapSpaces[this.mapSpaceId];
  }
}
