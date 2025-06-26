from flask import Flask, request, send_file, render_template
from utils import download_gallery
import os

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/download", methods=["POST"])
def download():
    data = request.json
    url = data.get("url")
    artist = data.get("artist")
    title = data.get("title")
    labels = data.get("labels")

    try:
        zip_path = download_gallery(url, artist, title, labels)
        return send_file(zip_path, as_attachment=True)
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    app.run(debug=True)