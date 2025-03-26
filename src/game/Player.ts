import { CenterType, PlayerColor } from "enums";
import { context } from "../game";
import { State } from "./State";
import { Marker, OutletTile } from "objects";

export class Player extends State {
  constructor(
    public readonly id: number,
    public readonly uid: string,
    public readonly name: string,
    public readonly color: PlayerColor,
    public readonly order: number,
    public readonly markerCount: number,
    public readonly money: number
  ) {
    super();
  }

  public get hasTurn(): boolean {
    const { g } = context();

    return g.turnPlayer?.id === this.id;
  }

  get markers(): Marker[] {
    const { g } = context();

    return g.markers.filter((marker) => marker.playerId === this.id);
  }

  get useableMarkers(): Marker[] {
    const { g } = context();

    const outletTilePlacedCount = g.outletTiles.filter(
      (outletTile) => outletTile.mapSpace?.marker?.playerId === this.id
    ).length;

    if (outletTilePlacedCount === 0)
      return this.markers.slice(0, this.markers.length - 2);
    if (outletTilePlacedCount === 1)
      return this.markers.slice(0, this.markers.length - 1);

    return this.markers;
  }

  get remainingMarkers(): Marker[] {
    return this.useableMarkers.filter((marker) => !marker.isPlaced);
  }

  get hasRemainingMarker(): boolean {
    return this.remainingMarkers.length > 0;
  }

  get reservingMarkers(): Marker[] {
    return this.useableMarkers.filter((marker) => marker.isReserving);
  }

  get hasReservingMarker(): boolean {
    return this.reservingMarkers.length > 0;
  }

  hasOutletTile(centerType: CenterType): boolean {
    return this.useableMarkers.some(
      (marker) => marker.mapSpace?.outletTile?.type === centerType
    );
  }

  getOutletTile(centerType: CenterType): OutletTile | null {
    const { g } = context();

    return (
      g.outletTiles.find(
        (outletTile) =>
          outletTile.type === centerType &&
          outletTile.mapSpace?.marker?.playerId === this.id
      ) ?? null
    );
  }
}
