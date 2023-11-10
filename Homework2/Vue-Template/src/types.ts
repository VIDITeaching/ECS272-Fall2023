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

export interface Bar1{
    readonly job_title_average_salary: number;
}

export interface ParallelCoordinates {
    readonly job_title_count: number
}

export interface Line {
    readonly job_title_average_remote_ratio: number;
}