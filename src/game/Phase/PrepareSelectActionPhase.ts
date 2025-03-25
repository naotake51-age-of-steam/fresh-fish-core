import { PhaseId } from "enums";
import { Phase, HasDelayExecute } from "./Phase";
import { GameBuilder } from "../GameBuilder";
import { context, type Game, SelectActionPhase, type Player } from "game";
import { MapSpace } from "objects";
import { RoadTileMapSpace } from "game/RoadTileMapSpace";
import { EndGamePhase } from "./EndGamePhase";

export class PrepareSelectActionPhase extends Phase implements HasDelayExecute {
  public readonly id = PhaseId.PREPARE_SELECT_ACTION;

  constructor(public readonly nextPlayerId: number) {
    super();
  }

  public static prepare(b: GameBuilder, nextPlayer: Player): GameBuilder {
    return b.setPhase(new PrepareSelectActionPhase(nextPlayer.id));
  }

  public get message(): string {
    return "";
  }

  public get nextPlayer() {
    const { g } = context();

    return g.getPlayer(this.nextPlayerId);
  }

  public executeDelay(): Game {
    const { g } = context();
    const b = new GameBuilder(g);

    // 道タイルを配置
    const remainingRoadTile = [...g.remainingRoadTiles];

    for (const mapSpace of g.mapSpaces) {
      if (!mapSpace.hasTile && checkNeedToBePlaceRoadTile(mapSpace)) {
        const roadTile = remainingRoadTile.shift();
        if (!roadTile) {
          throw new Error("road tile is undefined");
        }
        b.addRoadTileMapSpace(new RoadTileMapSpace(roadTile.id, mapSpace.id));

        if (mapSpace.marker) {
          b.removeMarkerMapSpace(mapSpace.marker);
        }
      }
    }

    // ゲームが終了しているか確認
    if (g.mapSpaces.every((_) => _.hasTile)) {
      return EndGamePhase.prepare(b).build();
    }

    return b
      .setPhase(new SelectActionPhase())
      .setTurnPlayer(this.nextPlayer)
      .build();
  }
}

function checkNeedToBePlaceRoadTile(mapSpace: MapSpace): boolean {
  // マップスペースを壁にすることで、隣接するマップスペース（壁は覗く）同士が切断されてはいけない。
  const needRelationMapSpaces = mapSpace.relatedMapSpaces.filter(
    (relatedMapSpace) => !relatedMapSpace.wallTile
  );

  if (needRelationMapSpaces.length <= 1) {
    return false;
  }

  const pickIndex = needRelationMapSpaces.findIndex((_) => _.isThrough);
  if (pickIndex === -1) {
    // TODO:: 既にに隔離されたスペースがある。
    return true;
  }
  const pickMapSpace = needRelationMapSpaces.splice(pickIndex, 1)[0];

  const distanceFromPickMapSpace = distance(pickMapSpace!.id, [mapSpace.id]);

  return needRelationMapSpaces.some((_) => !distanceFromPickMapSpace.has(_.id));
}

function distance(startMapSpaceId: number, temporaryWallTiles: number[]) {
  const { g } = context();

  const result = new Map<number, number>();

  let currentDistance = 0;
  let currentMapSpaceIds = [startMapSpaceId];

  result.set(startMapSpaceId, currentDistance);

  while (currentMapSpaceIds.length > 0) {
    currentDistance++;

    const nextMapSpaceIds = [];

    for (const mapSpaceId of currentMapSpaceIds) {
      const mapSpace = g.mapSpaces[mapSpaceId];
      if (mapSpace.centerTile || mapSpace.outletTile) {
        continue;
      }

      for (const relatedMapSpace of mapSpace.relatedMapSpaces) {
        if (
          relatedMapSpace.wallTile ||
          temporaryWallTiles.includes(relatedMapSpace.id)
        ) {
          continue;
        }

        if (result.has(relatedMapSpace.id)) {
          continue;
        }

        nextMapSpaceIds.push(relatedMapSpace.id);
        result.set(relatedMapSpace.id, currentDistance);
      }
    }

    currentMapSpaceIds = nextMapSpaceIds;
  }

  // console.log(result);
  return result;
}
