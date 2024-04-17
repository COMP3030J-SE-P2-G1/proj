import { Type } from 'class-transformer';


export type Solar = {
    generation: number,
    id: number,
    lat: number,
    lon: number,
    loss: number,
    power: number,
    tech: number,
    time: string
};

export type Profile = {
    id: number,
    user_ud: number,
    name: string,
    desc: string | null,
    start_time: string,
    end_time: string,
    lon: number | null,
    lat: number | null,
    tech: number | null,
    loss: number | null,
    power: number | null
}

export type Usage = {
    id: number,
    user_id: number,
    time: string,
    usage: number
}
