const urlInput = document.querySelector('input[name="url"]');
const previewContainer = document.getElementById("preview-container");
const status = document.getElementById("status");
const form = document.getElementById("downloadForm");

urlInput.addEventListener("input", async () => {
  const url = urlInput.value.trim();
  previewContainer.innerHTML = "";
  if (!url) return;

  // Show loading text or spinner
  previewContainer.textContent = "Loading preview...";

  try {
    const res = await fetch("/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) throw new Error("Preview fetch failed");

    const data = await res.json();

    if (data.cover_url) {
      previewContainer.innerHTML = `<img class="lazyload" width="350" height="490" src="${data.cover_url}" alt="Gallery Cover" style="border-radius:12px; box-shadow:0 0 15px #ff2d95;" />`;
    } else {
      previewContainer.textContent = "No preview available.";
    }
  } catch (e) {
    previewContainer.textContent = "Error loading preview.";
  }
});

// Existing download form submission logic
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    url: form.url.value,
    artist: form.artist.value,
    title: form.title.value,
    labels: form.labels.value,
  };

  status.textContent = "";
  previewContainer.style.display = "none"; // Optionally hide preview on download

  status.textContent = "Downloading...";

  try {
    const res = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Download failed");
    }

    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = "gallery.zip";
    a.click();

    status.textContent = "✅ Download complete!";
  } catch (err) {
    status.textContent = `❌ Error: ${err.message}`;
  } finally {
    previewContainer.style.display = "block"; // Show preview again after download
  }
});
