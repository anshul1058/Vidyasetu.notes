-- ═══════════ Complete Safe Migration Script ═══════════
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run: uses IF NOT EXISTS / exception handling everywhere

-- 0. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════ 1. ENUMS (create if missing) ═══════════
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'contributor', 'admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'material_category') THEN
        CREATE TYPE material_category AS ENUM ('notes', 'pyqs', 'assignments', 'books', 'presentations', 'other');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'branch_type') THEN
        CREATE TYPE branch_type AS ENUM ('computer_science', 'mechanical', 'electrical', 'electronics', 'civil', 'entc', 'it', 'mathematics', 'physics', 'chemistry', 'humanities');
    END IF;
END
$$;

-- Add new enum values to branch_type (safe if already exist)
DO $$
BEGIN
    BEGIN ALTER TYPE branch_type ADD VALUE IF NOT EXISTS 'entc'; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER TYPE branch_type ADD VALUE IF NOT EXISTS 'it'; EXCEPTION WHEN duplicate_object THEN NULL; END;
END
$$;

-- ═══════════ 2. TABLES (create if missing) ═══════════

-- Profiles table (likely already exists)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'student',
    reputation_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials table
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    stream TEXT,
    branch branch_type,
    autonomous_status TEXT,
    university TEXT,
    college TEXT,
    semester INTEGER CHECK (semester BETWEEN 1 AND 8),
    subject TEXT NOT NULL,
    category material_category NOT NULL,
    downloads INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews & Ratings
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(material_id, user_id)
);

-- Study Groups
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    branch branch_type,
    subject TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    member_count INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Members
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Group Messages
CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Downloads tracking
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(material_id, user_id)
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(material_id, user_id)
);

-- ═══════════ 3. Add columns if missing (for existing tables) ═══════════
DO $$
BEGIN
    -- Make branch nullable
    ALTER TABLE public.materials ALTER COLUMN branch DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    BEGIN ALTER TABLE public.materials ADD COLUMN stream TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.materials ADD COLUMN autonomous_status TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.materials ADD COLUMN university TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
    BEGIN ALTER TABLE public.materials ADD COLUMN college TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- ═══════════ 4. INDEXES (safe to re-create) ═══════════
CREATE INDEX IF NOT EXISTS idx_materials_branch ON public.materials(branch);
CREATE INDEX IF NOT EXISTS idx_materials_semester ON public.materials(semester);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON public.materials(subject);
CREATE INDEX IF NOT EXISTS idx_materials_category ON public.materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_uploader ON public.materials(uploader_id);
CREATE INDEX IF NOT EXISTS idx_materials_created ON public.materials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_materials_popularity ON public.materials(downloads DESC, avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_material ON public.reviews(material_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_branch ON public.study_groups(branch);
CREATE INDEX IF NOT EXISTS idx_study_groups_subject ON public.study_groups(subject);
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON public.group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created ON public.group_messages(created_at DESC);

-- ═══════════ 5. ROW LEVEL SECURITY ═══════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- ═══════════ 6. RLS POLICIES (safe re-run) ═══════════
DO $$
BEGIN
    -- Profiles policies
    BEGIN CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Materials policies
    BEGIN CREATE POLICY "Materials are viewable by all" ON public.materials FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Authenticated users can upload materials" ON public.materials FOR INSERT WITH CHECK (auth.uid() = uploader_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Uploaders can update their materials" ON public.materials FOR UPDATE USING (auth.uid() = uploader_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Uploaders can delete their materials" ON public.materials FOR DELETE USING (auth.uid() = uploader_id); EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Reviews policies
    BEGIN CREATE POLICY "Reviews are viewable by all" ON public.reviews FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Authenticated users can review" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Study Groups policies
    BEGIN CREATE POLICY "Public groups are viewable" ON public.study_groups FOR SELECT USING (is_public = true OR EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Authenticated users can create groups" ON public.study_groups FOR INSERT WITH CHECK (auth.uid() = created_by); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Group creator can update" ON public.study_groups FOR UPDATE USING (auth.uid() = created_by); EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Group Members policies
    BEGIN CREATE POLICY "Members can view group members" ON public.group_members FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Group Messages policies
    BEGIN CREATE POLICY "Group members can read messages" ON public.group_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Group members can send messages" ON public.group_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Downloads policies
    BEGIN CREATE POLICY "Users can track own downloads" ON public.downloads FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;

    -- Bookmarks policies
    BEGIN CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can add bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Users can remove bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ═══════════ 7. TRIGGERS & FUNCTIONS ═══════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    BEGIN CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON public.study_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    BEGIN CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Update material rating on review
CREATE OR REPLACE FUNCTION update_material_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.materials
    SET avg_rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM public.reviews
        WHERE material_id = NEW.material_id
    )
    WHERE id = NEW.material_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    BEGIN CREATE TRIGGER on_review_created AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_material_rating(); EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.materials
    SET downloads = downloads + 1
    WHERE id = NEW.material_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    BEGIN CREATE TRIGGER on_material_downloaded AFTER INSERT ON public.downloads FOR EACH ROW EXECUTE FUNCTION increment_download_count(); EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ═══════════ 8. STORAGE BUCKET POLICIES ═══════════
DO $$
BEGIN
    BEGIN CREATE POLICY "Anyone can read materials" ON storage.objects FOR SELECT USING (bucket_id = 'materials'); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Auth users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'materials' AND auth.role() = 'authenticated'); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Owners can update" ON storage.objects FOR UPDATE USING (bucket_id = 'materials' AND (auth.uid())::text = owner_id::text); EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN CREATE POLICY "Owners can delete" ON storage.objects FOR DELETE USING (bucket_id = 'materials' AND (auth.uid())::text = owner_id::text); EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ═══════════ DONE! ═══════════
-- All tables, indexes, policies, triggers, and functions are now set up.
