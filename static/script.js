document.getElementById("downloadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    url: form.url.value,
    artist: form.artist.value,
    title: form.title.value,
    labels: form.labels.value
  };

  document.getElementById("status").textContent = "Downloading...";

  const res = await fetch("/download", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });

  if (res.ok) {
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = "gallery.zip";
    a.click();
    document.getElementById("status").textContent = "Download complete!";
  } else {
    const err = await res.json();
    document.getElementById("status").textContent = "Error: " + (err.error || "Something went wrong");
  }
});
