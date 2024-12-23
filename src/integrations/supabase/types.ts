// Basic JSON type
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Address type for consistent structure
export type Address = {
  street?: string;
  city: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// Database types
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          business_address: Address
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          name: string
          rating: number | null
          service_areas: Json | null
          updated_at: string | null
        }
        Insert: {
          business_address: Address
          contact_email: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name: string
          rating?: number | null
          service_areas?: Json | null
          updated_at?: string | null
        }
        Update: {
          business_address?: Address
          contact_email?: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          name?: string
          rating?: number | null
          service_areas?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      move_assignments: {
        Row: {
          actual_cost: number | null
          assigned_date: string | null
          company_id: string
          completion_notes: string | null
          created_at: string | null
          estimated_cost: number | null
          id: string
          request_id: string
          status: Database["public"]["Enums"]["assignment_status"] | null
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_date?: string | null
          company_id: string
          completion_notes?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          request_id: string
          status?: Database["public"]["Enums"]["assignment_status"] | null
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_date?: string | null
          company_id?: string
          completion_notes?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          id?: string
          request_id?: string
          status?: Database["public"]["Enums"]["assignment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "move_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "move_assignments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "move_requests"
            referencedColumns: ["id"]
          }
        ]
      }
      move_requests: {
        Row: {
          created_at: string | null
          customer_id: string
          delivery_address: Address
          estimated_size: string | null
          estimated_value: number | null
          id: string
          inventory_list: Json | null
          pickup_address: Address
          requested_date: string
          special_instructions: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          delivery_address: Address
          estimated_size?: string | null
          estimated_value?: number | null
          id?: string
          inventory_list?: Json | null
          pickup_address: Address
          requested_date: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          delivery_address?: Address
          estimated_size?: string | null
          estimated_value?: number | null
          id?: string
          inventory_list?: Json | null
          pickup_address?: Address
          requested_date?: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "move_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          address: Address | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          address?: Address | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          address?: Address | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      assignment_status: "active" | "completed" | "cancelled"
      request_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
      user_role: "customer" | "company" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]