export type Position = {
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
};

export interface ImageInfo {
  src: string;
  position: Position;
  size: { width: string; height: string };
}
