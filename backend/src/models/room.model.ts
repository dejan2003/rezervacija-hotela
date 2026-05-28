export interface RoomModel {
    roomNumber: string;
    floor: number;
    sizeSqm: number;
    status: RoomEnum;
    imageUrl: string;
    roomTypeId: number;
    createdAt: Date;
    updatedAt: Date;
}

export enum RoomEnum {
    AVAILABLE = "AVAILABLE",
    MAINTENANCE = "MAINTENANCE",
    OUT_OF_SERVICE = "OUT_OF_SERVICE"
}
