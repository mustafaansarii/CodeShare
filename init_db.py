import sqlite3

DATABASE_FILE = "database.db"

def create_tables():
    conn = sqlite3.connect(DATABASE_FILE)
    cur = conn.cursor()

    # Create users table first due to foreign key dependency
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')

    # Create code_snippets table with created_at column
    cur.execute('''
        CREATE TABLE IF NOT EXISTS code_snippets (
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