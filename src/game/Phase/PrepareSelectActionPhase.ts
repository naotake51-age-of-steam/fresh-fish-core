import { PhaseId } from "enums";
import { Phase, HasDelayExecute } from "./Phase";
import { GameBuilder } from "../GameBuilder";
import { context, type Game, SelectActionPhase, type Player } from "game";
import { RoadTileMapSpace } from "game/RoadTileMapSpace";
import { EndGamePhase } from "./EndGamePhase";
import { PlaceWallOrRoadTilePhase } from "./PlaceWallOrRoadTilePhase";
import { checkNeedToBePlaceRoadTile } from "../distance";

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

    // ゲーム終了準備
    if (g.mapSpaces.every((_) => !_.isEmpty) && !g.hasRemainingDrawableTile) {
      return b
        .setPhase(new PlaceWallOrRoadTilePhase())
        .setTurnPlayer(this.nextPlayer)
        .build();
    }

    return b
      .setPhase(new SelectActionPhase())
      .setTurnPlayer(this.nextPlayer)
      .build();
  }
}
