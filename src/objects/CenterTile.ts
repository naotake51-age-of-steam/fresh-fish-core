import { CenterType } from "enums";
import { match } from "ts-pattern";
import { MapSpace } from "objects";
import { context } from "game";

export class CenterTile {
  constructor(public readonly id: number, public readonly type: CenterType) {}

  get image(): string {
    return match(this.type)
      .with(CenterType.FISH_MARKET, () => "fish-market-center-tile.svg")
      .with(CenterType.GAS_STATION, () => "gas-station-center-tile.svg")
      .with(
        CenterType.NUCLEAR_POWER_PLANT,
        () => "nuclear-power-plant-center-tile.svg"
      )
      .with(CenterType.GAME_SHOP, () => "game-shop-post-center-tile.svg")
      .run();
  }

  get mapSpace(): MapSpace | null {
    const { g } = context();
    return g.mapSpaceIndexByCenterTile.get(this.id)?.mapSpace ?? null;
  }
}
