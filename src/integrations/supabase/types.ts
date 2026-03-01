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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      continents: {
        Row: {
          characteristics: string | null
          climate: string | null
          created_at: string
          id: string
          name: string
          percentage_of_land: number | null
          planet_id: string
          surface_area_km2: number | null
          terrain_type: string | null
        }
        Insert: {
          characteristics?: string | null
          climate?: string | null
          created_at?: string
          id?: string
          name: string
          percentage_of_land?: number | null
          planet_id: string
          surface_area_km2?: number | null
          terrain_type?: string | null
        }
        Update: {
          characteristics?: string | null
          climate?: string | null
          created_at?: string
          id?: string
          name?: string
          percentage_of_land?: number | null
          planet_id?: string
          surface_area_km2?: number | null
          terrain_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "continents_planet_id_fkey"
            columns: ["planet_id"]
            isOneToOne: false
            referencedRelation: "planets"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          alliances: string | null
          coat_of_arms: string | null
          created_at: string
          history: string | null
          id: string
          lands_controlled: string | null
          motto: string | null
          name: string
          nation_id: string
          notable_members: Json | null
          political_power: string | null
          race_id: string | null
          rank: string | null
          rivals: string | null
          wealth_level: string | null
        }
        Insert: {
          alliances?: string | null
          coat_of_arms?: string | null
          created_at?: string
          history?: string | null
          id?: string
          lands_controlled?: string | null
          motto?: string | null
          name: string
          nation_id: string
          notable_members?: Json | null
          political_power?: string | null
          race_id?: string | null
          rank?: string | null
          rivals?: string | null
          wealth_level?: string | null
        }
        Update: {
          alliances?: string | null
          coat_of_arms?: string | null
          created_at?: string
          history?: string | null
          id?: string
          lands_controlled?: string | null
          motto?: string | null
          name?: string
          nation_id?: string
          notable_members?: Json | null
          political_power?: string | null
          race_id?: string | null
          rank?: string | null
          rivals?: string | null
          wealth_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "families_nation_id_fkey"
            columns: ["nation_id"]
            isOneToOne: false
            referencedRelation: "nations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "families_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      galaxies: {
        Row: {
          created_at: string
          diameter_light_years: number | null
          galaxy_type: string | null
          id: string
          name: string
          origin_story: string | null
          special_features: string | null
          star_count: string | null
          universe_id: string
        }
        Insert: {
          created_at?: string
          diameter_light_years?: number | null
          galaxy_type?: string | null
          id?: string
          name: string
          origin_story?: string | null
          special_features?: string | null
          star_count?: string | null
          universe_id: string
        }
        Update: {
          created_at?: string
          diameter_light_years?: number | null
          galaxy_type?: string | null
          id?: string
          name?: string
          origin_story?: string | null
          special_features?: string | null
          star_count?: string | null
          universe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "galaxies_universe_id_fkey"
            columns: ["universe_id"]
            isOneToOne: false
            referencedRelation: "universes"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_sessions: {
        Row: {
          created_at: string
          id: string
          prompt: string
          result_data: Json | null
          result_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          result_data?: Json | null
          result_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          result_data?: Json | null
          result_type?: string
          user_id?: string
        }
        Relationships: []
      }
      nations: {
        Row: {
          capital_city: string | null
          capital_population: string | null
          continent_id: string
          created_at: string
          culture: string | null
          economy: string | null
          government_type: string | null
          history: string | null
          id: string
          military: string | null
          name: string
          population: string | null
          religion: string | null
          special_features: string | null
          surface_area_km2: number | null
        }
        Insert: {
          capital_city?: string | null
          capital_population?: string | null
          continent_id: string
          created_at?: string
          culture?: string | null
          economy?: string | null
          government_type?: string | null
          history?: string | null
          id?: string
          military?: string | null
          name: string
          population?: string | null
          religion?: string | null
          special_features?: string | null
          surface_area_km2?: number | null
        }
        Update: {
          capital_city?: string | null
          capital_population?: string | null
          continent_id?: string
          created_at?: string
          culture?: string | null
          economy?: string | null
          government_type?: string | null
          history?: string | null
          id?: string
          military?: string | null
          name?: string
          population?: string | null
          religion?: string | null
          special_features?: string | null
          surface_area_km2?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nations_continent_id_fkey"
            columns: ["continent_id"]
            isOneToOne: false
            referencedRelation: "continents"
            referencedColumns: ["id"]
          },
        ]
      }
      planets: {
        Row: {
          climate: string | null
          created_at: string
          day_cycle_hours: number | null
          diameter_km: number | null
          galaxy_id: string
          gravity_g: number | null
          id: string
          land_percentage: number | null
          name: string
          ocean_percentage: number | null
          planet_type: string | null
          special_features: string | null
          surface_area_km2: number | null
          year_days: number | null
        }
        Insert: {
          climate?: string | null
          created_at?: string
          day_cycle_hours?: number | null
          diameter_km?: number | null
          galaxy_id: string
          gravity_g?: number | null
          id?: string
          land_percentage?: number | null
          name: string
          ocean_percentage?: number | null
          planet_type?: string | null
          special_features?: string | null
          surface_area_km2?: number | null
          year_days?: number | null
        }
        Update: {
          climate?: string | null
          created_at?: string
          day_cycle_hours?: number | null
          diameter_km?: number | null
          galaxy_id?: string
          gravity_g?: number | null
          id?: string
          land_percentage?: number | null
          name?: string
          ocean_percentage?: number | null
          planet_type?: string | null
          special_features?: string | null
          surface_area_km2?: number | null
          year_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "planets_galaxy_id_fkey"
            columns: ["galaxy_id"]
            isOneToOne: false
            referencedRelation: "galaxies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      races: {
        Row: {
          created_at: string
          culture: string | null
          history: string | null
          id: string
          lifespan: string | null
          magic_ability: string | null
          name: string
          nation_id: string | null
          physical_traits: string | null
          planet_id: string | null
          society_structure: string | null
          strengths: string | null
          weaknesses: string | null
        }
        Insert: {
          created_at?: string
          culture?: string | null
          history?: string | null
          id?: string
          lifespan?: string | null
          magic_ability?: string | null
          name: string
          nation_id?: string | null
          physical_traits?: string | null
          planet_id?: string | null
          society_structure?: string | null
          strengths?: string | null
          weaknesses?: string | null
        }
        Update: {
          created_at?: string
          culture?: string | null
          history?: string | null
          id?: string
          lifespan?: string | null
          magic_ability?: string | null
          name?: string
          nation_id?: string | null
          physical_traits?: string | null
          planet_id?: string | null
          society_structure?: string | null
          strengths?: string | null
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "races_nation_id_fkey"
            columns: ["nation_id"]
            isOneToOne: false
            referencedRelation: "nations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "races_planet_id_fkey"
            columns: ["planet_id"]
            isOneToOne: false
            referencedRelation: "planets"
            referencedColumns: ["id"]
          },
        ]
      }
      universes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          laws_of_physics: string | null
          magic_system: string | null
          name: string
          origin_story: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          laws_of_physics?: string | null
          magic_system?: string | null
          name: string
          origin_story?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          laws_of_physics?: string | null
          magic_system?: string | null
          name?: string
          origin_story?: string | null
          updated_at?: string
          user_id?: string
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
