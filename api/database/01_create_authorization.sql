CREATE TABLE authorization (
    hashed_token TEXT NOT NULL UNIQUE
    , salt TEXT NOT NULL
    , memo TEXT
);
