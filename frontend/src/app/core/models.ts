export type UserRole = 'ADMIN' | 'RECEPTIONIST' | 'GUEST';
export type RoomStatus = 'AVAILABLE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT';

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: UserRole;
}

export interface RoomType {
  roomTypeId: number;
  name: string;
  description?: string | null;
  capacity: number;
  bedCount: number;
  basePrice: string | number;
  amenities?: string | null;
}

export interface Room {
  roomId: number;
  roomNumber: string;
  floor: number;
  sizeSqm?: number | null;
  status: RoomStatus;
  imageUrl?: string | null;
  roomType: RoomType;
}

export interface Review {
  reviewId: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: Pick<User, 'userId' | 'firstName' | 'lastName'>;
  room: {
    roomId: number;
    roomNumber: string;
    roomType: RoomType;
  };
}

export interface Reservation {
  reservationId: number;
  reservationCode: string;
  checkInDate: string;
  checkOutDate: string;
  guest: number;
  totalPrice: string | number;
  status: ReservationStatus;
  specialRequest?: string | null;
  user: User;
  room: Room;
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  activeReservations: number;
  todayCheckIns: number;
  guests: number;
  revenue: number;
}
