// src/components/DocumentList.jsx
import React from 'react';

const DocumentList = ({ documents, onDelete, onDownload }) => {
    const getDocumentIcon = (documentName) => {
        const extension = documentName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'xls':
            case 'xlsx':
                return '📊';
            case 'jpg':
            case 'jpeg':
            case 'png':
                return '🖼️';
            default:
                return '📎';
        }
    };

    return (
        <div className="documents-list">
            {documents.map(doc => (
                <div key={doc.id} className="document-item">
                    <div className="document-preview">
                        <span className="document-icon">
                            {getDocumentIcon(doc.document_name)}
                        </span>
                        <div className="document-info">
                            <span className="document-name">{doc.document_name}</span>
                            <span className="document-date">
                                {new Date(doc.upload_date).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className="document-actions">
                        <button 
                            onClick={() => onDownload(doc.id, doc.document_name)}
                            className="btn btn-secondary btn-sm"
                            title="Descargar"
                        >
                            ⬇️ Descargar
                        </button>
                        <button 
                            onClick={() => onDelete(doc.id)}
                            className="btn btn-danger btn-sm"
                            title="Eliminar"
                        >
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentList;