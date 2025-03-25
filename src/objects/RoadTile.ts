import { context } from "game";
export class RoadTile {
  constructor(public readonly id: number) {}

  get image(): string {
    return "road-tile.svg";
  }

  get isPlaced(): boolean {
    const { g } = context();

    return g.mapSpaceIndexByRoadTile.has(this.id);
  }
}
