-- Adicionar coluna allow_bible_study na tabela plans
ALTER TABLE plans ADD COLUMN IF NOT EXISTS allow_bible_study BOOLEAN DEFAULT TRUE;

-- Adicionar coluna allow_bible_study na tabela companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS allow_bible_study BOOLEAN DEFAULT TRUE;

-- Criar tabela bible_studies
CREATE TABLE IF NOT EXISTS bible_studies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
