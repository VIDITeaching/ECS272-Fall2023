// Global types and interfaces are stored here.
export interface Margin {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
}

export interface ComponentSize {
    width: number;
    height: number;
}

export interface Point {
    readonly posX: number;
    readonly posY: number;
}

export interface Bar{
    readonly value: any;
}

export interface Node{
    name: string;
}
export interface RawLink {
    source: string;
    target: string;
    value: number;
  }
export interface Link {
    source: string;
    target: string;
    value: number;
}

export interface SankeyData {
    nodes: Node[];
    links: Link[];
}

export interface ComponentSize2 {
    width: number;
    height: number;
}

export interface Margin2 {
    left: number;
    right: number;
    top: number;
    bottom: number;
}