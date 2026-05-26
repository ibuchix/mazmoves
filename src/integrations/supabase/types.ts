export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          attempt_count: number | null
          email: string
          first_attempt_at: string | null
          id: string
          ip_address: string | null
          last_attempt_at: string | null
          verification_attempts: number | null
        }
        Insert: {
          attempt_count?: number | null
          email: string
          first_attempt_at?: string | null
          id?: string
          ip_address?: string | null
          last_attempt_at?: string | null
          verification_attempts?: number | null
        }
        Update: {
          attempt_count?: number | null
          email?: string
          first_attempt_at?: string | null
          id?: string
          ip_address?: string | null
          last_attempt_at?: string | null
          verification_attempts?: number | null
        }
        Relationships: []
      }
      billing_cycles: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          processed_at: string | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          processed_at?: string | null
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          processed_at?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      campaign_clicks: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          ip: string | null
          referrer: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          ip?: string | null
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          ip?: string | null
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_funnel_v"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_events: {
        Row: {
          campaign_id: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["campaign_event_type"]
          first_campaign_id: string | null
          id: string
          location_slug: string | null
          metadata: Json | null
          move_type: string | null
          request_id: string | null
          session_id: string | null
          visitor_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["campaign_event_type"]
          first_campaign_id?: string | null
          id?: string
          location_slug?: string | null
          metadata?: Json | null
          move_type?: string | null
          request_id?: string | null
          session_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["campaign_event_type"]
          first_campaign_id?: string | null
          id?: string
          location_slug?: string | null
          metadata?: Json | null
          move_type?: string | null
          request_id?: string | null
          session_id?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_funnel_v"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_events_first_campaign_id_fkey"
            columns: ["first_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_funnel_v"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_events_first_campaign_id_fkey"
            columns: ["first_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          channel: string
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          name: string
          short_code: string
          starts_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          target_location_slug: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          name: string
          short_code: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_location_slug?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          name?: string
          short_code?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_location_slug?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          auth_user_id: string
          billing_status: string | null
          business_address: Json
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          description: string | null
          email_verification_sent_at: string | null
          email_verified: boolean | null
          email_verified_at: string | null
          free_assignments_remaining: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          last_payment_date: string | null
          latitude: number | null
          location: unknown
          longitude: number | null
          manager_name: string | null
          name: string
          public_access_token: string
          rating: number | null
          registration_date: string | null
          registration_number: string | null
          registration_status:
            | Database["public"]["Enums"]["registration_status_type"]
            | null
          service_areas: Json | null
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          subscription_status: string | null
          terms_accepted_at: string | null
          trial_started_at: string
          updated_at: string | null
          vat_number: string | null
          verification_date: string | null
          verification_notes: string | null
          welcome_email_sent: boolean | null
          welcome_email_sent_at: string | null
        }
        Insert: {
          auth_user_id: string
          billing_status?: string | null
          business_address: Json
          contact_email: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          email_verification_sent_at?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          free_assignments_remaining?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_payment_date?: string | null
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          manager_name?: string | null
          name: string
          public_access_token?: string
          rating?: number | null
          registration_date?: string | null
          registration_number?: string | null
          registration_status?:
            | Database["public"]["Enums"]["registration_status_type"]
            | null
          service_areas?: Json | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          subscription_status?: string | null
          terms_accepted_at?: string | null
          trial_started_at?: string
          updated_at?: string | null
          vat_number?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          welcome_email_sent?: boolean | null
          welcome_email_sent_at?: string | null
        }
        Update: {
          auth_user_id?: string
          billing_status?: string | null
          business_address?: Json
          contact_email?: string
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          email_verification_sent_at?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          free_assignments_remaining?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          last_payment_date?: string | null
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          manager_name?: string | null
          name?: string
          public_access_token?: string
          rating?: number | null
          registration_date?: string | null
          registration_number?: string | null
          registration_status?:
            | Database["public"]["Enums"]["registration_status_type"]
            | null
          service_areas?: Json | null
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          subscription_status?: string | null
          terms_accepted_at?: string | null
          trial_started_at?: string
          updated_at?: string | null
          vat_number?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          welcome_email_sent?: boolean | null
          welcome_email_sent_at?: string | null
        }
        Relationships: []
      }
      company_documents: {
        Row: {
          company_id: string
          document_type: string
          file_name: string
          file_path: string
          id: string
          mime_type: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          size_bytes: number
          status: string
          uploaded_at: string
        }
        Insert: {
          company_id: string
          document_type: string
          file_name: string
          file_path: string
          id?: string
          mime_type: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_bytes: number
          status?: string
          uploaded_at?: string
        }
        Update: {
          company_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_bytes?: number
          status?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_dashboard_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "scheduled_moves_view"
            referencedColumns: ["company_id"]
          },
        ]
      }
      company_invoices: {
        Row: {
          billing_cycle_id: string
          company_id: string
          created_at: string | null
          due_date: string
          hosted_invoice_url: string | null
          id: string
          invoice_pdf_url: string | null
          paid_at: string | null
          period_end: string | null
          period_start: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          tax: number
          total: number
          updated_at: string | null
        }
        Insert: {
          billing_cycle_id: string
          company_id: string
          created_at?: string | null
          due_date: string
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf_url?: string | null
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string | null
        }
        Update: {
          billing_cycle_id?: string
          company_id?: string
          created_at?: string | null
          due_date?: string
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf_url?: string | null
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_invoices_billing_cycle_id_fkey"
            columns: ["billing_cycle_id"]
            isOneToOne: false
            referencedRelation: "billing_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_dashboard_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "scheduled_moves_view"
            referencedColumns: ["company_id"]
          },
        ]
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
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "scheduled_moves_view"
            referencedColumns: ["company_id"]
          },
        ]
      }
      document_access_logs: {
        Row: {
          action_type: string
          company_id: string
          created_at: string | null
          document_path: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          company_id: string
          created_at?: string | null
          document_path: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          company_id?: string
          created_at?: string | null
          document_path?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_dashboard_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "scheduled_moves_view"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "document_access_logs_company_id_fkey1"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_dashboard_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_logs_company_id_fkey1"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_access_logs_company_id_fkey1"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "scheduled_moves_view"
            referencedColumns: ["company_id"]
          },
        ]
      }
      email_confirmations: {
        Row: {
          company_id: string | null
          confirmed_at: string | null
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          status: Database["public"]["Enums"]["token_status"] | null
          token: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          status?: Database["public"]["Enums"]["token_status"] | null
          token: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          status?: Database["public"]["Enums"]["token_status"] | null
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_confirmations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_dashboard_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_confirmations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_confirmations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "scheduled_moves_view"
            referencedColumns: ["company_id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          name: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          name: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          assignment_id: string
          company_id: string | null
          created_at: string | null
          description: string
          id: string
          invoice_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          assignment_id: string
          company_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          invoice_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          assignment_id?: string
          company_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "move_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "scheduled_moves_view"
            referencedColumns: ["assignment_id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "company_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_email_subscribers: {
        Row: {
          company_id: string
          created_at: string
          email: string
          id: string
          source: string
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email: string
          id?: string
          source?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string
          id?: string
          source?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      move_assignments: {
        Row: {
          actual_cost: number | null
          assigned_date: string | null
          attempt_count: number | null
          company_id: string
          completion_notes: string | null
          created_at: string | null
          estimated_cost: number | null
          expand_after: string | null
          id: string
          request_id: string
          status: Database["public"]["Enums"]["assignment_status"] | null
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_date?: string | null
          attempt_count?: number | null
          company_id: string
          completion_notes?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          expand_after?: string | null
          id?: string
          request_id: string
          status?: Database["public"]["Enums"]["assignment_status"] | null
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_date?: string | null
          attempt_count?: number | null
          company_id?: string
          completion_notes?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          expand_after?: string | null
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
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "move_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "move_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "scheduled_moves_view"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "move_assignments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "move_request_previews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "move_assignments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "move_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "move_assignments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "scheduled_moves_view"
            referencedColumns: ["request_id"]
          },
        ]
      }
      move_requests: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          delivery_address: Json
          delivery_latitude: number | null
          delivery_location: unknown
          delivery_longitude: number | null
          estimated_size: string | null
          estimated_value: number | null
          first_campaign_id: string | null
          id: string
          inventory_list: Json | null
          ip_origin: string | null
          landing_location_slug: string | null
          move_type: string | null
          pending_review: boolean
          pickup_address: Json
          pickup_latitude: number | null
          pickup_location: unknown
          pickup_longitude: number | null
          requested_date: string
          source: string
          special_instructions: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          updated_at: string | null
          visitor_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          delivery_address: Json
          delivery_latitude?: number | null
          delivery_location?: unknown
          delivery_longitude?: number | null
          estimated_size?: string | null
          estimated_value?: number | null
          first_campaign_id?: string | null
          id?: string
          inventory_list?: Json | null
          ip_origin?: string | null
          landing_location_slug?: string | null
          move_type?: string | null
          pending_review?: boolean
          pickup_address: Json
          pickup_latitude?: number | null
          pickup_location?: unknown
          pickup_longitude?: number | null
          requested_date: string
          source?: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
          visitor_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: Json
          delivery_latitude?: number | null
          delivery_location?: unknown
          delivery_longitude?: number | null
          estimated_size?: string | null
          estimated_value?: number | null
          first_campaign_id?: string | null
          id?: string
          inventory_list?: Json | null
          ip_origin?: string | null
          landing_location_slug?: string | null
          move_type?: string | null
          pending_review?: boolean
          pickup_address?: Json
          pickup_latitude?: number | null
          pickup_location?: unknown
          pickup_longitude?: number | null
          requested_date?: string
          source?: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "move_requests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_funnel_v"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "move_requests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "move_requests_first_campaign_id_fkey"
            columns: ["first_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_funnel_v"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "move_requests_first_campaign_id_fkey"
            columns: ["first_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          company_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_dashboard_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "scheduled_moves_view"
            referencedColumns: ["company_id"]
          },
        ]
      }
      rate_limit_configs: {
        Row: {
          created_at: string | null
          id: string
          limit_type: Database["public"]["Enums"]["rate_limit_type"]
          max_requests: number
          updated_at: string | null
          window_seconds: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          limit_type: Database["public"]["Enums"]["rate_limit_type"]
          max_requests: number
          updated_at?: string | null
          window_seconds: number
        }
        Update: {
          created_at?: string | null
          id?: string
          limit_type?: Database["public"]["Enums"]["rate_limit_type"]
          max_requests?: number
          updated_at?: string | null
          window_seconds?: number
        }
        Relationships: []
      }
      rate_limit_logs: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          limit_type: Database["public"]["Enums"]["rate_limit_type"]
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          limit_type: Database["public"]["Enums"]["rate_limit_type"]
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          limit_type?: Database["public"]["Enums"]["rate_limit_type"]
        }
        Relationships: [
          {
            foreignKeyName: "rate_limit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "admin_dashboard_mv"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_limit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_limit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "scheduled_moves_view"
            referencedColumns: ["company_id"]
          },
        ]
      }
      registration_errors: {
        Row: {
          attempt_time: string | null
          cleaned_at: string | null
          client_ip: string | null
          error_details: Json | null
          error_message: string | null
          id: string
          request_data: Json | null
        }
        Insert: {
          attempt_time?: string | null
          cleaned_at?: string | null
          client_ip?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          request_data?: Json | null
        }
        Update: {
          attempt_time?: string | null
          cleaned_at?: string | null
          client_ip?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          request_data?: Json | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      storage_config: {
        Row: {
          created_at: string | null
          id: string
          max_file_size_mb: number
          retention_days: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_file_size_mb?: number
          retention_days?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_file_size_mb?: number
          retention_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: Json | null
          created_at: string | null
          email: string
          encrypted_phone: string | null
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
          encrypted_phone?: string | null
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
          encrypted_phone?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      validation_failures: {
        Row: {
          created_at: string | null
          failure_reason: string | null
          id: string
          ip_address: string | null
          request_data: Json | null
        }
        Insert: {
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          request_data?: Json | null
        }
        Update: {
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          request_data?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      admin_dashboard_mv: {
        Row: {
          completed_assignments: number | null
          contact_email: string | null
          created_at: string | null
          id: string | null
          name: string | null
          registration_status: string | null
          total_assignments: number | null
        }
        Relationships: []
      }
      campaign_funnel_v: {
        Row: {
          campaign_id: string | null
          campaign_name: string | null
          channel: string | null
          clicks: number | null
          landings: number | null
          selections: number | null
          short_code: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          submissions: number | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      move_request_previews: {
        Row: {
          delivery_city: string | null
          delivery_latitude: number | null
          delivery_longitude: number | null
          delivery_postcode: string | null
          estimated_size: string | null
          id: string | null
          move_type: string | null
          pickup_city: string | null
          pickup_latitude: number | null
          pickup_longitude: number | null
          pickup_postcode: string | null
          requested_date: string | null
        }
        Insert: {
          delivery_city?: never
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_postcode?: never
          estimated_size?: string | null
          id?: string | null
          move_type?: string | null
          pickup_city?: never
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          pickup_postcode?: never
          requested_date?: string | null
        }
        Update: {
          delivery_city?: never
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_postcode?: never
          estimated_size?: string | null
          id?: string | null
          move_type?: string | null
          pickup_city?: never
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          pickup_postcode?: never
          requested_date?: string | null
        }
        Relationships: []
      }
      scheduled_moves_view: {
        Row: {
          assigned_date: string | null
          assignment_id: string | null
          company_id: string | null
          company_name: string | null
          customer_email: string | null
          customer_name: string | null
          delivery_address: Json | null
          distance_to_pickup_km: number | null
          estimated_cost: number | null
          pickup_address: Json | null
          request_id: string | null
          requested_date: string | null
          status: Database["public"]["Enums"]["assignment_status"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      check_confirmation_token: {
        Args: { token_param: string }
        Returns: {
          company_id: string
          is_valid: boolean
          message: string
          status: Database["public"]["Enums"]["token_status"]
        }[]
      }
      check_password_reset_rate_limit: {
        Args: {
          max_attempts?: number
          p_email: string
          window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_company_id: string
          p_limit_type: Database["public"]["Enums"]["rate_limit_type"]
        }
        Returns: boolean
      }
      check_registration_limit: {
        Args: { check_email: string; check_ip: string }
        Returns: boolean
      }
      check_verification_rate_limit: {
        Args: { p_email: string; p_ip: string }
        Returns: boolean
      }
      cleanup_old_registration_errors: { Args: never; Returns: undefined }
      create_company_bypass_rls: {
        Args: { company_data: Json }
        Returns: undefined
      }
      create_new_user: {
        Args: {
          user_email: string
          user_full_name: string
          user_id: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
      current_company_id: { Args: never; Returns: string }
      decrypt_sensitive_data: {
        Args: { encrypted_data: string; key_id?: string }
        Returns: string
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      encrypt_sensitive_data: {
        Args: { data: string; key_id?: string }
        Returns: string
      }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      find_companies_within_radius:
        | {
            Args: { point: unknown; radius_miles: number }
            Returns: {
              distance: number
              id: string
            }[]
          }
        | {
            Args: { move_type?: string; point: unknown; radius_miles: number }
            Returns: {
              distance: number
              id: string
            }[]
          }
      find_nearby_companies: {
        Args: {
          delivery_lat: number
          delivery_lng: number
          pickup_lat: number
          pickup_lng: number
          radius_km?: number
        }
        Returns: {
          company_id: string
          company_name: string
          distance_km: number
        }[]
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_decrypted_company_data: {
        Args: { company_id: string }
        Returns: {
          contact_phone: string
          id: string
          registration_number: string
          vat_number: string
        }[]
      }
      get_decrypted_user_data: {
        Args: { user_id: string }
        Returns: {
          id: string
          phone: string
        }[]
      }
      get_setting: { Args: { setting_key: string }; Returns: string }
      get_user_role: {
        Args: { _uid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      gettransactionid: { Args: never; Returns: unknown }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_country_allowed: { Args: { check_code: string }; Returns: boolean }
      is_valid_admin_creator: { Args: { email: string }; Returns: boolean }
      log_email_attempt: {
        Args: {
          p_company_id: string
          p_email_type: string
          p_error_message?: string
          p_recipient_email: string
          p_status: string
        }
        Returns: undefined
      }
      log_notification_error: {
        Args: { company_id: string; error_message: string }
        Returns: undefined
      }
      log_registration_error: {
        Args: {
          client_ip: string
          error_details: Json
          error_msg: string
          request_data: Json
        }
        Returns: undefined
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      mark_welcome_email_sent: {
        Args: { company_id: string }
        Returns: undefined
      }
      migrate_sensitive_data: { Args: never; Returns: undefined }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      process_billing_cycle: { Args: never; Returns: undefined }
      record_registration_attempt: {
        Args: {
          attempt_email: string
          attempt_ip: string
          was_successful: boolean
        }
        Returns: undefined
      }
      register_company:
        | {
            Args: { company_data: Json }
            Returns: {
              auth_user_id: string
              billing_status: string | null
              business_address: Json
              contact_email: string
              contact_phone: string | null
              created_at: string | null
              description: string | null
              email_verification_sent_at: string | null
              email_verified: boolean | null
              email_verified_at: string | null
              free_assignments_remaining: number | null
              id: string
              is_active: boolean | null
              is_verified: boolean | null
              last_payment_date: string | null
              latitude: number | null
              location: unknown
              longitude: number | null
              manager_name: string | null
              name: string
              public_access_token: string
              rating: number | null
              registration_date: string | null
              registration_number: string | null
              registration_status:
                | Database["public"]["Enums"]["registration_status_type"]
                | null
              service_areas: Json | null
              stripe_customer_id: string | null
              stripe_payment_method_id: string | null
              subscription_status: string | null
              terms_accepted_at: string | null
              trial_started_at: string
              updated_at: string | null
              vat_number: string | null
              verification_date: string | null
              verification_notes: string | null
              welcome_email_sent: boolean | null
              welcome_email_sent_at: string | null
            }
            SetofOptions: {
              from: "*"
              to: "companies"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              auth_user_id: string
              company_data: Json
              user_email: string
              user_full_name: string
            }
            Returns: string
          }
      send_verification_email: {
        Args: { company_name: string; email: string }
        Returns: undefined
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      verify_registration_completion: {
        Args: { p_auth_user_id: string; p_company_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "company" | "customer"
      assignment_status: "active" | "completed" | "cancelled" | "accepted"
      campaign_event_type:
        | "landing_view"
        | "move_type_selected"
        | "form_submitted"
      campaign_status: "active" | "paused" | "archived"
      company_registration_status: "pending" | "active" | "suspended"
      invoice_status: "draft" | "pending" | "paid" | "failed" | "void"
      rate_limit_type: "hourly" | "daily" | "monthly"
      registration_status_type: "pending" | "approved" | "rejected"
      request_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_companies_found"
      token_status: "pending" | "used" | "expired"
      user_role: "customer" | "company" | "admin"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "company", "customer"],
      assignment_status: ["active", "completed", "cancelled", "accepted"],
      campaign_event_type: [
        "landing_view",
        "move_type_selected",
        "form_submitted",
      ],
      campaign_status: ["active", "paused", "archived"],
      company_registration_status: ["pending", "active", "suspended"],
      invoice_status: ["draft", "pending", "paid", "failed", "void"],
      rate_limit_type: ["hourly", "daily", "monthly"],
      registration_status_type: ["pending", "approved", "rejected"],
      request_status: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
        "no_companies_found",
      ],
      token_status: ["pending", "used", "expired"],
      user_role: ["customer", "company", "admin"],
    },
  },
} as const
