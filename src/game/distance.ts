import { context } from "game";
import { MapSpace, OutletTile } from "objects";

export function checkNeedToBePlaceRoadTile(mapSpace: MapSpace): boolean {
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

export function getOutletTileScore(outletTile: OutletTile): number {
  const { g } = context();

  const from = outletTile.mapSpace;
  if (!from) {
    throw new Error("outlet tile is unplaced");
  }

  const to = g.centerTiles.find((_) => _.type === outletTile.type)?.mapSpace;
  if (!to) {
    throw new Error("logic error");
  }

  const relatedRoadMapSpaces = from.relatedMapSpaces.filter((_) => _.roadTile);
  const __distance = Math.min(
    ...relatedRoadMapSpaces.map((_) => distance(_.id).get(to.id)!)
  );

  return -__distance;
}

function distance(
  startMapSpaceId: number,
  temporaryWallTiles: number[] = []
): Map<number, number> {
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

  return result;
}
