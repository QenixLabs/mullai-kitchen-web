export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  assigned_outlet_id?: string;
  onboarding_completed?: boolean;
  dietary_preferences?: string;
  special_instructions?: string;
  preferred_contact_time?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}
