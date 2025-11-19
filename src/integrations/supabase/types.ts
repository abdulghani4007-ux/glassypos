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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      expenses: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          note: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          id?: string
          note: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          note?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          batch_number: string
          category: string
          company: string
          cost_price: number
          created_at: string
          expiry: string
          id: string
          name: string
          reorder_level: number
          sale_price: number
          stock: number
          updated_at: string
        }
        Insert: {
          batch_number: string
          category: string
          company: string
          cost_price: number
          created_at?: string
          expiry: string
          id?: string
          name: string
          reorder_level?: number
          sale_price: number
          stock?: number
          updated_at?: string
        }
        Update: {
          batch_number?: string
          category?: string
          company?: string
          cost_price?: number
          created_at?: string
          expiry?: string
          id?: string
          name?: string
          reorder_level?: number
          sale_price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          date: string
          id: string
          invoice_no: string | null
          items: Json
          reason: string
          sale_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          date?: string
          id?: string
          invoice_no?: string | null
          items: Json
          reason: string
          sale_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          date?: string
          id?: string
          invoice_no?: string | null
          items?: Json
          reason?: string
          sale_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          cash_received: number | null
          change_returned: number | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          date: string
          discount: number
          id: string
          items: Json
          payment_type: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          cash_received?: number | null
          change_returned?: number | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          date?: string
          discount?: number
          id?: string
          items: Json
          payment_type: string
          subtotal: number
          tax?: number
          total: number
          updated_at?: string
        }
        Update: {
          cash_received?: number | null
          change_returned?: number | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          date?: string
          discount?: number
          id?: string
          items?: Json
          payment_type?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          compact_sidebar: boolean
          created_at: string
          currency: string
          dark_mode: boolean
          default_discount: number
          default_tax: number
          enable_udhar: boolean
          expiry_alert_days: number
          glassy_ui: boolean
          id: string
          invoice_footer: string | null
          invoice_prefix: string
          low_stock_threshold: number
          shop_name: string
          show_customer_info: boolean
          updated_at: string
        }
        Insert: {
          compact_sidebar?: boolean
          created_at?: string
          currency?: string
          dark_mode?: boolean
          default_discount?: number
          default_tax?: number
          enable_udhar?: boolean
          expiry_alert_days?: number
          glassy_ui?: boolean
          id?: string
          invoice_footer?: string | null
          invoice_prefix?: string
          low_stock_threshold?: number
          shop_name?: string
          show_customer_info?: boolean
          updated_at?: string
        }
        Update: {
          compact_sidebar?: boolean
          created_at?: string
          currency?: string
          dark_mode?: boolean
          default_discount?: number
          default_tax?: number
          enable_udhar?: boolean
          expiry_alert_days?: number
          glassy_ui?: boolean
          id?: string
          invoice_footer?: string | null
          invoice_prefix?: string
          low_stock_threshold?: number
          shop_name?: string
          show_customer_info?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      udhars: {
        Row: {
          amount: number
          created_at: string
          customer_name: string
          customer_phone: string | null
          date: string
          due_date: string | null
          id: string
          invoice_no: string
          note: string | null
          paid_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          date?: string
          due_date?: string | null
          id?: string
          invoice_no: string
          note?: string | null
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          date?: string
          due_date?: string | null
          id?: string
          invoice_no?: string
          note?: string | null
          paid_date?: string | null
          status?: string
          updated_at?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
