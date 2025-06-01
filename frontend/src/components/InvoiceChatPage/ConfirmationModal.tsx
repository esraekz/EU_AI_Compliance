// src/components/InvoiceChatPage/ConfirmationModal.tsx

import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'primary' | 'danger';
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'OK',
    cancelText = 'Cancel',
    confirmColor = 'primary',
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    const confirmButtonStyle = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600' as const,
        minWidth: '80px',
        background: confirmColor === 'danger' ? '#e53935' : '#5b42f3',
        color: 'white'
    };

    const cancelButtonStyle = {
        padding: '10px 20px',
        border: '1px solid #d0d0d0',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        background: 'white',
        color: '#666',
        minWidth: '80px'
    };

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 2000, // Higher than chat history modal
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={onCancel}
            >
                {/* Modal */}
                <div
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        animation: 'modalSlideIn 0.2s ease-out'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        padding: '20px 24px 16px 24px'
                    }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#333',
                            marginBottom: '12px'
                        }}>
                            {title}
                        </h3>
                        <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: '#666',
                            lineHeight: '1.5'
                        }}>
                            {message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div style={{
                        padding: '16px 24px 24px 24px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px'
                    }}>
                        <button
                            onClick={onCancel}
                            style={cancelButtonStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f5f5f5';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            style={confirmButtonStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = confirmColor === 'danger' ? '#d32f2f' : '#4a35d9';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = confirmColor === 'danger' ? '#e53935' : '#5b42f3';
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style jsx>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default ConfirmationModal;
