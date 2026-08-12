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
      carts: {
        Row: {
          items: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          items?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          items?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          assigned_admin: string | null
          assigned_admin_name: string | null
          category: string
          closed_at: string | null
          closed_by: string | null
          created_at: string
          customer_name: string
          id: string
          last_message: string
          last_message_at: string
          status: string
          subject: string
          ticket_number: string
          unread_admin: number
          unread_customer: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_admin?: string | null
          assigned_admin_name?: string | null
          category?: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          last_message?: string
          last_message_at?: string
          status?: string
          subject?: string
          ticket_number?: string
          unread_admin?: number
          unread_customer?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_admin?: string | null
          assigned_admin_name?: string | null
          category?: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          last_message?: string
          last_message_at?: string
          status?: string
          subject?: string
          ticket_number?: string
          unread_admin?: number
          unread_customer?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
          sender_name: string
          sender_role: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
          sender_name?: string
          sender_role: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          sender_name?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          id: string
          order_id: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          order_id?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          order_id?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          first_order_only: boolean
          id: string
          max_uses: number | null
          max_uses_per_user: number | null
          min_order_cents: number
          stackable: boolean
          starts_at: string | null
          target_type: string
          target_user_ids: string[]
          updated_at: string
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          first_order_only?: boolean
          id?: string
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_order_cents?: number
          stackable?: boolean
          starts_at?: string | null
          target_type?: string
          target_user_ids?: string[]
          updated_at?: string
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          first_order_only?: boolean
          id?: string
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_order_cents?: number
          stackable?: boolean
          starts_at?: string | null
          target_type?: string
          target_user_ids?: string[]
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      hero_images: {
        Row: {
          active: boolean
          created_at: string
          cta_href: string
          cta_label: string
          headline: string
          id: string
          image_url: string | null
          sort_order: number
          subheadline: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_href?: string
          cta_label?: string
          headline?: string
          id?: string
          image_url?: string | null
          sort_order?: number
          subheadline?: string
          title?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_href?: string
          cta_label?: string
          headline?: string
          id?: string
          image_url?: string | null
          sort_order?: number
          subheadline?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          admin_review_status: string
          callback_phone: string | null
          card_id: string | null
          coupon_code: string | null
          created_at: string
          currency: string
          discount_cents: number
          expected_delivery_date: string | null
          id: string
          items: Json
          order_number: string
          payment_method: string
          shipping_address: Json | null
          status: string
          total_cents: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          admin_review_status?: string
          callback_phone?: string | null
          card_id?: string | null
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_cents?: number
          expected_delivery_date?: string | null
          id?: string
          items?: Json
          order_number?: string
          payment_method?: string
          shipping_address?: Json | null
          status?: string
          total_cents?: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          admin_review_status?: string
          callback_phone?: string | null
          card_id?: string | null
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_cents?: number
          expected_delivery_date?: string | null
          id?: string
          items?: Json
          order_number?: string
          payment_method?: string
          shipping_address?: Json | null
          status?: string
          total_cents?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_cards: {
        Row: {
          brand: string
          created_at: string
          exp_month: number
          exp_year: number
          holder_name: string
          id: string
          is_default: boolean
          last4: string
          user_id: string
        }
        Insert: {
          brand?: string
          created_at?: string
          exp_month: number
          exp_year: number
          holder_name: string
          id?: string
          is_default?: boolean
          last4: string
          user_id: string
        }
        Update: {
          brand?: string
          created_at?: string
          exp_month?: number
          exp_year?: number
          holder_name?: string
          id?: string
          is_default?: boolean
          last4?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: string
          brand: string
          category: string
          created_at: string
          description: string
          discount_enabled: boolean
          featured: boolean
          id: string
          image_url: string | null
          images: Json
          long_description: string
          monthly: number
          name: string
          original_price: number | null
          price: number
          sku: string | null
          sort_order: number
          spec: string
          specs: Json
          stock: string
          updated_at: string
          weight_lbs: number | null
        }
        Insert: {
          badge?: string
          brand: string
          category?: string
          created_at?: string
          description?: string
          discount_enabled?: boolean
          featured?: boolean
          id?: string
          image_url?: string | null
          images?: Json
          long_description?: string
          monthly?: number
          name: string
          original_price?: number | null
          price?: number
          sku?: string | null
          sort_order?: number
          spec?: string
          specs?: Json
          stock?: string
          updated_at?: string
          weight_lbs?: number | null
        }
        Update: {
          badge?: string
          brand?: string
          category?: string
          created_at?: string
          description?: string
          discount_enabled?: boolean
          featured?: boolean
          id?: string
          image_url?: string | null
          images?: Json
          long_description?: string
          monthly?: number
          name?: string
          original_price?: number | null
          price?: number
          sku?: string | null
          sort_order?: number
          spec?: string
          specs?: Json
          stock?: string
          updated_at?: string
          weight_lbs?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          last_profile_change: string
          phone: string | null
          region: string
          sudo_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          last_profile_change?: string
          phone?: string | null
          region?: string
          sudo_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          last_profile_change?: string
          phone?: string | null
          region?: string
          sudo_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
