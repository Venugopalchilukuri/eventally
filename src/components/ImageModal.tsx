"use client";

import { useState } from 'react';
import Image from 'next/image';

interface ImageModalProps {
    imageUrl: string;
    title: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ImageModal({ imageUrl, title, isOpen, onClose }: ImageModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Image container */}
                <div
                    className="relative w-full h-full flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={imageUrl}
                        alt={title}
                        className="max-w-full max-h-full object-contain"
                        style={{ width: 'auto', height: 'auto' }}
                    />
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <h2 className="text-white text-2xl font-bold text-center">{title}</h2>
                </div>
            </div>
        </div>
    );
}
