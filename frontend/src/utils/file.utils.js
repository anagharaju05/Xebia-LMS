export function fileToDataUrl(event, onValue) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => onValue(reader.result);
  reader.readAsDataURL(file);
  event.target.value = "";
}

export function readDroppedFile(file, onValue, asText = false) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    onValue({
      url: asText ? "" : reader.result,
      text: asText ? String(reader.result || "") : "",
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      fileSize: file.size
    });
  };
  if (asText) reader.readAsText(file);
  else reader.readAsDataURL(file);
}