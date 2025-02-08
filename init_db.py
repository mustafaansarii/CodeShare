import sqlite3

DATABASE_FILE = "database.db"

def create_tables():
    conn = sqlite3.connect(DATABASE_FILE)
    cur = conn.cursor()

    # Drop existing tables to start fresh (optional)
    cur.execute("DROP TABLE IF EXISTS code_snippets")
    cur.execute("DROP TABLE IF EXISTS users")

    # Create users table first due to foreign key dependency
    cur.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')

    # Create code_snippets table with created_at column
    cur.execute('''
        CREATE TABLE code_snippets (
            id TEXT PRIMARY KEY,
            code TEXT NOT NULL,
            user_id INTEGER,
            created_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    ''')

    conn.commit()
    conn.close()
    print("Database initialized successfully!")

if __name__ == "__main__":
    create_tables()
