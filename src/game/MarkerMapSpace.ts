import { context } from "game";
import { State } from "./State";
import { MapSpace, Marker } from "objects";

export class MarkerMapSpace extends State {
  constructor(
    public readonly markerId: number,
    public readonly mapSpaceId: number
  ) {
    super();
  }

  get marker(): Marker {
    const { g } = context();

    return g.markers[this.markerId];
  }

  get mapSpace(): MapSpace {
    const { g } = context();

    return g.mapSpaces[this.mapSpaceId];
  }
}
