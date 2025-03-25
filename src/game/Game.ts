import "reflect-metadata";
import { Type, Exclude, Transform, plainToInstance } from "class-transformer";
import { State } from "./State";
import { Player } from "./Player";
import { PhaseId } from "enums";
import { match } from "ts-pattern";
import { range, createUniqueIndex, shuffleArray } from "../utility";
import { context } from "game";

import {
  Phase,
  WaitingStartPhase,
  SelectActionPhase,
  PrepareSelectActionPhase,
  PlaceMarkerPhase,
  PlaceWallTilePhase,
  AuctionAndPlaceOutletTilePhase,
  EndGamePhase,
} from "./Phase";
import { CenterType } from "enums";
import { CenterTileMapSpace } from "./CenterTileMapSpace";
import { WallTileMapSpace } from "./WallTileMapSpace";
import { RoadTileMapSpace } from "./RoadTileMapSpace";
import { OutletTileMapSpace } from "./OutletTileMapSpace";
import { MarkerMapSpace } from "./MarkerMapSpace";
import {
  MapSpace,
  CenterTile,
  WallTile,
  RoadTile,
  OutletTile,
  Marker,
} from "objects";

export class Game extends State {
  @Exclude()
  private __mapSpaces?: MapSpace[];

  @Exclude()
  private __wallTiles?: WallTile[];

  @Exclude()
  private __roadTiles?: RoadTile[];

  @Exclude()
  private __outletTiles?: OutletTile[];

  @Exclude()
  private __markers?: Marker[];

  @Exclude()
  private __centerTileIndexByMapSpace?: Map<number, CenterTileMapSpace>;

  @Exclude()
  private __mapSpaceIndexByCenterTile?: Map<number, CenterTileMapSpace>;

  @Exclude()
  private __wallTileIndexByMapSpace?: Map<number, WallTileMapSpace>;

  @Exclude()
  private __mapSpaceIndexByWallTile?: Map<number, WallTileMapSpace>;

  @Exclude()
  private __roadTileIndexByMapSpace?: Map<number, RoadTileMapSpace>;

  @Exclude()
  private __mapSpaceIndexByRoadTile?: Map<number, RoadTileMapSpace>;

  @Exclude()
  private __outletTileIndexByMapSpace?: Map<number, OutletTileMapSpace>;

  @Exclude()
  private __mapSpaceIndexByOutletTile?: Map<number, OutletTileMapSpace>;

  @Exclude()
  private __markerIndexByMapSpace?: Map<number, MarkerMapSpace>;

  @Exclude()
  private __mapSpaceIndexByMarker?: Map<number, MarkerMapSpace>;

  @Type(() => Player)
  public readonly players: Player[];

  @Type(() => CenterTileMapSpace)
  public readonly centerTileMapSpaces: CenterTileMapSpace[];

  @Type(() => WallTileMapSpace)
  public readonly wallTileMapSpaces: WallTileMapSpace[];

  @Type(() => RoadTileMapSpace)
  public readonly roadTileMapSpaces: RoadTileMapSpace[];

  @Type(() => OutletTileMapSpace)
  public readonly outletTileMapSpaces: OutletTileMapSpace[];

  @Type(() => MarkerMapSpace)
  public readonly markerMapSpaces: MarkerMapSpace[];

  @Transform(({ value }) => {
    return plainToInstance(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      match(PhaseId[value.id])
        .with(PhaseId.WAITING_START, () => WaitingStartPhase)
        .with(PhaseId.PREPARE_SELECT_ACTION, () => PrepareSelectActionPhase)
        .with(PhaseId.SELECT_ACTION, () => SelectActionPhase)
        .with(PhaseId.PLACE_MARKER, () => PlaceMarkerPhase)
        .with(PhaseId.PLACE_WALL_TILE, () => PlaceWallTilePhase)
        .with(
          PhaseId.AUCTION_AND_PLACE_OUTLET_TILE,
          () => AuctionAndPlaceOutletTilePhase
        )
        .with(PhaseId.END_GAME, () => EndGamePhase)
        .exhaustive(),
      value
    );
  })
  public readonly phase: Phase;

  constructor(
    players: Player[],
    public readonly turnPlayerId: number | null = null,
    phase: Phase,
    centerTileMapSpaces: CenterTileMapSpace[] = [],
    wallTileMapSpaces: WallTileMapSpace[] = [],
    roadTileMapSpaces: RoadTileMapSpace[] = [],
    outletTileMapSpaces: OutletTileMapSpace[] = [],
    markerMapSpaces: MarkerMapSpace[] = []
  ) {
    super();

    this.players = players;
    this.phase = phase;
    this.centerTileMapSpaces = centerTileMapSpaces;
    this.wallTileMapSpaces = wallTileMapSpaces;
    this.roadTileMapSpaces = roadTileMapSpaces;
    this.outletTileMapSpaces = outletTileMapSpaces;
    this.markerMapSpaces = markerMapSpaces;
  }

  get centerTileIndexByMapSpace(): Map<number, CenterTileMapSpace> {
    return (this.__centerTileIndexByMapSpace ??= createUniqueIndex(
      this.centerTileMapSpaces,
      "mapSpaceId"
    ));
  }

  get mapSpaceIndexByCenterTile(): Map<number, CenterTileMapSpace> {
    return (this.__mapSpaceIndexByCenterTile ??= createUniqueIndex(
      this.centerTileMapSpaces,
      "centerTileId"
    ));
  }

  get wallTileIndexByMapSpace(): Map<number, WallTileMapSpace> {
    return (this.__wallTileIndexByMapSpace ??= createUniqueIndex(
      this.wallTileMapSpaces,
      "mapSpaceId"
    ));
  }

  get mapSpaceIndexByWallTile(): Map<number, WallTileMapSpace> {
    return (this.__mapSpaceIndexByWallTile ??= createUniqueIndex(
      this.wallTileMapSpaces,
      "wallTileId"
    ));
  }

  get roadTileIndexByMapSpace(): Map<number, RoadTileMapSpace> {
    return (this.__roadTileIndexByMapSpace ??= createUniqueIndex(
      this.roadTileMapSpaces,
      "mapSpaceId"
    ));
  }

  get mapSpaceIndexByRoadTile(): Map<number, RoadTileMapSpace> {
    return (this.__mapSpaceIndexByRoadTile ??= createUniqueIndex(
      this.roadTileMapSpaces,
      "roadTileId"
    ));
  }

  get outletTileIndexByMapSpace(): Map<number, OutletTileMapSpace> {
    return (this.__outletTileIndexByMapSpace ??= createUniqueIndex(
      this.outletTileMapSpaces,
      "mapSpaceId"
    ));
  }

  get mapSpaceIndexByOutletTile(): Map<number, OutletTileMapSpace> {
    return (this.__mapSpaceIndexByOutletTile ??= createUniqueIndex(
      this.outletTileMapSpaces,
      "outletTileId"
    ));
  }

  get markerIndexByMapSpace(): Map<number, MarkerMapSpace> {
    return (this.__markerIndexByMapSpace ??= createUniqueIndex(
      this.markerMapSpaces,
      "mapSpaceId"
    ));
  }

  get mapSpaceIndexByMarker(): Map<number, MarkerMapSpace> {
    return (this.__mapSpaceIndexByMarker ??= createUniqueIndex(
      this.markerMapSpaces,
      "markerId"
    ));
  }

  private get configByPlayerCount() {
    return match(this.players.length)
      .with(5, () => ({
        mapSpacesSize: 10,
        wallTilesCount: 20,
        roadTilesCount: 58,
        markersCount: 8,
      }))
      .with(4, () => ({
        mapSpacesSize: 9,
        wallTilesCount: 16,
        roadTilesCount: 58,
        markersCount: 8,
      }))
      .with(3, () => ({
        mapSpacesSize: 8,
        wallTilesCount: 12,
        roadTilesCount: 58,
        markersCount: 8,
      }))
      .otherwise(() => ({
        mapSpacesSize: 7,
        wallTilesCount: 8,
        roadTilesCount: 58,
        markersCount: 8,
      }));
  }

  public get mapSpacesSize(): number {
    return this.configByPlayerCount.mapSpacesSize;
  }

  public get wallTilesCount(): number {
    return this.configByPlayerCount.wallTilesCount;
  }

  public get roadTilesCount(): number {
    return this.configByPlayerCount.roadTilesCount;
  }

  public get markersCount(): number {
    return this.configByPlayerCount.markersCount;
  }

  get mapSpaces(): MapSpace[] {
    const size = this.mapSpacesSize;

    return (this.__mapSpaces ??= range(0, size - 1).flatMap((row) =>
      range(0, size - 1).map((col) => new MapSpace(row * size + col, row, col))
    ));
  }

  getMapSpace(row: number, col: number): MapSpace {
    return this.mapSpaces[row * this.mapSpacesSize + col];
  }

  get hasEmptyMapSpace(): boolean {
    return this.mapSpaces.some((mapSpace) => mapSpace.isEmpty);
  }

  get centerTiles(): CenterTile[] {
    return __centerTiles;
  }

  get wallTiles(): WallTile[] {
    return (this.__wallTiles ??= range(0, this.wallTilesCount - 1).map(
      (i) => new WallTile(i)
    ));
  }

  get roadTiles(): RoadTile[] {
    return (this.__roadTiles ??= range(0, this.roadTilesCount - 1).map(
      (i) => new RoadTile(i)
    ));
  }

  get outletTiles(): OutletTile[] {
    return (this.__outletTiles ??= range(0, this.players.length - 1).flatMap(
      (i) => [
        new OutletTile(i * 4 + 0, CenterType.FISH_MARKET),
        new OutletTile(i * 4 + 1, CenterType.GAS_STATION),
        new OutletTile(i * 4 + 2, CenterType.NUCLEAR_POWER_PLANT),
        new OutletTile(i * 4 + 3, CenterType.GAME_SHOP),
      ]
    ));
  }

  get markers(): Marker[] {
    const markersCount = this.markersCount;

    return (this.__markers ??= this.players.flatMap((p, pIndex) =>
      range(0, markersCount - 1).map(
        (i) => new Marker(pIndex * markersCount + i, p.id)
      )
    ));
  }

  get remainingWallTiles(): WallTile[] {
    return this.wallTiles.filter((wallTile) => !wallTile.isPlaced);
  }

  get remainingRoadTiles(): RoadTile[] {
    return this.roadTiles.filter((roadTile) => !roadTile.isPlaced);
  }

  get remainingOutletTiles(): OutletTile[] {
    return this.outletTiles.filter((outletTile) => !outletTile.isPlaced);
  }

  get remainingDrawableTiles(): (WallTile | OutletTile)[] {
    return [...this.remainingWallTiles, ...this.remainingOutletTiles];
  }

  get hasRemainingDrawableTile(): boolean {
    return this.remainingDrawableTiles.length > 0;
  }

  drawTile(): WallTile | OutletTile {
    const drawTile = shuffleArray(this.remainingDrawableTiles)[0];

    if (!drawTile) {
      throw new Error("No remaining drawable tiles");
    }

    return drawTile;
  }

  get turnPlayer(): Player | null {
    if (this.turnPlayerId === null) {
      return null;
    }
    return this.getPlayer(this.turnPlayerId);
  }

  get nextPlayer(): Player {
    const turnPlayer = this.turnPlayer;

    if (turnPlayer === null) {
      return this.players[0];
    }

    const turnPlayerIndex = this.players.findIndex(
      (_) => _.id === turnPlayer.id
    );

    if (turnPlayerIndex === -1) {
      throw new Error(`Player not found: ${turnPlayer.id}`);
    }

    const nextPlayerIndex = (turnPlayerIndex + 1) % this.players.length;

    return this.players[nextPlayerIndex];
  }

  public getPlayer(id: number): Player {
    const player = this.players.find((_) => _.id === id);

    if (player === undefined) {
      throw new Error(`Player not found: ${id}`);
    }

    return player;
  }

  public get currentPlayer(): Player | null {
    const { p } = context();

    return p;
  }

  public flesh(): Game {
    this.__mapSpaces = undefined;
    this.__wallTiles = undefined;
    this.__roadTiles = undefined;
    this.__outletTiles = undefined;
    this.__outletTiles = undefined;
    this.__markers = undefined;
    this.__centerTileIndexByMapSpace = undefined;
    this.__mapSpaceIndexByCenterTile = undefined;
    this.__wallTileIndexByMapSpace = undefined;
    this.__mapSpaceIndexByWallTile = undefined;
    this.__roadTileIndexByMapSpace = undefined;
    this.__mapSpaceIndexByRoadTile = undefined;
    this.__outletTileIndexByMapSpace = undefined;
    this.__mapSpaceIndexByOutletTile = undefined;
    this.__markerIndexByMapSpace = undefined;
    this.__mapSpaceIndexByMarker = undefined;

    return this;
  }
}

const __centerTiles = [
  new CenterTile(0, CenterType.FISH_MARKET),
  new CenterTile(1, CenterType.GAS_STATION),
  new CenterTile(2, CenterType.NUCLEAR_POWER_PLANT),
  new CenterTile(3, CenterType.GAME_SHOP),
];
