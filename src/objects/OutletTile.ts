import { CenterType } from "enums";
import { match } from "ts-pattern";
import { context } from "game";
import { MapSpace } from "objects";

export class OutletTile {
  constructor(public readonly id: number, public readonly type: CenterType) {}

  get image(): string {
    return match(this.type)
      .with(CenterType.FISH_MARKET, () => "fish-market-outlet-tile.svg")
      .with(CenterType.GAS_STATION, () => "gas-station-outlet-tile.svg")
      .with(
        CenterType.NUCLEAR_POWER_PLANT,
        () => "nuclear-power-plant-outlet-tile.svg"
      )
      .with(CenterType.GAME_SHOP, () => "game-shop-post-outlet-tile.svg")
      .run();
  }

  get isPlaced(): boolean {
    const { g } = context();

    return g.mapSpaceIndexByOutletTile.has(this.id);
  }

  get mapSpace(): MapSpace | null {
    const { g } = context();
    return g.mapSpaceIndexByOutletTile.get(this.id)?.mapSpace ?? null;
  }
}
