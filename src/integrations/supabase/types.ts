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
      autom_horario: {
        Row: {
          horario_ativo: boolean | null
          horario_extra: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          horario_ativo?: boolean | null
          horario_extra?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          horario_ativo?: boolean | null
          horario_extra?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autom_horario_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "autom_user"
            referencedColumns: ["id"]
          },
        ]
      }
      autom_promocoes: {
        Row: {
          id: string
          promocao_ativa: boolean | null
          regras_promocao: string | null
          texto_promocao: string | null
          user_id: string | null
          validade_promocao: string | null
        }
        Insert: {
          id?: string
          promocao_ativa?: boolean | null
          regras_promocao?: string | null
          texto_promocao?: string | null
          user_id?: string | null
          validade_promocao?: string | null
        }
        Update: {
          id?: string
          promocao_ativa?: boolean | null
          regras_promocao?: string | null
          texto_promocao?: string | null
          user_id?: string | null
          validade_promocao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autom_promocoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "autom_user"
            referencedColumns: ["id"]
          },
        ]
      }
      autom_user: {
        Row: {
          email: string
          id: string
          nome: string
          whatsapp: string
        }
        Insert: {
          email: string
          id?: string
          nome: string
          whatsapp: string
        }
        Update: {
          email?: string
          id?: string
          nome?: string
          whatsapp?: string
        }
        Relationships: []
      }
      faixas_ceps_atendidos: {
        Row: {
          cep_fim: string
          cep_inicio: string
          created_at: string
          id: string
          regiao: string | null
        }
        Insert: {
          cep_fim: string
          cep_inicio: string
          created_at?: string
          id?: string
          regiao?: string | null
        }
        Update: {
          cep_fim?: string
          cep_inicio?: string
          created_at?: string
          id?: string
          regiao?: string | null
        }
        Relationships: []
      }
      horario_funcionamento: {
        Row: {
          created_at: string
          horario_ativo: string
          horario_extra: string | null
          id: string
          mais_detalhes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          horario_ativo: string
          horario_extra?: string | null
          id?: string
          mais_detalhes?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          horario_ativo?: string
          horario_extra?: string | null
          id?: string
          mais_detalhes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      promocoes: {
        Row: {
          created_at: string
          id: string
          promocao_ativa: string
          regras_da_promocao: string | null
          texto_da_promocao: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          promocao_ativa: string
          regras_da_promocao?: string | null
          texto_da_promocao?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          promocao_ativa?: string
          regras_da_promocao?: string | null
          texto_da_promocao?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saudacoes: {
        Row: {
          created_at: string
          id: string
          texto_da_saudacao: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          texto_da_saudacao?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          texto_da_saudacao?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          firebase_id: string | null
          id: string
          last_sign_in: string | null
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at: string
          email?: string | null
          firebase_id?: string | null
          id: string
          last_sign_in?: string | null
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          firebase_id?: string | null
          id?: string
          last_sign_in?: string | null
          name?: string | null
          phone?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
