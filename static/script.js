document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("url-input");
  const previewContainer = document.getElementById("preview-container");
  const downloadForm = document.getElementById("downloadForm");
  const status = document.getElementById("status");
document.querySelector('input[name="artist"]').style.display = 'none';
document.querySelector('input[name="title"]').style.display = 'none';
document.querySelector('input[name="labels"]').style.display = 'none';

  async function updatePreview() {
    const url = urlInput.value.trim();
    if (!url) {
      previewContainer.innerHTML = "";
      return;
    }

    try {
      const response = await fetch("/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();

      if (data.cover_url) {
        previewContainer.innerHTML = `<img src="${data.cover_url}" alt="Gallery Preview" width="350" height="490" />`;
      } else {
        previewContainer.innerHTML = `<p style="color:#f33;">Preview not found</p>`;
      }
    } catch (err) {
      previewContainer.innerHTML = `<p style="color:#f33;">Error loading preview</p>`;
    }
  }

  urlInput.addEventListener("input", updatePreview);

  downloadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "Downloading... Please wait.";

    const formData = {
      url: urlInput.value.trim(),
      artist: downloadForm.artist.value.trim(),
      title: downloadForm.title.value.trim(),
      labels: downloadForm.labels.value.trim(),
    };

    try {
      const response = await fetch("/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        status.textContent = `Error: ${error.error || "Unknown error"}`;
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${formData.artist} - ${formData.title}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      status.textContent = "Download complete!";
    } catch (err) {
      status.textContent = `Error: ${err.message}`;
    }
  });
});
