export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      equipment_checklists: {
        Row: {
          category: Database["public"]["Enums"]["equipment_category"]
          checked_by: string | null
          created_at: string
          id: string
          is_checked: boolean
          is_required: boolean
          item_name: string
          project_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["equipment_category"]
          checked_by?: string | null
          created_at?: string
          id?: string
          is_checked?: boolean
          is_required?: boolean
          item_name: string
          project_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["equipment_category"]
          checked_by?: string | null
          created_at?: string
          id?: string
          is_checked?: boolean
          is_required?: boolean
          item_name?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_checklists_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_templates: {
        Row: {
          category: Database["public"]["Enums"]["equipment_category"]
          id: string
          is_required: boolean
          item_name: string
          project_type: Database["public"]["Enums"]["project_type"]
        }
        Insert: {
          category: Database["public"]["Enums"]["equipment_category"]
          id?: string
          is_required?: boolean
          item_name: string
          project_type: Database["public"]["Enums"]["project_type"]
        }
        Update: {
          category?: Database["public"]["Enums"]["equipment_category"]
          id?: string
          is_required?: boolean
          item_name?: string
          project_type?: Database["public"]["Enums"]["project_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      project_assignments: {
        Row: {
          assigned_role: string | null
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          assigned_role?: string | null
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          assigned_role?: string | null
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          created_by: string | null
          id: string
          location_lat_long: string | null
          project_type: Database["public"]["Enums"]["project_type"]
          status: Database["public"]["Enums"]["project_status"]
          survey_date: string | null
          title: string
        }
        Insert: {
          address?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location_lat_long?: string | null
          project_type?: Database["public"]["Enums"]["project_type"]
          status?: Database["public"]["Enums"]["project_status"]
          survey_date?: string | null
          title: string
        }
        Update: {
          address?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location_lat_long?: string | null
          project_type?: Database["public"]["Enums"]["project_type"]
          status?: Database["public"]["Enums"]["project_status"]
          survey_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_items: {
        Row: {
          category: Database["public"]["Enums"]["survey_category"]
          client_generated_id: string | null
          condition_status: Database["public"]["Enums"]["condition_status"]
          created_at: string
          id: string
          item_name: string
          lux_level: number | null
          moisture_percentage: number | null
          notes: string | null
          updated_at: string
          zone_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["survey_category"]
          client_generated_id?: string | null
          condition_status?: Database["public"]["Enums"]["condition_status"]
          created_at?: string
          id?: string
          item_name: string
          lux_level?: number | null
          moisture_percentage?: number | null
          notes?: string | null
          updated_at?: string
          zone_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["survey_category"]
          client_generated_id?: string | null
          condition_status?: Database["public"]["Enums"]["condition_status"]
          created_at?: string
          id?: string
          item_name?: string
          lux_level?: number | null
          moisture_percentage?: number | null
          notes?: string | null
          updated_at?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_items_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "survey_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          photo_type: Database["public"]["Enums"]["photo_type"]
          photo_url: string
          survey_item_id: string | null
          zone_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_type?: Database["public"]["Enums"]["photo_type"]
          photo_url: string
          survey_item_id?: string | null
          zone_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_type?: Database["public"]["Enums"]["photo_type"]
          photo_url?: string
          survey_item_id?: string | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_photos_survey_item_id_fkey"
            columns: ["survey_item_id"]
            isOneToOne: false
            referencedRelation: "survey_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_photos_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "survey_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_zones: {
        Row: {
          client_generated_id: string | null
          created_at: string
          floor_level: string | null
          height: number | null
          id: string
          length: number | null
          project_id: string
          updated_at: string
          width: number | null
          zone_name: string
        }
        Insert: {
          client_generated_id?: string | null
          created_at?: string
          floor_level?: string | null
          height?: number | null
          id?: string
          length?: number | null
          project_id: string
          updated_at?: string
          width?: number | null
          zone_name: string
        }
        Update: {
          client_generated_id?: string | null
          created_at?: string
          floor_level?: string | null
          height?: number | null
          id?: string
          length?: number | null
          project_id?: string
          updated_at?: string
          width?: number | null
          zone_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_zones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_project_access: { Args: { pid: string }; Returns: boolean }
      has_zone_access: { Args: { zid: string }; Returns: boolean }
    }
    Enums: {
      condition_status: "good" | "warning" | "critical"
      equipment_category:
        | "measurement"
        | "mep_testing"
        | "surface_inspection"
        | "documentation"
      photo_type: "standard" | "360_panorama" | "sketch"
      project_status: "draft" | "scheduled" | "in_progress" | "completed"
      project_type: "interior_fitout" | "renovasi" | "bare_unit"
      survey_category: "architectural" | "interior" | "mep" | "structure"
      user_role: "admin" | "project_manager" | "surveyor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]
