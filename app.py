from flask import Flask, jsonify, render_template, request, redirect, url_for, session, flash
import sqlite3
import uuid
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "supersecretkey"

bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = "login"

DATABASE_FILE = "database.db"

class User(UserMixin):
    def __init__(self, id, username):
        self.id = id
        self.username = username

@login_manager.user_loader
def load_user(user_id):
    conn = sqlite3.connect(DATABASE_FILE)
    cur = conn.cursor()
    cur.execute("SELECT id, username FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    conn.close()

    if row:
        return User(row[0], row[1])
    return None

def get_db_connection():
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

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
        username = request.form["username"]
        password = bcrypt.generate_password_hash(request.form["password"]).decode("utf-8")

        conn = get_db_connection()
        cur = conn.cursor()

        # Check if the username already exists
        cur.execute("SELECT id FROM users WHERE username = ?", (username,))
        existing_user = cur.fetchone()

        if existing_user:
            flash("Username already exists", "danger")
            conn.close()
            return redirect(url_for("register"))

        try:
            cur.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
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
        username = request.form["username"]
        password = request.form["password"]

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, password FROM users WHERE username = ?", (username,))
        user = cur.fetchone()
        conn.close()

        if user and bcrypt.check_password_hash(user["password"], password):
            login_user(User(user["id"], username))
            return redirect(url_for("index"))
        else:
            flash("Invalid username or password.", "danger")

    return render_template("login.html")

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
                cur.execute("INSERT INTO code_snippets (id, code, user_id) VALUES (?, ?, ?)", (file_id, code, user_id))

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