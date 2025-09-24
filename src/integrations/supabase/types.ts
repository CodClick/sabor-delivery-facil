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
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      cardapio_accon_kasuo: {
        Row: {
          ativo: boolean | null
          created_at: string
          descricao_produto: string | null
          id: number
          link_da_foto: string | null
          nome_produto: string | null
          sabores: string | null
          tipo: string | null
          valor_produto: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          descricao_produto?: string | null
          id?: number
          link_da_foto?: string | null
          nome_produto?: string | null
          sabores?: string | null
          tipo?: string | null
          valor_produto?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          descricao_produto?: string | null
          id?: number
          link_da_foto?: string | null
          nome_produto?: string | null
          sabores?: string | null
          tipo?: string | null
          valor_produto?: string | null
        }
        Relationships: []
      }
      cardapio_accon_kasuosushi: {
        Row: {
          ativo: boolean | null
          cod_grupo: string
          cod_produto: string
          created_at: string | null
          id: string
          nome_grupo: string
          nome_produto: string
          valor_kasuo_sushi: number | null
          valor_produto: number | null
        }
        Insert: {
          ativo?: boolean | null
          cod_grupo: string
          cod_produto: string
          created_at?: string | null
          id?: string
          nome_grupo: string
          nome_produto: string
          valor_kasuo_sushi?: number | null
          valor_produto?: number | null
        }
        Update: {
          ativo?: boolean | null
          cod_grupo?: string
          cod_produto?: string
          created_at?: string | null
          id?: string
          nome_grupo?: string
          nome_produto?: string
          valor_kasuo_sushi?: number | null
          valor_produto?: number | null
        }
        Relationships: []
      }
      cardapio_best_pizza: {
        Row: {
          created_at: string
          descricao: string | null
          id: number
          link: string | null
          nome_da_pizza: string | null
          "preco_pizza_brotinho (4 pedaços)": number | null
          "preco_pizza_grande (8 pedaços)": number | null
          "preco_pizza_média (6 pedaços)": number | null
          preço_refrigerante_2L: number | null
          preço_refrigerante_lata_350ml: number | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: number
          link?: string | null
          nome_da_pizza?: string | null
          "preco_pizza_brotinho (4 pedaços)"?: number | null
          "preco_pizza_grande (8 pedaços)"?: number | null
          "preco_pizza_média (6 pedaços)"?: number | null
          preço_refrigerante_2L?: number | null
          preço_refrigerante_lata_350ml?: number | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: number
          link?: string | null
          nome_da_pizza?: string | null
          "preco_pizza_brotinho (4 pedaços)"?: number | null
          "preco_pizza_grande (8 pedaços)"?: number | null
          "preco_pizza_média (6 pedaços)"?: number | null
          preço_refrigerante_2L?: number | null
          preço_refrigerante_lata_350ml?: number | null
        }
        Relationships: []
      }
      cardapio_codclick: {
        Row: {
          criado_em: string | null
          descricao: string | null
          id: string
          nome_do_prato: string
          preco_do_prato: number
        }
        Insert: {
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome_do_prato: string
          preco_do_prato: number
        }
        Update: {
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome_do_prato?: string
          preco_do_prato?: number
        }
        Relationships: []
      }
      cardapio_kasuo_sushi: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome_do_prato: string
          preco: number
          qtde: number | null
          serve: string | null
          tipo: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome_do_prato: string
          preco: number
          qtde?: number | null
          serve?: string | null
          tipo?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome_do_prato?: string
          preco?: number
          qtde?: number | null
          serve?: string | null
          tipo?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cardapio_villa_mex: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          link: string | null
          nome_do_prato: string
          observacoes: string | null
          preco: number
          qtde: string | null
          serve: string | null
          tipo: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          link?: string | null
          nome_do_prato: string
          observacoes?: string | null
          preco: number
          qtde?: string | null
          serve?: string | null
          tipo?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          link?: string | null
          nome_do_prato?: string
          observacoes?: string | null
          preco?: number
          qtde?: string | null
          serve?: string | null
          tipo?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cardapio_zombie_burger: {
        Row: {
          descricao: string | null
          id: number
          nome_do_prato: string
          preco_do_prato: number | null
        }
        Insert: {
          descricao?: string | null
          id?: number
          nome_do_prato: string
          preco_do_prato?: number | null
        }
        Update: {
          descricao?: string | null
          id?: number
          nome_do_prato?: string
          preco_do_prato?: number | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      categorias_ks: {
        Row: {
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      chat_status: {
        Row: {
          chat_user: string
          created_at: string
          id: number
          status: boolean | null
        }
        Insert: {
          chat_user: string
          created_at?: string
          id?: number
          status?: boolean | null
        }
        Update: {
          chat_user?: string
          created_at?: string
          id?: number
          status?: boolean | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          conta_instagram: string | null
          id: string
          nome: string
          pagina_facebook: string | null
          parametros: string | null
          pixel: string | null
          url_destino: string | null
        }
        Insert: {
          conta_instagram?: string | null
          id?: string
          nome: string
          pagina_facebook?: string | null
          parametros?: string | null
          pixel?: string | null
          url_destino?: string | null
        }
        Update: {
          conta_instagram?: string | null
          id?: string
          nome?: string
          pagina_facebook?: string | null
          parametros?: string | null
          pixel?: string | null
          url_destino?: string | null
        }
        Relationships: []
      }
      customer_data: {
        Row: {
          cep: string | null
          city: string | null
          complement: string | null
          created_at: string
          id: string
          name: string
          neighborhood: string | null
          number: string | null
          phone: string
          state: string | null
          street: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          id?: string
          name: string
          neighborhood?: string | null
          number?: string | null
          phone: string
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          id?: string
          name?: string
          neighborhood?: string | null
          number?: string | null
          phone?: string
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      empresas: {
        Row: {
          admin_id: string | null
          cor_primaria: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          nome: string
          nome_fantasia: string | null
          slug: string
          telefone: string | null
        }
        Insert: {
          admin_id?: string | null
          cor_primaria?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          nome_fantasia?: string | null
          slug: string
          telefone?: string | null
        }
        Update: {
          admin_id?: string | null
          cor_primaria?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          nome_fantasia?: string | null
          slug?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresas_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      endereco: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          created_at: string
          estado: string | null
          id: number
          numero: string | null
          rua: string | null
          sessao: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          estado?: string | null
          id?: number
          numero?: string | null
          rua?: string | null
          sessao: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          estado?: string | null
          id?: number
          numero?: string | null
          rua?: string | null
          sessao?: string
        }
        Relationships: []
      }
      endereco_cliente: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          created_at: string
          eatado: string | null
          empresa_whatsapp: string | null
          id: number
          instancia: string | null
          nome_cliente: string | null
          numero: string | null
          rua: string | null
          sessao: string
          whatsapp: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          eatado?: string | null
          empresa_whatsapp?: string | null
          id?: number
          instancia?: string | null
          nome_cliente?: string | null
          numero?: string | null
          rua?: string | null
          sessao: string
          whatsapp?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          eatado?: string | null
          empresa_whatsapp?: string | null
          id?: number
          instancia?: string | null
          nome_cliente?: string | null
          numero?: string | null
          rua?: string | null
          sessao?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      faixas_ceps_atendidos: {
        Row: {
          cep_fim: string | null
          cep_inicio: string | null
          created_at: string
          id: string
          regiao: string | null
        }
        Insert: {
          cep_fim?: string | null
          cep_inicio?: string | null
          created_at?: string
          id?: string
          regiao?: string | null
        }
        Update: {
          cep_fim?: string | null
          cep_inicio?: string | null
          created_at?: string
          id?: string
          regiao?: string | null
        }
        Relationships: []
      }
      faixas_ceps_atendidos_todos: {
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
          empresa: string | null
          horario_ativo: string
          horario_extra: string | null
          id: string
          mais_detalhes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          empresa?: string | null
          horario_ativo: string
          horario_extra?: string | null
          id?: string
          mais_detalhes?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          empresa?: string | null
          horario_ativo?: string
          horario_extra?: string | null
          id?: string
          mais_detalhes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      informacoes_empresa: {
        Row: {
          area_entrega: string | null
          cidade_estado: string
          criado_em: string | null
          descricao_ambiente: string | null
          endereco: string
          estacionamento: string | null
          formas_pagamento: string
          horario_funcionamento: string
          id: string
          informacoes_extras: string | null
          link_cardapio: string | null
          link_reservas: string | null
          media_preco: string
          modalidade_atendimento: string
          nome_restaurante: string
          principais_pratos: string
          telefone: string
          tempo_entrega: string | null
          tipo_culinaria: string
          whatsapp: string
        }
        Insert: {
          area_entrega?: string | null
          cidade_estado: string
          criado_em?: string | null
          descricao_ambiente?: string | null
          endereco: string
          estacionamento?: string | null
          formas_pagamento: string
          horario_funcionamento: string
          id?: string
          informacoes_extras?: string | null
          link_cardapio?: string | null
          link_reservas?: string | null
          media_preco: string
          modalidade_atendimento: string
          nome_restaurante: string
          principais_pratos: string
          telefone: string
          tempo_entrega?: string | null
          tipo_culinaria: string
          whatsapp: string
        }
        Update: {
          area_entrega?: string | null
          cidade_estado?: string
          criado_em?: string | null
          descricao_ambiente?: string | null
          endereco?: string
          estacionamento?: string | null
          formas_pagamento?: string
          horario_funcionamento?: string
          id?: string
          informacoes_extras?: string | null
          link_cardapio?: string | null
          link_reservas?: string | null
          media_preco?: string
          modalidade_atendimento?: string
          nome_restaurante?: string
          principais_pratos?: string
          telefone?: string
          tempo_entrega?: string | null
          tipo_culinaria?: string
          whatsapp?: string
        }
        Relationships: []
      }
      informacoes_pedido: {
        Row: {
          bairro: string | null
          cep: string | null
          cep_atendido: boolean | null
          cidade: string | null
          complemento: string | null
          created_at: string | null
          id: string
          itens_pedido: string | null
          nome: string | null
          numero_casa: string | null
          payment_status: string | null
          preco_final: number | null
          sessao: string
          status: string | null
          street: string | null
          telefone: string | null
          ultima_modif: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cep_atendido?: boolean | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          id?: string
          itens_pedido?: string | null
          nome?: string | null
          numero_casa?: string | null
          payment_status?: string | null
          preco_final?: number | null
          sessao: string
          status?: string | null
          street?: string | null
          telefone?: string | null
          ultima_modif?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cep_atendido?: boolean | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          id?: string
          itens_pedido?: string | null
          nome?: string | null
          numero_casa?: string | null
          payment_status?: string | null
          preco_final?: number | null
          sessao?: string
          status?: string | null
          street?: string | null
          telefone?: string | null
          ultima_modif?: string | null
        }
        Relationships: []
      }
      instancias: {
        Row: {
          apikey: string
          created_at: string | null
          id: string
          instancia: string
          status: string | null
        }
        Insert: {
          apikey: string
          created_at?: string | null
          id?: string
          instancia: string
          status?: string | null
        }
        Update: {
          apikey?: string
          created_at?: string | null
          id?: string
          instancia?: string
          status?: string | null
        }
        Relationships: []
      }
      kasuo_accon_users: {
        Row: {
          ano: string | null
          ativo: boolean | null
          created_at: string
          dia: string | null
          documento: string | null
          email: string | null
          felicitacoes_enviadas: boolean
          id: number
          mes: string | null
          nome: string | null
          pedidos: string | null
          ultima_compra: string | null
          whatsapp: string | null
        }
        Insert: {
          ano?: string | null
          ativo?: boolean | null
          created_at?: string
          dia?: string | null
          documento?: string | null
          email?: string | null
          felicitacoes_enviadas?: boolean
          id?: number
          mes?: string | null
          nome?: string | null
          pedidos?: string | null
          ultima_compra?: string | null
          whatsapp?: string | null
        }
        Update: {
          ano?: string | null
          ativo?: boolean | null
          created_at?: string
          dia?: string | null
          documento?: string | null
          email?: string | null
          felicitacoes_enviadas?: boolean
          id?: number
          mes?: string | null
          nome?: string | null
          pedidos?: string | null
          ultima_compra?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      kasuo_wi_fi_users: {
        Row: {
          ano: string | null
          created_at: string
          dia: string | null
          email: string | null
          felicitacoes_enviadas: boolean
          id: number
          mes: string | null
          nome: string | null
          whatsapp: string
        }
        Insert: {
          ano?: string | null
          created_at?: string
          dia?: string | null
          email?: string | null
          felicitacoes_enviadas?: boolean
          id?: number
          mes?: string | null
          nome?: string | null
          whatsapp: string
        }
        Update: {
          ano?: string | null
          created_at?: string
          dia?: string | null
          email?: string | null
          felicitacoes_enviadas?: boolean
          id?: number
          mes?: string | null
          nome?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      pedidos_best_pizza: {
        Row: {
          created_at: string
          empresa: string | null
          endereco: string
          id: number
          nome: string
          pagamento: string | null
          pedido: string
          sessao: string
          total: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          empresa?: string | null
          endereco: string
          id?: number
          nome: string
          pagamento?: string | null
          pedido: string
          sessao: string
          total: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          empresa?: string | null
          endereco?: string
          id?: number
          nome?: string
          pagamento?: string | null
          pedido?: string
          sessao?: string
          total?: string
          whatsapp?: string
        }
        Relationships: []
      }
      produtos_ks: {
        Row: {
          ativo: boolean | null
          categoria_id: string | null
          descricao: string | null
          em_promocao: boolean | null
          id: string
          nome: string
          preco_normal: number | null
          preco_promocional: number | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          descricao?: string | null
          em_promocao?: boolean | null
          id?: string
          nome: string
          preco_normal?: number | null
          preco_promocional?: number | null
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          descricao?: string | null
          em_promocao?: boolean | null
          id?: string
          nome?: string
          preco_normal?: number | null
          preco_promocional?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_ks_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_ks"
            referencedColumns: ["id"]
          },
        ]
      }
      promocoes: {
        Row: {
          created_at: string
          empresa: string | null
          id: string
          promocao_ativa: string
          regras_da_promocao: string | null
          texto_da_promocao: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          empresa?: string | null
          id?: string
          promocao_ativa: string
          regras_da_promocao?: string | null
          texto_da_promocao?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          empresa?: string | null
          id?: string
          promocao_ativa?: string
          regras_da_promocao?: string | null
          texto_da_promocao?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          atualizado_em: string | null
          conteudo: string
          criado_em: string | null
          id: string
          titulo: string
          user_id: string
        }
        Insert: {
          atualizado_em?: string | null
          conteudo: string
          criado_em?: string | null
          id?: string
          titulo: string
          user_id: string
        }
        Update: {
          atualizado_em?: string | null
          conteudo?: string
          criado_em?: string | null
          id?: string
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      saudacoes: {
        Row: {
          ativa: string | null
          created_at: string
          empresa: string | null
          id: string
          saudacao: string | null
          user_id: string
        }
        Insert: {
          ativa?: string | null
          created_at?: string
          empresa?: string | null
          id?: string
          saudacao?: string | null
          user_id?: string
        }
        Update: {
          ativa?: string | null
          created_at?: string
          empresa?: string | null
          id?: string
          saudacao?: string | null
          user_id?: string
        }
        Relationships: []
      }
      set_nicho: {
        Row: {
          created_at: string
          id: number
          nicho: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          nicho?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          nicho?: string | null
          whatsapp?: string | null
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
          role: string | null
          user_id: string
        }
        Insert: {
          created_at: string
          email?: string | null
          firebase_id?: string | null
          id?: string
          last_sign_in?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          firebase_id?: string | null
          id?: string
          last_sign_in?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      usertest: {
        Row: {
          created_at: string
          endereco: string | null
          id: number
          nome: string | null
          senha: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          endereco?: string | null
          id?: number
          nome?: string | null
          senha?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          endereco?: string | null
          id?: number
          nome?: string | null
          senha?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          created_at: string | null
          email: string
          empresa: string | null
          firebase_id: string | null
          id: string
          role: string | null
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          empresa?: string | null
          firebase_id?: string | null
          id?: string
          role?: string | null
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          empresa?: string | null
          firebase_id?: string | null
          id?: string
          role?: string | null
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      variacoes_produto_ks: {
        Row: {
          id: string
          nome: string
          preco: number | null
          produto_id: string | null
        }
        Insert: {
          id?: string
          nome: string
          preco?: number | null
          produto_id?: string | null
        }
        Update: {
          id?: string
          nome?: string
          preco?: number | null
          produto_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "variacoes_produto_ks_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_ks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buscar_aniversariantes: {
        Args: { fim_md: string; inicio_md: string }
        Returns: {
          created_at: string
          data_de_nascimento: string
          email: string
          nome: string
          whatsapp: string
        }[]
      }
      get_dados_agente: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { user_uid: string } | { user_uid: string }
        Returns: string
      }
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
