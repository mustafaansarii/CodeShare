from flask import Flask, jsonify, render_template, request, redirect, url_for, session, flash
import sqlite3
import uuid
import os
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import threading
import time
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = "login"

oauth = OAuth(app)
app.secret_key = os.getenv("SECRET_KEY")

google = oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    access_token_url='https://oauth2.googleapis.com/token',
    authorize_url='https://accounts.google.com/o/oauth2/v2/auth',
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    userinfo_endpoint='https://www.googleapis.com/oauth2/v3/userinfo',
    client_kwargs={'scope': 'openid email profile'},
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration'
)

DATABASE_FILE = "database.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def cleanup_expired_files():
    while True:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            DELETE FROM code_snippets 
            WHERE user_id IS NULL 
            AND created_at < datetime('now', '-5 minutes')
        """)
        
        cur.execute("""
            DELETE FROM code_snippets 
            WHERE user_id IS NOT NULL 
            AND created_at < datetime('now', '-7 days')
        """)
        
        conn.commit()
        conn.close()
        time.sleep(60)  

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_expired_files, daemon=True)
cleanup_thread.start()

class User(UserMixin):
    def __init__(self, id, name, email=None):
        self.id = id
        self.name = name
        self.email = email

@login_manager.user_loader
def load_user(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()

    if row:
        return User(row[0], row[1], row[2])
    return None

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/codes")
@login_required
def user_codes():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM code_snippets WHERE user_id = ?", (current_user.id,))
    user_files = [row["id"] for row in cur.fetchall()]
    conn.close()

    return render_template("codes.html", user_files=user_files)

@app.route("/register", methods=["GET", "POST"])
def register():
    # If the user is already logged in, redirect to the homepage
    if current_user.is_authenticated:
        return redirect(url_for("index"))

    if request.method == "POST":
        name = request.form["name"]
        email = request.form.get("email")
        password = bcrypt.generate_password_hash(request.form["password"]).decode("utf-8")

        conn = get_db_connection()
        cur = conn.cursor()

        # Check if email already exists
        cur.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing_user = cur.fetchone()

        if existing_user:
            flash("Email already exists", "danger")
            conn.close()
            return redirect(url_for("register"))

        try:
            cur.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
                       (name, email, password))
            conn.commit()
            flash("Account created! Please log in.", "success")
            return redirect(url_for("login"))
        finally:
            conn.close()

    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    # If the user is already logged in, redirect to the homepage
    if current_user.is_authenticated:
        return redirect(url_for("index"))

    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, password, name, email FROM users WHERE email = ?", 
                   (email,))
        user = cur.fetchone()
        conn.close()

        if user and bcrypt.check_password_hash(user["password"], password):
            login_user(User(user["id"], user["name"], user["email"]))
            return redirect(url_for("index"))
        else:
            flash("Invalid email or password.", "danger")

    return render_template("login.html")

@app.route('/login/google')
def google_login():
    redirect_uri = url_for('auth_callback', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/auth/callback')
def auth_callback():
    token = google.authorize_access_token()
    user_info = google.get('userinfo').json()
    
    email = user_info.get("email")
    name = user_info.get("name", email)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Check if user exists by email
    cur.execute("SELECT id, name FROM users WHERE email = ?", (email,))
    user = cur.fetchone()
    
    if not user:
        # Create new user if they don't exist
        password = bcrypt.generate_password_hash(str(uuid.uuid4())).decode("utf-8")
        cur.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
                   (name, email, password))
        conn.commit()
        cur.execute("SELECT id, name FROM users WHERE email = ?", (email,))
        user = cur.fetchone()
    
    conn.close()
    
    # Log in the user
    login_user(User(user["id"], user["name"], email))
    return redirect(url_for('index'))

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))

@app.route("/new")
def create_new_file():
    unique_id = str(uuid.uuid4())[:8]
    return redirect(url_for("editor", file_id=unique_id))

@app.route("/editor/<file_id>", methods=["GET", "POST"])
def editor(file_id):
    if request.method == "POST":
        # Handle auto-save (AJAX)
        if request.is_json:
            data = request.get_json()
            code = data['code']
            conn = get_db_connection()
            cur = conn.cursor()

            # Check if code snippet exists
            cur.execute("SELECT * FROM code_snippets WHERE id = ?", (file_id,))
            existing_file = cur.fetchone()

            user_id = current_user.id if current_user.is_authenticated else None

            if existing_file:
                cur.execute("UPDATE code_snippets SET code = ? WHERE id = ?", (code, file_id))
            else:
                cur.execute("""
                    INSERT INTO code_snippets (id, code, user_id, created_at) 
                    VALUES (?, ?, ?, datetime('now'))
                """, (file_id, code, user_id))

            conn.commit()
            conn.close()

            return jsonify({"message": "Code saved successfully"}), 200

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT code FROM code_snippets WHERE id = ?", (file_id,))
    row = cur.fetchone()
    conn.close()

    code = row["code"] if row else ""
    
    return render_template("editor.html", file_id=file_id, code=code)

if __name__ == "__main__":
    app.run(debug=True)