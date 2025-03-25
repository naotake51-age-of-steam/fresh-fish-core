import { PhaseId } from "enums";
import { Phase } from "./Phase";
import { context, type Game, type Player } from "game";
import { Type } from "class-transformer";
import { OutletTile, MapSpace } from "objects";
import { GameBuilder } from "../GameBuilder";
import { OutletTileMapSpace } from "../OutletTileMapSpace";
import { rotateArray } from "utility";
import { match } from "ts-pattern";
import { PrepareSelectActionPhase } from "./PrepareSelectActionPhase";

export enum AuctionAndPlaceOutletTilePhaseState {
  UNABLE_TO_PROCESS,
  AUCTION,
  PLACE_OUTLET_TILE_FOR_SKIP_AUCTION,
  PLACE_OUTLET_TILE,
}

class PlayerBids {
  constructor(public playerId: number, public bids: number | null) {}

  public get player() {
    const { g } = context();

    return g.getPlayer(this.playerId);
  }
}

export class AuctionAndPlaceOutletTilePhase extends Phase {
  public readonly id = PhaseId.AUCTION_AND_PLACE_OUTLET_TILE;

  @Type(() => PlayerBids)
  public playerBidsList: PlayerBids[];

  constructor(
    public readonly srcPlayerId: number,
    public readonly outletTileId: number,
    playerBidsList: PlayerBids[] // 同立時の優先度順
  ) {
    super();

    this.playerBidsList = playerBidsList;
  }

  public static prepare(
    b: GameBuilder,
    srcPlayer: Player,
    outletTile: OutletTile
  ): GameBuilder {
    const { g } = context();

    const srcPlayerIndex = g.players.findIndex(
      (player) => player.id === srcPlayer.id
    );

    const playerBidsList = rotateArray(g.players, srcPlayerIndex) // プレイヤーの順番を回転させて、ビッドの優先度が高い順に並べる
      .filter(
        // オークションに参加するプレイヤーを抽出
        (player) =>
          player.hasReservingMarker && !player.hasOutletTile(outletTile.type)
      )
      .map((player) => new PlayerBids(player.id, null));

    return b
      .setPhase(
        new AuctionAndPlaceOutletTilePhase(
          srcPlayer.id,
          outletTile.id,
          playerBidsList
        )
      )
      .setTurnPlayer(null);
  }

  public get message(): string {
    const state = this.state;

    return match(state)
      .with(AuctionAndPlaceOutletTilePhaseState.UNABLE_TO_PROCESS, () => {
        return "アウトレットタイルを配置できるプレイヤーがいません。";
      })
      .with(AuctionAndPlaceOutletTilePhaseState.AUCTION, () => {
        return "アウトレットタイルのオークションを行います。各プレイヤーはビッドを行ってください。";
      })
      .with(AuctionAndPlaceOutletTilePhaseState.PLACE_OUTLET_TILE, () => {
        return `${this.successfulBidder!.name}が落札しました。${
          this.successfulBidder!.name
        }はアウトレットタイルを配置するスペースを選択してください。`;
      })
      .with(
        AuctionAndPlaceOutletTilePhaseState.PLACE_OUTLET_TILE_FOR_SKIP_AUCTION,
        () => {
          return `${
            this.successfulBidder!.name
          }はアウトレットタイルを配置するスペースを選択してください。`;
        }
      )
      .run();
  }

  public get state() {
    if (this.playerBidsList.length === 0) {
      return AuctionAndPlaceOutletTilePhaseState.UNABLE_TO_PROCESS;
    }

    if (this.playerBidsList.length === 1) {
      return AuctionAndPlaceOutletTilePhaseState.PLACE_OUTLET_TILE_FOR_SKIP_AUCTION;
    }

    if (this.playerBidsList.some((playerBids) => playerBids.bids === null)) {
      return AuctionAndPlaceOutletTilePhaseState.AUCTION;
    }

    return AuctionAndPlaceOutletTilePhaseState.PLACE_OUTLET_TILE;
  }

  public get outletTile(): OutletTile {
    const { g } = context();

    return g.outletTiles[this.outletTileId];
  }

  public isBiddingPlayer(playerId: number): boolean {
    return (
      this.state === AuctionAndPlaceOutletTilePhaseState.AUCTION &&
      this.playerBidsList.some(
        (playerBids) =>
          playerBids.playerId === playerId && playerBids.bids === null
      )
    );
  }

  public canBids(): boolean {
    const { p } = context();

    if (p === null) return false;

    return this.isBiddingPlayer(p.id);
  }

  public actionBids(bids: number): Game {
    const { g, p } = context();
    const b = new GameBuilder(g);

    if (!this.canBids()) {
      throw new Error("Cannot bids");
    }

    return b
      .setPhase(
        this.produce((draft) => {
          draft.playerBidsList = draft.playerBidsList.map((playerBids) =>
            playerBids.playerId === p!.id
              ? new PlayerBids(p!.id, bids)
              : playerBids
          );
        })
      )
      .build();
  }

  public canPlaceMapSpace(mapSpace: MapSpace): boolean {
    const { p } = context();

    if (p === null) return false;

    return (
      this.successfulBidder !== null &&
      p.id === this.successfulBidder.id &&
      !mapSpace.hasTile &&
      mapSpace.marker?.playerId === p.id
    );
  }

  public maxBids(): number {
    const { p } = context();

    if (p === null) throw new Error("player is null");

    return p.money;
  }

  public actionPlaceMapSpace(mapSpaceId: number): Game {
    const { g } = context();
    const b = new GameBuilder(g);

    const mapSpace = g.mapSpaces[mapSpaceId];

    if (!mapSpace) throw new Error("map space is undefined");

    if (!this.canPlaceMapSpace(mapSpace)) {
      throw new Error("Cannot next");
    }

    b.addOutletTileMapSpace(
      new OutletTileMapSpace(this.outletTile.id, mapSpace.id)
    ).updatePlayer(
      this.successfulBidder!.produce((draft) => {
        draft.money -=
          this.playerBidsList.find(
            (playerBids) => playerBids.playerId === draft.id
          )!.bids! ?? 0;
      })
    );
    return PrepareSelectActionPhase.prepare(b, this.nextPlayer).build();
  }

  public get successfulBidder(): Player | null {
    const state = this.state;

    if (state === AuctionAndPlaceOutletTilePhaseState.UNABLE_TO_PROCESS) {
      return null;
    } else if (state === AuctionAndPlaceOutletTilePhaseState.AUCTION) {
      return null;
    } else if (
      state ===
      AuctionAndPlaceOutletTilePhaseState.PLACE_OUTLET_TILE_FOR_SKIP_AUCTION
    ) {
      return this.playerBidsList[0].player;
    } else {
      if (this.playerBidsList.some((playerBids) => playerBids.bids === null)) {
        return null;
      }

      const maxBids = Math.max(
        ...this.playerBidsList.map((playerBids) => playerBids.bids!)
      );

      const successfulBidder = this.playerBidsList.find(
        (playerBids) => playerBids.bids === maxBids
      );

      return successfulBidder!.player;
    }
  }

  public get srcPlayer(): Player {
    const { g } = context();

    return g.getPlayer(this.srcPlayerId);
  }

  private get nextPlayer(): Player {
    const { g } = context();

    if (this.successfulBidder!.id !== this.srcPlayerId) {
      return this.srcPlayer;
    }

    const nextPlayerIndex = g.players.findIndex(
      (player) => player.id === this.srcPlayerId
    );

    return g.players[(nextPlayerIndex + 1) % g.players.length];
  }
}
