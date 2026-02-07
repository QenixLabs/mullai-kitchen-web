export interface ApiResponse<TData> {
  message: string;
  data: TData;
  success: boolean;
}
