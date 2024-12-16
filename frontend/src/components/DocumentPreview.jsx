import React from 'react';
import { 
    FileText, 
    FileImage, 
    File,
    FileSpreadsheet 
} from 'lucide-react';

const DocumentPreview = ({ document }) => {
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getDocumentPreview = () => {
        const extension = document.document_name.split('.').pop().toLowerCase();
        const isImage = document.document_type?.startsWith('image/');

        const previewConfig = {
            pdf: {
                icon: <FileText className="w-12 h-12 text-red-500" />,
                className: 'bg-red-50 border-red-200',
                label: 'PDF'
            },
            doc: {
                icon: <FileText className="w-12 h-12 text-blue-500" />,
                className: 'bg-blue-50 border-blue-200',
                label: 'DOC'
            },
            docx: {
                icon: <FileText className="w-12 h-12 text-blue-500" />,
                className: 'bg-blue-50 border-blue-200',
                label: 'DOCX'
            },
            xls: {
                icon: <FileSpreadsheet className="w-12 h-12 text-green-500" />,
                className: 'bg-green-50 border-green-200',
                label: 'XLS'
            },
            xlsx: {
                icon: <FileSpreadsheet className="w-12 h-12 text-green-500" />,
                className: 'bg-green-50 border-green-200',
                label: 'XLSX'
            },
            default: {
                icon: <File className="w-12 h-12 text-gray-500" />,
                className: 'bg-gray-50 border-gray-200',
                label: 'DOC'
            }
        };

        if (isImage) {
            return (
                <div className="doc-preview image bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-center mb-2">
                        <FileImage className="w-12 h-12 text-purple-500" />
                    </div>
                    <div className="text-xs text-center text-gray-600">Imagen</div>
                    <div className="doc-name text-sm font-medium text-gray-700 truncate mt-1">
                        {document.document_name}
                    </div>
                </div>
            );
        }

        const config = previewConfig[extension] || previewConfig.default;

        return (
            <div className={`doc-preview ${config.className} border rounded-lg p-3`}>
                <div className="flex items-center justify-center mb-2">
                    {config.icon}
                </div>
                <div className="text-xs text-center text-gray-600">{config.label}</div>
                <div className="doc-name text-sm font-medium text-gray-700 truncate mt-1">
                    {document.document_name}
                </div>
            </div>
        );
    };

    return (
        <div className="document-preview-container">
            {getDocumentPreview()}
            <div className="document-preview-info mt-2">
                <div className="flex flex-col text-xs text-gray-500">
                    <span className="document-date">
                        {new Date(document.upload_date).toLocaleDateString()} 
                        {" "}
                        {new Date(document.upload_date).toLocaleTimeString()}
                    </span>
                    {document.file_size && (
                        <span className="document-size">
                            {formatFileSize(document.file_size)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentPreview;