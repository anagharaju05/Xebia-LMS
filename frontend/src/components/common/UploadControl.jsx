import { Upload } from "lucide-react";
import { fileToDataUrl } from "../../utils/file.utils.js";

export default function UploadControl({ onFile }) {
  return (
    <label className="upload-control">
      <Upload size={16} />
      Upload image/file
      <input type="file" accept="image/*,.pdf,.ppt,.pptx" onChange={(event) => fileToDataUrl(event, onFile)} />
    </label>
  );
}