import SwitchNode from "./nodes/SwitchNode";
import AndNode from "./nodes/AndNode";
import OrNode from "./nodes/OrNode";
import LedNode from "./nodes/LedNode";

export const nodeTypes = {
  SWITCH: SwitchNode,
  AND: AndNode,
  OR: OrNode,
  LED: LedNode,
};
