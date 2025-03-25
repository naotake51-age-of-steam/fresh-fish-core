import { context, type Player } from "game";
import { match } from "ts-pattern";
import { PlayerColor } from "enums";
import { MARKER_HEIGHT, MARKER_WIDTH } from "./index";
import { MapSpace } from "objects";
export class Marker {
  constructor(public readonly id: number, public readonly playerId: number) {}

  get player(): Player {
    const { g } = context();

    return g.getPlayer(this.playerId);
  }

  get image(): string {
    return match(this.player.color)
      .with(PlayerColor.RED, () => "marker-red.svg")
      .with(PlayerColor.BLUE, () => "marker-blue.svg")
      .with(PlayerColor.YELLOW, () => "marker-yellow.svg")
      .with(PlayerColor.PURPLE, () => "marker-purple.svg")
      .with(PlayerColor.BLACK, () => "marker-black.svg")
      .run();
  }

  get height(): number {
    return MARKER_HEIGHT;
  }

  get width(): number {
    return MARKER_WIDTH;
  }

  get isPlaced(): boolean {
    const { g } = context();

    return g.mapSpaceIndexByMarker.has(this.id);
  }

  get mapSpace(): MapSpace | null {
    const { g } = context();

    return g.mapSpaceIndexByMarker.get(this.id)?.mapSpace ?? null;
  }

  // スペース予約に使っているか（アウトレットの所有者マークではない）
  get isReserving(): boolean {
    const mapSpace = this.mapSpace;
    if (!mapSpace) {
      return false;
    }

    return !mapSpace.hasTile;
  }
}
