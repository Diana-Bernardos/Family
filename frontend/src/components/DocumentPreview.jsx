// src/components/DocumentPreview.jsx
import React from 'react';

const DocumentPreview = ({ document }) => {
    const getDocumentIcon = (documentName) => {
        const extension = documentName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return (
                    <div className="doc-preview pdf">
                        <div className="doc-icon">PDF</div>
                        <div className="doc-name">{documentName}</div>
                    </div>
                );
            case 'doc':
            case 'docx':
                return (
                    <div className="doc-preview word">
                        <div className="doc-icon">DOC</div>
                        <div className="doc-name">{documentName}</div>
                    </div>
                );
            case 'xls':
            case 'xlsx':
                return (
                    <div className="doc-preview excel">
                        <div className="doc-icon">XLS</div>
                        <div className="doc-name">{documentName}</div>
                    </div>
                );
            default:
                return (
                    <div className="doc-preview default">
                        <div className="doc-icon">DOC</div>
                        <div className="doc-name">{documentName}</div>
                    </div>
                );
        }
    };

    return (
        <div className="document-preview-container">
            {getDocumentIcon(document.document_name)}
            <div className="document-preview-info">
                <span className="document-date">
                    {new Date(document.upload_date).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
};

export default DocumentPreview;