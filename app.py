from flask import Flask, request, send_file, render_template, jsonify
from utils import download_gallery
import requests
from bs4 import BeautifulSoup
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

@app.route("/preview", methods=["POST"])
def preview():
    data = request.json
    url = data.get("url")
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        resp = requests.get(url, headers=headers)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.content, "html.parser")
        first_img = soup.select_one(".gallerythumb img")
        if first_img and ("data-src" in first_img.attrs or "src" in first_img.attrs):
            src = first_img.get("data-src") or first_img.get("src")
            gallery_id = src.split("/galleries/")[1].split("/")[0]
            cover_url = f"https://t1.nhentai.net/galleries/{gallery_id}/cover.jpg.webp"
            return jsonify({"cover_url": cover_url})
        else:
            return jsonify({"error": "Could not find cover image"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

