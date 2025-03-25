import { context } from "game";
export class WallTile {
  constructor(public readonly id: number) {}

  get image(): string {
    return "wall-tile.svg";
  }

  get isPlaced(): boolean {
    const { g } = context();

    return g.mapSpaceIndexByWallTile.has(this.id);
  }
}
