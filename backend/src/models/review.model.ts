export interface ReviewModel {
  userId: number;
  roomId: number;
  rating: number;
  comment?: string | null;
}