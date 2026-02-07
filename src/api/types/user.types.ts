export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  assigned_outlet_id?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}
