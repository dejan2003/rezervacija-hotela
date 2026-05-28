export interface ReservationModel {
    reservationCode: string,
    userId: number,
    roomId: number,
    checkInDate: Date,
    checkOutDate: Date,
    guest: number,
    totalPrice: string,
    status: ReservationEnum,
    specialRequest: string,
    createdAt: Date,
    updatedAt: Date
}
export enum ReservationEnum {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    CHECKED_IN = "CHECKED_IN",
    CHECKED_OUT = "CHECKED_OUT"
}