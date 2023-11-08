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
    readonly value: number;
}

export interface Spider{
    readonly speed: number;
    readonly attack: number;
    readonly defense: number;
    readonly hp: number;
    readonly catch_rate: number;
}

export interface FeatureData{
    readonly name: string,
    readonly angle: number,
    readonly line_coord: {x: number, y: number},
    readonly label_coord: {x: number, y: number},
}