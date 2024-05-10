export type Time = string;

export type NullableTime = Time | null;

export type TimelyArrayData = Array<string | number>;

export type TimelyData = {
    time: Time,
}

export type Profile = {
    id: number,
    user_ud: number,
    name: string,
    desc: string | null,
    start_time: Time,
    end_time: Time,
    lon: number | null,
    lat: number | null,
    tech: number | null,
    loss: number | null,
    power: number | null
}

export interface Solar extends TimelyData {
    generation: number,
    id: number,
    lat: number,
    lon: number,
    loss: number,
    power: number,
    tech: number
};

export interface Usage extends TimelyData {
    id: number,
    user_id: number,
    usage: number
}

export interface ElectricityPrice extends TimelyData {
    spot: number,
}

export type Aggregate = "hour" | "day" | "month" | "year";
