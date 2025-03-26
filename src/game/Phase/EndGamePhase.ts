import { PhaseId, CenterType } from "enums";
import { GameBuilder } from "../GameBuilder";
import { Type } from "class-transformer";
import { context, Player, Phase } from "game";
import { getOutletTileScore } from "../distance";

class PlayerScore {
  constructor(
    public readonly playerId: number,
    public readonly fishMarketScore: number,
    public readonly gasStationScore: number,
    public readonly nuclearPowerPlantScore: number,
    public readonly gameShopScore: number,
    public readonly money: number,
    public readonly total: number
  ) {}

  get player(): Player {
    const { g } = context();

    return g.getPlayer(this.playerId);
  }
}

export class EndGamePhase extends Phase {
  public readonly id = PhaseId.END_GAME;

  @Type(() => PlayerScore)
  public readonly playerScores: PlayerScore[];

  constructor(playerScores: PlayerScore[]) {
    super();

    this.playerScores = playerScores;
  }

  public static prepare(b: GameBuilder): GameBuilder {
    const { g } = context();

    const playerScores = g.players.map((player) => {
      const fishMarketScore = getOutletTileScore(
        player.getOutletTile(CenterType.FISH_MARKET)!
      );
      const gasStationScore = getOutletTileScore(
        player.getOutletTile(CenterType.GAS_STATION)!
      );
      const nuclearPowerPlantScore = getOutletTileScore(
        player.getOutletTile(CenterType.NUCLEAR_POWER_PLANT)!
      );
      const gameShopScore = getOutletTileScore(
        player.getOutletTile(CenterType.GAME_SHOP)!
      );

      return new PlayerScore(
        player.id,
        fishMarketScore,
        gasStationScore,
        nuclearPowerPlantScore,
        gameShopScore,
        player.money,
        fishMarketScore +
          gasStationScore +
          nuclearPowerPlantScore +
          gameShopScore +
          player.money
      );
    });

    return b.setPhase(new EndGamePhase(playerScores)).setTurnPlayer(null);
  }

  public get message(): string {
    return (
      "お疲れ様です。ゲームが終了しました。\n" +
      this.winners.map((_) => _.name).join("、") +
      "の勝利です。🎉🎉🎉"
    );
  }

  private get winners(): Player[] {
    const maxScore = Math.max(...this.playerScores.map((_) => _.total));

    return this.playerScores
      .filter((_) => _.total === maxScore)
      .map((_) => _.player);
  }
}
