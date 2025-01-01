export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          business_address: Json
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          insurance_docs: Json | null
          is_active: boolean | null
          is_verified: boolean | null
          last_payment_date: string | null
          latitude: number | null
          longitude: number | null
          manager_name: string | null
          name: string
          public_access_token: string
          rating: number | null
          registration_date: string | null
          registration_number: string | null
          registration_status: string | null
          service_areas: Json | null
          subscription_status: string | null
          updated_at: string | null
          vat_number: string | null
        }
        Insert: {
          business_address: Json
          contact_email: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          insurance_docs?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_payment_date?: string | null
          latitude?: number | null
          longitude?: number | null
          manager_name?: string | null
          name: string
          public_access_token?: string
          rating?: number | null
          registration_date?: string | null
          registration_number?: string | null
          registration_status?: string | null
          service_areas?: Json | null
          subscription_status?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Update: {
          business_address?: Json
          contact_email?: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          insurance_docs?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          last_payment_date?: string | null
          latitude?: number | null
          longitude?: number | null
          manager_name?: string | null
          name?: string
          public_access_token?: string
          rating?: number | null
          registration_date?: string | null
          registration_number?: string | null
          registration_status?: string | null
          service_areas?: Json | null
          subscription_status?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
      company_payments: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string | null
          id: string
          invoice_number: string | null
          payment_date: string | null
          payment_status: string | null
          payment_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          company_id?: string | null
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          payment_date?: string | null
          payment_status?: string | null
          payment_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string | null
          id?: string
          invoice_number?: string | null
          payment_date?: string | null
          payment_status?: string | null
          payment_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_dashboard_mv"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "company_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "admin_dashboard_mv"
            referencedColumns: ["company_id"]
          },
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
          },
        ]
      }
      move_requests: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          delivery_address: Json
          delivery_latitude: number | null
          delivery_longitude: number | null
          estimated_size: string | null
          estimated_value: number | null
          id: string
          inventory_list: Json | null
          pickup_address: Json
          pickup_latitude: number | null
          pickup_longitude: number | null
          requested_date: string
          special_instructions: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          delivery_address: Json
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          estimated_size?: string | null
          estimated_value?: number | null
          id?: string
          inventory_list?: Json | null
          pickup_address: Json
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          requested_date: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: Json
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          estimated_size?: string | null
          estimated_value?: number | null
          id?: string
          inventory_list?: Json | null
          pickup_address?: Json
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          requested_date?: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      secrets: {
        Row: {
          id: number
          name: string
          secret: string
        }
        Insert: {
          id?: number
          name: string
          secret: string
        }
        Update: {
          id?: number
          name?: string
          secret?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: Json | null
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
          address?: Json | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
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
      admin_dashboard_mv: {
        Row: {
          active_assignments: number | null
          company_id: string | null
          company_name: string | null
          completed_assignments: number | null
          contact_email: string | null
          is_verified: boolean | null
          last_payment_date: string | null
          registration_date: string | null
          registration_status: string | null
          subscription_status: string | null
          total_assignments: number | null
          total_paid_amount: number | null
          total_payments: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_valid_admin_creator: {
        Args: {
          email: string
        }
        Returns: boolean
      }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
