import axios from "axios";
import React, { useState, useRef } from "react";

function Register() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const validateForm = () => {
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validImageTypes.includes(file.type)) {
        alert("Please upload a valid image file (jpg, png, gif)");
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Uploaded file size should be less than 2MB");
        return false;
      }
    }
    return true;
  };

  const Submit = async () => {
    if (!validateForm() || !imagePreview) return;

    setLoading(true);
    const formData = new FormData();
    if (file) formData.append("file", file);

    try {
      const PostPrediction = "https://backend-saudi-date.onrender.com/predicts";
      const response = await axios.post(PostPrediction, formData);
      if (response.status === 200) {
        setData(response.data);
        setShowResult(true);
      }
    } catch (error) {
      console.error("Error uploading file", error);
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file, callback) => {
    const image = new Image();
    image.src = URL.createObjectURL(file);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const maxWidth = 800;
      const scaleSize = maxWidth / image.width;
      canvas.width = maxWidth;
      canvas.height = image.height * scaleSize;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            callback(compressedFile, URL.createObjectURL(blob));
          }
        },
        "image/jpeg",
        0.7
      );
    };
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    compressImage(selectedFile, (compressed, previewUrl) => {
      setFile(compressed);
      setImagePreview(previewUrl);
    });
  };

  const SubmitForm = (e) => {
    e.preventDefault();
    Submit();
  };

  const handleClear = (e) => {
    e.preventDefault();
    setFile(null);
    setImagePreview(null);
    setData(null);
    setShowResult(false);
    if (fileInputRef.current) fileInputRef.current.value = null;
    if (cameraInputRef.current) cameraInputRef.current.value = null;
    if (galleryInputRef.current) galleryInputRef.current.value = null;
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://thumbs.dreamstime.com/b/palm-tree-dates-10248972.jpg?w=768')`,
      }}
    >
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 rounded-lg shadow-xl max-w-lg w-full bg-white bg-opacity-90 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Type of Date Fruit Detector
          </h2>
          <form onSubmit={SubmitForm}>
            <div className="mb-4">
              <label className="block text-lg font-semibold text-blue-600">
                Upload Date Image
              </label>

              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current.click()}
                  className="flex-1 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-300"
                >
                  Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current.click()}
                  className="flex-1 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-300"
                >
                  Choose from Gallery
                </button>
              </div>

              <div
                className="w-full h-40 border-dashed border-4 border-gray-300 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden"
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile) {
                    compressImage(droppedFile, (compressed, previewUrl) => {
                      setFile(compressed);
                      setImagePreview(previewUrl);
                    });
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <p className="text-gray-500">
                    Image preview will appear here
                  </p>
                )}
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="mb-4">
              {!showResult ? (
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Submit"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {showResult && data && (
            <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow-inner">
              <h3 className="text-xl font-semibold text-gray-700">
                Prediction Result
              </h3>
              <p className="mt-2 text-gray-700">
                <strong>Predicted Class:</strong> {data.class}
              </p>
              <p className="text-gray-700">
                <strong>Confidence Level:</strong>{" "}
                {(data.confidence * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
