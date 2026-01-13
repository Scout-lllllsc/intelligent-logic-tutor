import SwitchNode from "./nodes/SwitchNode";
import AndNode from "./nodes/AndNode";
import OrNode from "./nodes/OrNode";
import NotNode from "./nodes/NotNode";
import XorNode from "./nodes/XorNode";
import NandNode from "./nodes/NandNode";
import NorNode from "./nodes/NorNode";
import LedNode from "./nodes/LedNode";

export const nodeTypes = {
  SWITCH: SwitchNode,
  AND: AndNode,
  OR: OrNode,
  NOT: NotNode,
  XOR: XorNode,
  NAND: NandNode,
  NOR: NorNode,
  LED: LedNode,
};
