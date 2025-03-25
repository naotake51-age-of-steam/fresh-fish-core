import { context } from "game";
import { MAP_SPACE_HEIGHT, MAP_SPACE_WIDTH, Marker } from "objects";
import { CenterTile } from "./CenterTile";
import { WallTile } from "./WallTile";
import { RoadTile } from "./RoadTile";
import { OutletTile } from "./OutletTile";

export class MapSpace {
  constructor(
    public readonly id: number,
    public readonly row: number,
    public readonly col: number
  ) {}

  get relatedMapSpaces(): MapSpace[] {
    const { g } = context();

    const result: MapSpace[] = [];

    // 上
    if (this.row - 1 >= 0) {
      result.push(g.getMapSpace(this.row - 1, this.col));
    }

    // 右
    if (this.col - 1 >= 0) {
      result.push(g.getMapSpace(this.row, this.col - 1));
    }

    // 下
    if (this.row + 1 < g.mapSpacesSize) {
      result.push(g.getMapSpace(this.row + 1, this.col));
    }

    // 左
    if (this.col + 1 < g.mapSpacesSize) {
      result.push(g.getMapSpace(this.row, this.col + 1));
    }

    return result;
  }

  get x(): number {
    return this.col * this.width;
  }

  get y(): number {
    return this.row * this.height;
  }

  get height(): number {
    return MAP_SPACE_HEIGHT;
  }

  get width(): number {
    return MAP_SPACE_WIDTH;
  }

  get image(): string {
    return "map-space.svg";
  }

  get selectableImage(): string {
    return "map-space-overlay-2.svg";
  }

  get activeImage(): string {
    return "map-space-overlay.svg";
  }

  get isEdge(): boolean {
    const { g } = context();

    return (
      this.row === 0 ||
      this.col === 0 ||
      this.row === g.mapSpacesSize - 1 ||
      this.col === g.mapSpacesSize - 1
    );
  }

  get centerTile(): CenterTile | null {
    const { g } = context();

    return g.centerTileIndexByMapSpace.get(this.id)?.centerTile ?? null;
  }

  get wallTile(): WallTile | null {
    const { g } = context();

    return g.wallTileIndexByMapSpace.get(this.id)?.wallTile ?? null;
  }

  get roadTile(): RoadTile | null {
    const { g } = context();

    return g.roadTileIndexByMapSpace.get(this.id)?.roadTile ?? null;
  }

  get outletTile(): OutletTile | null {
    const { g } = context();

    return g.outletTileIndexByMapSpace.get(this.id)?.outletTile ?? null;
  }

  get marker(): Marker | null {
    const { g } = context();

    return g.markerIndexByMapSpace.get(this.id)?.marker ?? null;
  }

  get isEmpty(): boolean {
    return !this.hasTile && this.marker === null;
  }

  get hasTile(): boolean {
    return (
      this.centerTile !== null ||
      this.wallTile !== null ||
      this.roadTile !== null ||
      this.outletTile !== null
    );
  }

  get isThrough(): boolean {
    return (
      this.wallTile === null &&
      this.centerTile === null &&
      this.outletTile === null
    );
  }
}
