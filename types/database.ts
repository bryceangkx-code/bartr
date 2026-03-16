export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "creator" | "brand";
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: "creator" | "brand";
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: "creator" | "brand";
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      creator_profiles: {
        Row: {
          id: string;
          instagram_handle: string | null;
          instagram_user_id: string | null;
          followers: number | null;
          engagement_rate: number | null;
          niches: string[] | null;
          portfolio_urls: string[] | null;
          verified_at: string | null;
        };
        Insert: {
          id: string;
          instagram_handle?: string | null;
          instagram_user_id?: string | null;
          followers?: number | null;
          engagement_rate?: number | null;
          niches?: string[] | null;
          portfolio_urls?: string[] | null;
          verified_at?: string | null;
        };
        Update: {
          id?: string;
          instagram_handle?: string | null;
          instagram_user_id?: string | null;
          followers?: number | null;
          engagement_rate?: number | null;
          niches?: string[] | null;
          portfolio_urls?: string[] | null;
          verified_at?: string | null;
        };
        Relationships: [];
      };
      brand_profiles: {
        Row: {
          id: string;
          company_name: string | null;
          website: string | null;
          category: string | null;
          credits: number;
        };
        Insert: {
          id: string;
          company_name?: string | null;
          website?: string | null;
          category?: string | null;
          credits?: number;
        };
        Update: {
          id?: string;
          company_name?: string | null;
          website?: string | null;
          category?: string | null;
          credits?: number;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          brand_id: string;
          title: string;
          description: string | null;
          product_value_sgd: number | null;
          deliverables: string | null;
          min_followers: number | null;
          min_engagement_rate: number | null;
          niches: string[] | null;
          status: "active" | "paused" | "closed";
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          title: string;
          description?: string | null;
          product_value_sgd?: number | null;
          deliverables?: string | null;
          min_followers?: number | null;
          min_engagement_rate?: number | null;
          niches?: string[] | null;
          status?: "active" | "paused" | "closed";
          created_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string;
          title?: string;
          description?: string | null;
          product_value_sgd?: number | null;
          deliverables?: string | null;
          min_followers?: number | null;
          min_engagement_rate?: number | null;
          niches?: string[] | null;
          status?: "active" | "paused" | "closed";
          created_at?: string;
        };
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          listing_id: string;
          creator_id: string;
          brand_id: string;
          status:
            | "applied"
            | "accepted"
            | "rejected"
            | "in_progress"
            | "completed"
            | "cancelled";
          creator_note: string | null;
          brand_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          creator_id: string;
          brand_id: string;
          status?:
            | "applied"
            | "accepted"
            | "rejected"
            | "in_progress"
            | "completed"
            | "cancelled";
          creator_note?: string | null;
          brand_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          creator_id?: string;
          brand_id?: string;
          status?:
            | "applied"
            | "accepted"
            | "rejected"
            | "in_progress"
            | "completed"
            | "cancelled";
          creator_note?: string | null;
          brand_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type CreatorProfile =
  Database["public"]["Tables"]["creator_profiles"]["Row"];
export type BrandProfile =
  Database["public"]["Tables"]["brand_profiles"]["Row"];
export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type Deal = Database["public"]["Tables"]["deals"]["Row"];

export type DealStatus = Deal["status"];
export type ListingStatus = Listing["status"];
export type UserRole = Profile["role"];
