-- Vues relationnelles sur le registre PNDDRR (table `registry`, colonne jsonb).
--
-- But : consultation et reporting (CloudBeaver, Grafana, exports SQL).
-- L'application n'écrit JAMAIS via ces vues — elles ne servent qu'à la lecture.
-- Rejouer ce fichier après tout changement de structure du registre.
--
-- Application : psql "$DATABASE_URL" -f db/views.sql

CREATE OR REPLACE VIEW v_combattants AS
SELECT c.*
FROM registry r
CROSS JOIN LATERAL jsonb_to_recordset(r.data -> 'combattants') AS c(
    id           text,
    num          text,
    statut       text,
    creele       text,
    agent        text,
    nom          text,
    prenom       text,
    alias        text,
    sexe         text,
    dn           text,
    ln           text,
    nat          text,
    tel          text,
    fam          text,
    prefecture   text,
    "sousPref"   text,
    commune      text,
    site         text,
    vague        text,
    groupe       text,
    grade        text,
    annees       text,
    zone         text,
    souhait      text,
    instr        text,
    obs          text,
    desarmement    jsonb,
    demobilisation jsonb,
    "reintMil"     jsonb,
    "reintSocio"   jsonb,
    fin            jsonb,
    abandon        jsonb
)
WHERE r.id = 1;

CREATE OR REPLACE VIEW v_journal AS
SELECT j.*
FROM registry r
CROSS JOIN LATERAL jsonb_to_recordset(r.data -> 'journal') AS j(
    date   timestamptz,
    "user" text,
    action text,
    detail text,
    h      text,
    ph     text
)
WHERE r.id = 1;

-- Comptes utilisateurs SANS le hash de mot de passe.
CREATE OR REPLACE VIEW v_users AS
SELECT u.id, u.login, u.nom, u.role, u.actif
FROM registry r
CROSS JOIN LATERAL jsonb_to_recordset(r.data -> 'users') AS u(
    id    text,
    login text,
    nom   text,
    role  text,
    actif boolean
)
WHERE r.id = 1;

-- Une ligne par arme remise, avec le combattant associé.
CREATE OR REPLACE VIEW v_desarmement_armes AS
SELECT c.id AS combattant_id, c.num, c.nom, c.prenom, c.groupe, a.*
FROM v_combattants c
CROSS JOIN LATERAL jsonb_to_recordset(
    COALESCE(c.desarmement -> 'armes', '[]'::jsonb)
) AS a(
    type    text,
    marque  text,
    calibre text,
    serie   text,
    etat    text,
    mun     text
);

-- Accès lecture pour la console d'administration (rôle créé par l'infra Ansible).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cloudbeaver_ro') THEN
        GRANT SELECT ON v_combattants, v_journal, v_users, v_desarmement_armes
            TO cloudbeaver_ro;
    END IF;
END $$;
