import { context } from "game";
import { State } from "./State";
import { MapSpace, RoadTile } from "objects";

export class RoadTileMapSpace extends State {
  constructor(
    public readonly roadTileId: number,
    public readonly mapSpaceId: number
  ) {
    super();
  }

  get roadTile(): RoadTile {
    const { g } = context();

    return g.roadTiles[this.roadTileId];
  }

  get mapSpace(): MapSpace {
    const { g } = context();

    return g.mapSpaces[this.mapSpaceId];
  }
}
