CREATE TABLE trainers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    level INT NOT NULL DEFAULT 1,
    experience INT NOT NULL DEFAULT 0
);


CREATE TABLE pokemons (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    life_point INT NOT NULL,
    max_life_point INT NOT NULL,
    trainer_id INT REFERENCES trainers(id) ON DELETE SET NULL
);


CREATE TABLE attacks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    damage INT NOT NULL,
    usage_limit INT NOT NULL
);


CREATE TABLE pokemon_attacks (
    pokemon_id INT REFERENCES pokemons(id) ON DELETE CASCADE,
    attack_id INT REFERENCES attacks(id) ON DELETE CASCADE,
    current_uses INT NOT NULL DEFAULT 0,
    PRIMARY KEY (pokemon_id, attack_id)
);

-- Insertions

INSERT INTO trainers (name, level, experience) VALUES
('Sacha', 10, 1500),
('Ondine', 8, 1200),
('Pierre', 9, 1300),
('Erika', 6, 1000),
('James', 5, 900),
('Jessie', 4, 800),
('Régis Chen', 12, 1700),
('Flora', 3, 700);

INSERT INTO pokemons (name, life_point, max_life_point, trainer_id) VALUES
('Pikachu', 35, 35, 1),
('Bulbizarre', 45, 45, 1),
('Carapuce', 44, 44, 2),
('Salamèche', 39, 39, 3),
('Goupix', 38, 38, 4),
('Magicarpe', 20, 20, NULL),
('Evoli', 55, 55, 5),
('Dracaufeu', 78, 78, 6),
('Mewtwo', 106, 106, NULL),
('Tortank', 79, 79, 7);

INSERT INTO attacks (name, damage, usage_limit) VALUES
('Éclair', 40, 15),
('Lance-Flammes', 90, 5),
('Hydrocanon', 80, 5),
('Vive-Attaque', 30, 20),
('Morsure', 60, 10),
('Pistolet à O', 50, 10),
('Griffe', 70, 10),
('Psyko', 100, 5);

INSERT INTO pokemon_attacks (pokemon_id, attack_id, current_uses) VALUES
(1, 1, 0),  -- Pikachu - Éclair
(1, 4, 0),  -- Pikachu - Vive-Attaque
(2, 6, 0),  -- Bulbizarre - Pistolet à O
(2, 7, 0),  -- Bulbizarre - Griffe
(3, 3, 0),  -- Carapuce - Hydrocanon
(3, 6, 0),  -- Carapuce - Pistolet à O
(4, 2, 0),  -- Salamèche - Lance-Flammes
(4, 4, 0),  -- Salamèche - Vive-Attaque
(5, 5, 0),  -- Goupix - Morsure
(5, 2, 0),  -- Goupix - Lance-Flammes
(6, 6, 0),  -- Magicarpe - Pistolet à O
(7, 7, 0),  -- Evoli - Griffe
(7, 4, 0),  -- Evoli - Vive-Attaque
(8, 2, 0),  -- Dracaufeu - Lance-Flammes
(8, 5, 0),  -- Dracaufeu - Morsure
(9, 8, 0),  -- Mewtwo - Psyko
(10, 3, 0), -- Tortank - Hydrocanon
(10, 6, 0); -- Tortank - Pistolet à O