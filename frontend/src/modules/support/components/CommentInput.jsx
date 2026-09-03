// src/support/components/CommentInput.jsx
import React, { useState } from 'react';
import { addSupportComment } from '../services/supportService';

export default function CommentInput({ ticketId, currentUser, onCommentAdded }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Manejar selección manual de archivos (Click en el clip)
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // Agregamos los nuevos archivos a los que ya estaban (por si pegaron uno antes)
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    
    // Reseteamos el input para que permita seleccionar el mismo archivo si lo borraron
    e.target.value = null; 
  };

  // ==========================================
  // 2. LA MAGIA DEL CTRL + V (Pegar imágenes)
  // ==========================================
  const handlePaste = (e) => {
    const clipboardItems = e.clipboardData.items;
    const pastedFiles = [];

    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      
      // Verificamos si lo que pegaron es una imagen
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        
        // Le damos un nombre único ya que las imágenes pegadas suelen llamarse "image.png"
        const customFile = new File([file], `captura-${Date.now()}.png`, { type: file.type });
        pastedFiles.push(customFile);
      }
    }

    if (pastedFiles.length > 0) {
      // Evitamos que el navegador haga el comportamiento por defecto
      e.preventDefault(); 
      setFiles((prevFiles) => [...prevFiles, ...pastedFiles]);
    }
  };

  // 3. Eliminar un archivo del preview
  const removeFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  // 4. Enviar al Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;

    setIsSubmitting(true);
    try {
      await addSupportComment(ticketId, text, currentUser.id, currentUser.role, files);
      
      // Limpiamos el formulario tras el éxito
      setText('');
      setFiles([]);
      onCommentAdded(); 
    } catch (error) {
      alert("Error al enviar el mensaje");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      
      {/* Textarea con el evento onPaste */}
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows="3"
        placeholder="Escribe tu respuesta o pega una imagen (Ctrl + V)..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={handlePaste}
      ></textarea>

      {/* Preview de archivos seleccionados/pegados con botón para eliminar */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button 
                type="button" 
                onClick={() => removeFile(index)}
                className="ml-1 text-blue-400 hover:text-red-500 font-bold focus:outline-none"
                title="Eliminar archivo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        {/* Botón para adjuntar manual */}
        <label className="cursor-pointer text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          Adjuntar
          <input 
            type="file" 
            multiple 
            className="hidden" 
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting || (!text.trim() && files.length === 0)}
          className={`px-6 py-2 rounded-lg font-bold text-white transition shadow-sm ${
            isSubmitting || (!text.trim() && files.length === 0) 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow'
          }`}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </form>
  );
}