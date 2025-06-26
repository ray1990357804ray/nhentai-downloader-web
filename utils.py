import os
import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
import zipfile
import shutil

def download_gallery(url, artist, title, labels):
    gallery_num = url.rstrip("/").split("/")[-1]
    headers = {"User-Agent": "Mozilla/5.0"}
    resp = requests.get(url, headers=headers)
    soup = BeautifulSoup(resp.content, "html.parser")

    first_img = soup.select_one(".gallerythumb img")
    if first_img and ("data-src" in first_img.attrs or "src" in first_img.attrs):
        src = first_img.get("data-src") or first_img.get("src")
        gallery_id = src.split("/galleries/")[1].split("/")[0]
    else:
        raise Exception("Could not find gallery ID.")

    page_count = len(soup.select(".gallerythumb"))

    label_list = [label.strip() for label in labels.split(",") if label.strip()]
    label_str = "".join([f"({l})" for l in label_list])
    folder_name = f"[{artist}] {gallery_num} {title} {label_str}".strip().replace(" ", "_")

    if not os.path.exists(folder_name):
        os.makedirs(folder_name)

    try:
        for i in range(1, page_count + 1):
            webp_url = f"https://i.nhentai.net/galleries/{gallery_id}/{i}.webp"
            img_data = requests.get(webp_url, headers=headers).content
            img = Image.open(BytesIO(img_data)).convert("RGB")
            filename = f"{i:03d}.jpg"
            img.save(os.path.join(folder_name, filename), "JPEG")

        zip_filename = f"{folder_name}.zip"
        with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zipf:
            for file in os.listdir(folder_name):
                zipf.write(os.path.join(folder_name, file), arcname=file)

        shutil.rmtree(folder_name)
        return zip_filename

    except Exception as e:
        shutil.rmtree(folder_name, ignore_errors=True)
        raise e
