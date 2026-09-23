-- ==============================================================================
-- SUPABASE SCHEMA FOR PORTFOLIO
-- Execute this script in your Supabase Project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CREATE TABLES
-- ==============================================================================

-- 2.1 Profile Table (Hero, Identity, Contact, Socials, About)
CREATE TABLE IF NOT EXISTS portfolio_profile (
  id TEXT PRIMARY KEY DEFAULT 'main',
  name TEXT NOT NULL,
  roles TEXT NOT NULL,
  bio TEXT NOT NULL,
  profile_image_url TEXT,
  resume_url TEXT NOT NULL,
  view_all_projects_text TEXT DEFAULT 'View All Projects →',
  view_all_projects_url TEXT,
  about_headline TEXT NOT NULL,
  about_text TEXT NOT NULL,
  about_quote TEXT NOT NULL,
  about_quote_author TEXT NOT NULL,
  about_stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  open_to_text TEXT NOT NULL,
  contact_headline TEXT NOT NULL,
  contact_subtext TEXT NOT NULL,
  linkedin TEXT,
  github TEXT,
  behance TEXT,
  instagram TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.2 Featured Projects Table
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  gradient TEXT,
  link TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.3 Skills & Tools Table
CREATE TABLE IF NOT EXISTS portfolio_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.4 Statistics Bar Table
CREATE TABLE IF NOT EXISTS portfolio_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  tint TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.5 Experience, Education & Journey Table
CREATE TABLE IF NOT EXISTS portfolio_journey (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  date_range TEXT NOT NULL,
  description TEXT,
  points TEXT[] NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.6 Certifications Table
CREATE TABLE IF NOT EXISTS portfolio_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  year TEXT NOT NULL,
  image_url TEXT,
  link TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.7 Settings / Metadata Table
CREATE TABLE IF NOT EXISTS portfolio_settings (
  id TEXT PRIMARY KEY DEFAULT 'config',
  site_title TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE portfolio_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_journey ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DO $$
BEGIN
  -- Profile
  DROP POLICY IF EXISTS "Public read portfolio_profile" ON portfolio_profile;
  DROP POLICY IF EXISTS "Admin full access portfolio_profile" ON portfolio_profile;
  -- Projects
  DROP POLICY IF EXISTS "Public read portfolio_projects" ON portfolio_projects;
  DROP POLICY IF EXISTS "Admin full access portfolio_projects" ON portfolio_projects;
  -- Skills
  DROP POLICY IF EXISTS "Public read portfolio_skills" ON portfolio_skills;
  DROP POLICY IF EXISTS "Admin full access portfolio_skills" ON portfolio_skills;
  -- Stats
  DROP POLICY IF EXISTS "Public read portfolio_stats" ON portfolio_stats;
  DROP POLICY IF EXISTS "Admin full access portfolio_stats" ON portfolio_stats;
  -- Journey
  DROP POLICY IF EXISTS "Public read portfolio_journey" ON portfolio_journey;
  DROP POLICY IF EXISTS "Admin full access portfolio_journey" ON portfolio_journey;
  -- Certifications
  DROP POLICY IF EXISTS "Public read portfolio_certifications" ON portfolio_certifications;
  DROP POLICY IF EXISTS "Admin full access portfolio_certifications" ON portfolio_certifications;
  -- Settings
  DROP POLICY IF EXISTS "Public read portfolio_settings" ON portfolio_settings;
  DROP POLICY IF EXISTS "Admin full access portfolio_settings" ON portfolio_settings;
END $$;

-- 3.1 Public Read (SELECT) Policies for all visitors
CREATE POLICY "Public read portfolio_profile" ON portfolio_profile
  FOR SELECT USING (true);

CREATE POLICY "Public read portfolio_projects" ON portfolio_projects
  FOR SELECT USING (true);

CREATE POLICY "Public read portfolio_skills" ON portfolio_skills
  FOR SELECT USING (true);

CREATE POLICY "Public read portfolio_stats" ON portfolio_stats
  FOR SELECT USING (true);

CREATE POLICY "Public read portfolio_journey" ON portfolio_journey
  FOR SELECT USING (true);

CREATE POLICY "Public read portfolio_certifications" ON portfolio_certifications
  FOR SELECT USING (true);

CREATE POLICY "Public read portfolio_settings" ON portfolio_settings
  FOR SELECT USING (true);

-- 3.2 Authenticated Admin Full Access (INSERT, UPDATE, DELETE) Policies
-- Only authenticated users (signed in through Supabase Auth) have modification rights
CREATE POLICY "Admin full access portfolio_profile" ON portfolio_profile
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access portfolio_projects" ON portfolio_projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access portfolio_skills" ON portfolio_skills
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access portfolio_stats" ON portfolio_stats
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access portfolio_journey" ON portfolio_journey
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access portfolio_certifications" ON portfolio_certifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access portfolio_settings" ON portfolio_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 4. SEED INITIAL DATA (Matches your current portfolio)
-- ==============================================================================

-- Profile
INSERT INTO portfolio_profile (
  id, name, roles, bio, resume_url, view_all_projects_text, view_all_projects_url,
  about_headline, about_text, about_quote, about_quote_author, about_stats,
  email, phone, location, open_to_text, contact_headline, contact_subtext,
  linkedin, github, behance, instagram
) VALUES (
  'main',
  'Yattapu Ganesh Kumar Reddy',
  'Data Analyst | Power BI Developer | UI/UX Designer',
  'Bridging the gap between raw data and strategic business decisions. I architect intuitive Power BI dashboards, conduct in-depth SQL & Python analytics, and design human-centered UI/UX experiences that transform complex metrics into actionable clarity.',
  'https://drive.google.com/drive/folders/16Nog2CQTeKkkRSgY3Vjsf44GiOaEv_7z?usp=sharing',
  'View All Projects →',
  'https://drive.google.com/drive/folders/16Nog2CQTeKkkRSgY3Vjsf44GiOaEv_7z?usp=sharing',
  'Transforming Complex Data into Strategic Clarity & Human-Centered Experiences',
  'I am a final-year Computer Science (Data Science) undergraduate with a dedicated passion for Data Analytics, Business Intelligence, and UI/UX Design. My dual foundation in statistical data engineering and user-centered design enables me to bridge the gap between complex raw metrics and executive decision-making.

Throughout my academic journey and internship experience at Analytics Career Connect, I have engineered scalable Power BI dashboards, automated SQL data workflows, and designed sleek web and mobile interfaces in Figma. I believe that data is only as valuable as the decisions it empowers — which is why every dashboard and interface I craft is centered around clarity, speed, and real-world impact.

Whether developing intricate DAX measures, exploring multi-variable datasets with Python, or crafting high-fidelity interactive prototypes, I bring rigorous analytical problem-solving and an eye for polished visual excellence to every project.',
  'Good design makes data understandable. Great design makes it actionable.',
  'Yattapu Ganesh Kumar Reddy',
  '[{"v": "03+", "l": "Years Analytics & Design"}, {"v": "20+", "l": "Dashboards & Projects Built"}, {"v": "100%", "l": "Data Integrity & Impact"}]'::jsonb,
  'yattapuganesh123@gmail.com',
  '+91 86390 71577',
  'Kadapa, Andhra Pradesh, India',
  'Internships | Full-time Jobs | Freelance Projects',
  'Let''s Build Something Amazing.',
  'I''m open to opportunities, freelance projects or just a friendly chat about data, design or ideas. Let''s connect and create real-world impact together.',
  'https://www.linkedin.com/in/yattapugani',
  'https://github.com/yattapugani',
  'https://behance.net',
  'https://instagram.com'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  roles = EXCLUDED.roles,
  bio = EXCLUDED.bio,
  resume_url = EXCLUDED.resume_url,
  about_headline = EXCLUDED.about_headline,
  about_text = EXCLUDED.about_text,
  about_quote = EXCLUDED.about_quote,
  about_quote_author = EXCLUDED.about_quote_author,
  about_stats = EXCLUDED.about_stats,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  open_to_text = EXCLUDED.open_to_text,
  contact_headline = EXCLUDED.contact_headline,
  contact_subtext = EXCLUDED.contact_subtext,
  linkedin = EXCLUDED.linkedin,
  github = EXCLUDED.github,
  behance = EXCLUDED.behance,
  instagram = EXCLUDED.instagram;

-- Projects
DELETE FROM portfolio_projects;
INSERT INTO portfolio_projects (title, description, tags, gradient, display_order) VALUES
  ('E-Commerce Sales Analysis', 'Interactive dashboard to track sales, profit, customer behavior and product performance.', ARRAY['Power BI', 'Data Analytics'], 'from-chart-4/30 to-accent/40', 0),
  ('Job Market Analysis (India)', 'Scraped and analysed 50K+ job postings to find hiring trends, top skills and salary insights.', ARRAY['Looker Studio', 'Web Scraping'], 'from-ink to-primary/80', 1),
  ('Dashboard UI Design', 'Modern and intuitive dashboard design template created in Figma.', ARRAY['Figma', 'UI/UX'], 'from-sage/40 to-chart-4/25', 2),
  ('Mobile App Concept', 'Clean and minimal mobile app UI for a productivity platform.', ARRAY['Figma', 'Product Design'], 'from-accent/30 to-sand', 3);

-- Skills & Tools
DELETE FROM portfolio_skills;
INSERT INTO portfolio_skills (name, icon, display_order) VALUES
  ('Excel', '📗', 0),
  ('Power BI', '📊', 1),
  ('Tableau', '📈', 2),
  ('Looker Studio', '🔎', 3),
  ('SQL', '🗄️', 4),
  ('Python', '🐍', 5),
  ('Pandas', '🐼', 6),
  ('Figma', '🎨', 7),
  ('Canva', '🖌️', 8),
  ('Adobe Ps', '🖼️', 9);

-- Stats
DELETE FROM portfolio_stats;
INSERT INTO portfolio_stats (icon, value, label, tint, display_order) VALUES
  ('📁', '20+', 'Projects Completed', 'bg-sage/30 text-sage', 0),
  ('📊', '30+', 'Dashboards Built', 'bg-accent/30 text-accent', 1),
  ('🎓', '5+', 'Tools Mastered', 'bg-chart-4/25 text-chart-4', 2),
  ('👥', '100%', 'Learning & Growing', 'bg-terracotta/25 text-terracotta', 3);

-- Journey (Experience & Education)
DELETE FROM portfolio_journey;
INSERT INTO portfolio_journey (icon, role, company, date_range, description, points, display_order) VALUES
  ('💼', 'Data Analyst Intern', 'Analytics Career Connect (ACC)', 'Mar 2026 – Present', 'Working in a professional analytics environment, building real-world dashboards and conducting data-driven analysis to support business decision-making.', ARRAY['Built Power BI dashboards for real business datasets', 'Performed advanced data cleaning, EDA and visualization', 'Collaborated with a cross-functional analytics team'], 0),
  ('🎓', 'B.Tech – CSE (Data Science)', 'Vemu Institute of Technology, Kadapa', '2023 – 2027', 'Pursuing a 4-year undergraduate degree specializing in Data Science, studying machine learning, database systems, analytics, and software engineering fundamentals.', ARRAY['Coursework in ML, DBMS, Statistics & Data Structures', 'Built 10+ academic and personal real-world projects', 'Active in hackathons, workshops and online certifications'], 1),
  ('✨', 'Freelance Designer', 'Self-Initiated / Independent', '2024 – Present', 'Offering UI/UX design services, data visualization and branding to startups and individuals looking for polished, human-centered digital experiences.', ARRAY['Designed UI/UX prototypes, posters and dashboards in Figma', 'Delivered creative branding assets for early-stage startups', 'Exploring freelance platforms and real-world client projects'], 2);

-- Certifications
DELETE FROM portfolio_certifications;
INSERT INTO portfolio_certifications (icon, title, issuer, year, link, display_order) VALUES
  ('📊', 'Power BI Data Analyst', 'Microsoft Learn', '2026', 'https://learn.microsoft.com', 0),
  ('🗄️', 'SQL (Advanced)', 'HackerRank', '2026', 'https://hackerrank.com', 1),
  ('📗', 'Excel Skills for Business', 'Coursera', '2026', 'https://coursera.org', 2),
  ('📈', 'Tableau Desktop Specialist', 'Coursera', '2026', 'https://coursera.org', 3);
