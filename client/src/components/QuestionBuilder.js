// import React, { useState } from "react";
// import { X, Plus, ImagePlus, Paperclip, GripVertical } from "lucide-react";
// import * as surveyService from "../services/surveyService";

// const QUESTION_TYPES = [
//   { value: "short-answer", label: "Short answer" },
//   { value: "long-answer", label: "Long answer" },
//   { value: "multiple-choice", label: "Multiple choice" },
//   { value: "checkboxes", label: "Checkboxes" },
//   { value: "dropdown", label: "Dropdown" },
//   { value: "rating", label: "Rating (1–5)" },
//   { value: "yes-no", label: "Yes / No" },
//   { value: "image", label: "Image question" },
//   { value: "file-upload", label: "File upload" },
// ];

// const NEEDS_OPTIONS = ["multiple-choice", "checkboxes", "dropdown"];

// export default function QuestionBuilder({ question, index, onChange, onRemove }) {
//   const [uploading, setUploading] = useState(false);
//   const [uploadError, setUploadError] = useState("");

//   function update(field, value) {
//     onChange(index, { ...question, [field]: value });
//   }

//   function updateOption(i, value) {
//     const options = [...question.options];
//     options[i] = value;
//     update("options", options);
//   }

//   function addOption() {
//     update("options", [...(question.options || []), ""]);
//   }

//   function removeOption(i) {
//     update("options", question.options.filter((_, oi) => oi !== i));
//   }

//   async function handleImageSelect(e) {
//     const file = e.target.files[0];
//     if (!file) return;
//     setUploadError("");
//     setUploading(true);
//     try {
//       const { url } = await surveyService.uploadFile(file);
//       update("imageUrl", url);
//     } catch (err) {
//       setUploadError(err.response?.data?.message || "Upload failed");
//     } finally {
//       setUploading(false);
//     }
//   }

//   return (
//     <div className="card relative flex flex-col gap-4 p-5 pl-14">
//       <span className="absolute left-4 top-5 flex h-6 items-center rounded-md bg-indigo-50 px-2 font-mono text-[11px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
//         Q{String(index + 1).padStart(2, "0")}
//       </span>
//       <GripVertical size={15} className="absolute left-1.5 top-6 text-gray-300 dark:text-gray-700" />

//       <div className="flex flex-wrap items-center gap-2.5">
//         <input
//           className="field-input min-w-[200px] flex-[2]"
//           placeholder="Question text"
//           value={question.question}
//           onChange={(e) => update("question", e.target.value)}
//         />
//         <select
//           className="field-input w-auto flex-1"
//           value={question.type}
//           onChange={(e) => update("type", e.target.value)}
//         >
//           {QUESTION_TYPES.map((t) => (
//             <option key={t.value} value={t.value}>
//               {t.label}
//             </option>
//           ))}
//         </select>
//         <label className="flex items-center gap-1.5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
//           <input
//             type="checkbox"
//             className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
//             checked={question.required}
//             onChange={(e) => update("required", e.target.checked)}
//           />
//           Required
//         </label>
//         <button type="button" className="btn-danger btn-icon btn-sm" onClick={() => onRemove(index)}>
//           <X size={14} />
//         </button>
//       </div>

//       {NEEDS_OPTIONS.includes(question.type) && (
//         <div className="flex flex-col gap-2 border-l-2 border-gray-100 pl-4 dark:border-gray-800">
//           {(question.options || []).map((opt, i) => (
//             <div key={i} className="flex gap-2">
//               <input
//                 className="field-input"
//                 value={opt}
//                 placeholder={`Option ${i + 1}`}
//                 onChange={(e) => updateOption(i, e.target.value)}
//               />
//               <button type="button" className="btn-ghost btn-icon btn-sm" onClick={() => removeOption(i)}>
//                 <X size={13} />
//               </button>
//             </div>
//           ))}
//           <button type="button" onClick={addOption} className="btn-ghost btn-sm w-fit">
//             <Plus size={13} /> Add option
//           </button>
//         </div>
//       )}

//       {question.type === "image" && (
//         <div className="flex flex-col gap-2 border-l-2 border-gray-100 pl-4 dark:border-gray-800">
//           {question.imageUrl && (
//             <img
//               src={question.imageUrl}
//               alt="Question asset"
//               className="h-32 w-auto rounded-lg border border-gray-200 object-cover dark:border-gray-700"
//             />
//           )}
//           <label className="btn-ghost btn-sm w-fit cursor-pointer">
//             <ImagePlus size={13} />
//             {uploading ? "Uploading…" : question.imageUrl ? "Replace image" : "Upload an image"}
//             <input type="file" accept="image/*" onChange={handleImageSelect} disabled={uploading} hidden />
//           </label>
//           {uploadError && <p className="field-error">{uploadError}</p>}
//         </div>
//       )}

//       {question.type === "file-upload" && (
//         <p className="field-hint flex items-center gap-1.5 border-l-2 border-gray-100 pl-4 dark:border-gray-800">
//           <Paperclip size={13} />
//           Respondents attach one file (image, PDF, or text/Word doc, up to 10MB).
//         </p>
//       )}
//     </div>
//   );
// }

// export { QUESTION_TYPES };

import React, { useState } from "react";
import { X, Plus, ImagePlus, Paperclip, GripVertical } from "lucide-react";
import * as surveyService from "../services/surveyService";

const QUESTION_TYPES = [
  { value: "short-answer", label: "Short answer" },
  { value: "long-answer", label: "Long answer" },
  { value: "multiple-choice", label: "Multiple choice" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
  { value: "rating", label: "Rating (1–5)" },
  { value: "yes-no", label: "Yes / No" },
  { value: "image", label: "Image question" },
  { value: "file-upload", label: "File upload" },
];

const NEEDS_OPTIONS = ["multiple-choice", "checkboxes", "dropdown"];

export default function QuestionBuilder({
  question,
  index,
  onChange,
  onRemove,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function update(field, value) {
    onChange(index, { ...question, [field]: value });
  }

  function updateOption(i, value) {
    const options = [...question.options];
    options[i] = value;
    update("options", options);
  }

  function addOption() {
    update("options", [...(question.options || []), ""]);
  }

  function removeOption(i) {
    update(
      "options",
      question.options.filter((_, oi) => oi !== i),
    );
  }

  async function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const { url } = await surveyService.uploadFile(file);
      // Note: 'imageUrl' is used for both image and file uploads to store the attachment link
      update("imageUrl", url);
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card relative flex flex-col gap-4 p-5 pl-14">
      <span className="absolute left-4 top-5 flex h-6 items-center rounded-md bg-indigo-50 px-2 font-mono text-[11px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
        Q{String(index + 1).padStart(2, "0")}
      </span>
      <GripVertical
        size={15}
        className="absolute left-1.5 top-6 text-gray-300 dark:text-gray-700"
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <input
          className="field-input min-w-[200px] flex-[2]"
          placeholder="Question text"
          value={question.question}
          onChange={(e) => update("question", e.target.value)}
        />
        <select
          className="field-input w-auto flex-1"
          value={question.type}
          onChange={(e) => update("type", e.target.value)}
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600"
            checked={question.required}
            onChange={(e) => update("required", e.target.checked)}
          />
          Required
        </label>
        <button
          type="button"
          className="btn-danger btn-icon btn-sm"
          onClick={() => onRemove(index)}
        >
          <X size={14} />
        </button>
      </div>

      {NEEDS_OPTIONS.includes(question.type) && (
        <div className="flex flex-col gap-2 border-l-2 border-gray-100 pl-4 dark:border-gray-800">
          {(question.options || []).map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="field-input"
                value={opt}
                placeholder={`Option ${i + 1}`}
                onChange={(e) => updateOption(i, e.target.value)}
              />
              <button
                type="button"
                className="btn-ghost btn-icon btn-sm"
                onClick={() => removeOption(i)}
              >
                <X size={13} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="btn-ghost btn-sm w-fit"
          >
            <Plus size={13} /> Add option
          </button>
        </div>
      )}

      {question.type === "image" && (
        <div className="flex flex-col gap-2 border-l-2 border-gray-100 pl-4 dark:border-gray-800">
          {question.imageUrl && (
            <img
              src={question.imageUrl}
              alt="Question asset"
              className="h-32 w-auto rounded-lg border border-gray-200 object-cover dark:border-gray-700"
            />
          )}
          <label className="btn-ghost btn-sm w-fit cursor-pointer">
            <ImagePlus size={13} />
            {uploading
              ? "Uploading…"
              : question.imageUrl
                ? "Replace image"
                : "Upload an image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={uploading}
              hidden
            />
          </label>
          {uploadError && <p className="field-error">{uploadError}</p>}
        </div>
      )}

      {/* FIXED SECTION: File Upload */}
      {question.type === "file-upload" && (
        <div className="flex flex-col gap-2 border-l-2 border-gray-100 pl-4 dark:border-gray-800">
          {/* Show preview of uploaded file (if url exists) */}
          {question.imageUrl && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/50">
              <Paperclip size={16} className="text-gray-500" />
              <a
                href={question.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
              >
                View uploaded file
              </a>
            </div>
          )}

          <label className="btn-ghost btn-sm w-fit cursor-pointer">
            <Paperclip size={13} />
            {uploading
              ? "Uploading…"
              : question.imageUrl
                ? "Replace file"
                : "Attach a file"}
            {/* Accepts images, PDFs, and Word docs as per the hint */}
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleImageSelect}
              disabled={uploading}
              hidden
            />
          </label>

          {uploadError && <p className="field-error">{uploadError}</p>}

          <p className="field-hint text-xs text-gray-500 dark:text-gray-400">
            Respondents can attach one file (image, PDF, or text/Word doc, up to
            10MB).
          </p>
        </div>
      )}
    </div>
  );
}

export { QUESTION_TYPES };