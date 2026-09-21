-- Schéma PostgreSQL de PNDDRR.
--
-- Le registre entier est un unique document JSON (voir src/server/store.ts).
-- Il est stocké dans une table à ligne unique. Cette définition DOIT rester
-- identique au `CREATE TABLE IF NOT EXISTS` de ensureSchema() dans store.ts.
--
-- Application : psql "$DATABASE_URL" -f db/schema.sql

CREATE TABLE IF NOT EXISTS registry (
    id         smallint    PRIMARY KEY DEFAULT 1,
    data       jsonb       NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT registry_singleton CHECK (id = 1)
);

COMMENT ON TABLE registry IS
    'Registre PNDDRR complet (document JSON unique). Écrit intégralement à chaque sauvegarde par l''application.';
