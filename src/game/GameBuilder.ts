import { type Phase, type Game, type Player } from "../game";
import { CenterTileMapSpace } from "./CenterTileMapSpace";
import { MarkerMapSpace } from "./MarkerMapSpace";
import { WallTileMapSpace } from "./WallTileMapSpace";
import { Marker } from "objects";
import { OutletTileMapSpace } from "./OutletTileMapSpace";
import { RoadTileMapSpace } from "./RoadTileMapSpace";

type Writable<T> = { -readonly [P in keyof T]: T[P] };

export class GameBuilder {
  public readonly game: Writable<Game>;

  constructor(original: Game) {
    this.game = original.cloneDeep();
  }

  public setTurnPlayer(player: Player | null): GameBuilder {
    this.game.turnPlayerId = player?.id ?? null;

    return this;
  }

  public setPhase(phase: Phase): GameBuilder {
    this.game.phase = phase;

    return this;
  }

  public setCenterTileMapSpaces(
    centerTileMapSpaces: CenterTileMapSpace[]
  ): GameBuilder {
    this.game.centerTileMapSpaces = centerTileMapSpaces;

    return this;
  }

  public producePhase<P extends Phase>(
    producer: (draft: Writable<P>) => void
  ): GameBuilder {
    this.game.phase = (this.game.phase as P).produce(producer);

    return this;
  }

  public setPlayers(players: Player[]): GameBuilder {
    this.game.players = players;

    return this;
  }

  public updatePlayer(player: Player): GameBuilder {
    this.game.players = this.game.players.map((_) =>
      _.id === player.id ? player : _
    );

    return this;
  }

  public build(): Game {
    return this.game.cloneDeep().flesh();
  }

  public addMarkerMapSpace(markerMapSpace: MarkerMapSpace): GameBuilder {
    this.game.markerMapSpaces.push(markerMapSpace);

    return this;
  }

  public removeMarkerMapSpace(marker: Marker): GameBuilder {
    this.game.markerMapSpaces = this.game.markerMapSpaces.filter(
      (_) => _.markerId !== marker.id
    );

    return this;
  }

  public addWallTileMapSpace(wallTileMapSpace: WallTileMapSpace): GameBuilder {
    this.game.wallTileMapSpaces.push(wallTileMapSpace);

    return this;
  }

  public addOutletTileMapSpace(
    outletTileMapSpace: OutletTileMapSpace
  ): GameBuilder {
    this.game.outletTileMapSpaces.push(outletTileMapSpace);

    return this;
  }

  public addRoadTileMapSpace(roadTileMapSpace: RoadTileMapSpace): GameBuilder {
    this.game.roadTileMapSpaces.push(roadTileMapSpace);

    return this;
  }
}
