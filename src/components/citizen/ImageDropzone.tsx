import { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageDropzoneProps {
  value: string;
  onChange: (dataUrl: string) => void;
  errorMessage?: string;
}

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

const SAMPLE_CAPTURES = [
  { label: 'Muestra: Júpiter', url: '/Jupiter.jpg' },
  { label: 'Muestra: Saturno', url: '/Saturn.jpg' },
  { label: 'Muestra: Marte', url: '/Mars.jpg' },
  { label: 'Muestra: Titán', url: '/Saturn_Titan.jpg' },
];

export function ImageDropzone({ value, onChange, errorMessage }: ImageDropzoneProps) {
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('El archivo seleccionado no es una imagen (usa JPG, PNG o WebP).');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError('La imagen supera el límite de 4 MB. Comprímela antes de subirla.');
      return;
    }

    setFileError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const combinedError = fileError ?? errorMessage;

  return (
    <div className="dropzone-wrapper">
      <label htmlFor="astro-image-upload" className="dropzone-area">
        <Upload size={24} className="dropzone-icon" />
        <span className="dropzone-title">
          Haz clic para seleccionar tu astrofotografía (JPG, PNG, WebP · máx. 4 MB)
        </span>
        <span className="dropzone-subtitle">
          Se procesará localmente en alta fidelidad para el archivo científico
        </span>
        <input
          id="astro-image-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          aria-invalid={Boolean(combinedError)}
          aria-describedby={combinedError ? 'error-imageDataUrl' : undefined}
          className="dropzone-file-input"
        />
      </label>

      <div className="sample-presets">
        <span className="sample-presets-label">
          <ImageIcon size={14} className="inline-icon" /> ¿Sin foto a mano? Carga una captura rápida de prueba:
        </span>
        {SAMPLE_CAPTURES.map((sample) => (
          <button
            key={sample.url}
            type="button"
            className="match-btn"
            onClick={() => {
              setFileError(null);
              onChange(sample.url);
            }}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {value && (
        <div className="dropzone-preview">
          <img src={value} alt="Previsualización de la captura astronómica" className="preview-img" />
          <button
            type="button"
            className="recent-clear-btn"
            onClick={() => onChange('')}
          >
            Quitar imagen
          </button>
        </div>
      )}

      {combinedError && (
        <p id="error-imageDataUrl" role="alert" className="field-error">
          {combinedError}
        </p>
      )}
    </div>
  );
}