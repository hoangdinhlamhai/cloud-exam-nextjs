"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/components/Snackbar";
import { getAuthToken } from "@/lib/api";

// Placeholder notes data for demo (since backend needs courseId parameter)
const mockNotes = [
    {
        id: 1,
        courseId: 1,
        content: "IAM policies use JSON format. Remember: Effect, Action, Resource are required.",
        createdAt: "2024-01-15T10:30:00Z",
        courseName: "AWS Solutions Architect",
    },
    {
        id: 2,
        courseId: 1,
        content: "S3 bucket names must be globally unique. Use lowercase letters, numbers, and hyphens.",
        createdAt: "2024-01-14T14:20:00Z",
        courseName: "AWS Solutions Architect",
    },
    {
        id: 3,
        courseId: 2,
        content: "Azure AD differs from on-premises AD. It's an identity service, not LDAP.",
        createdAt: "2024-01-12T09:15:00Z",
        courseName: "Azure AZ-104",
    },
];

const NotesPage = () => {
    const router = useRouter();
    const { openSnackbar } = useSnackbar();
    const [notes, setNotes] = useState(mockNotes);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleAddNote = () => {
        const token = getAuthToken();
        if (!token) {
            openSnackbar({
                text: "Vui lòng đăng nhập để thêm ghi chú",
                type: "warning",
                duration: 3000,
            });
            router.push("/login");
            return;
        }

        if (!newNoteContent.trim()) {
            openSnackbar({
                text: "Vui lòng nhập nội dung ghi chú",
                type: "warning",
                duration: 3000,
            });
            return;
        }

        // Add note locally for demo
        const newNote = {
            id: Date.now(),
            courseId: 0,
            content: newNoteContent,
            createdAt: new Date().toISOString(),
            courseName: "General",
        };

        setNotes([newNote, ...notes]);
        setNewNoteContent("");
        setIsAddingNote(false);
        openSnackbar({
            text: "Đã thêm ghi chú",
            type: "success",
            duration: 2000,
        });
    };

    const handleDeleteNote = (id: number) => {
        setNotes(notes.filter(n => n.id !== id));
        openSnackbar({
            text: "Đã xóa ghi chú",
            type: "success",
            duration: 2000,
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    };

    const filteredNotes = notes.filter(note =>
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group notes by course
    const groupedNotes = filteredNotes.reduce((acc, note) => {
        const key = note.courseName;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(note);
        return acc;
    }, {} as Record<string, typeof mockNotes>);

    return (
        <div className="bg-slate-900 flex flex-col min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <header className="sticky top-0 z-50 px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button
                        className="w-9 h-9 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
                        onClick={() => router.back()}
                    >
                        <span className="text-white">←</span>
                    </button>
                    <h1 className="text-white text-lg font-bold flex-1">Ghi chú</h1>
                    <button
                        className="w-9 h-9 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
                        onClick={() => setIsAddingNote(true)}
                    >
                        <span className="text-white text-xl">+</span>
                    </button>
                </div>
            </header>

            {/* Search Bar */}
            <div className="px-4 py-3">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm ghi chú..."
                        className="w-full bg-slate-800/50 border border-white/10 text-white rounded-xl h-11 px-4 pl-10 focus:border-emerald-500 focus:outline-none placeholder:text-slate-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                </div>
            </div>

            {/* Add Note Modal */}
            {isAddingNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-slate-800 border border-white/10 rounded-2xl p-5 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-white text-lg font-bold">Thêm ghi chú</h2>
                            <button
                                onClick={() => setIsAddingNote(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <textarea
                            placeholder="Nhập nội dung ghi chú..."
                            className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl p-4 focus:border-emerald-500 focus:outline-none placeholder:text-slate-500 resize-none h-32"
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            autoFocus
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setIsAddingNote(false)}
                                className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddNote}
                                className="flex-1 py-3 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <main className="flex-1 px-4 py-2 overflow-y-auto pb-20">
                {filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <span className="text-slate-500 text-5xl">📒</span>
                        <p className="text-slate-400 text-sm">
                            {searchQuery ? "Không tìm thấy ghi chú" : "Chưa có ghi chú nào"}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setIsAddingNote(true)}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                            >
                                Thêm ghi chú đầu tiên
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedNotes).map(([courseName, courseNotes]) => (
                            <div key={courseName}>
                                <h2 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
                                    <span className="text-emerald-400">📚</span>
                                    {courseName}
                                    <span className="text-slate-500 font-normal">({courseNotes.length})</span>
                                </h2>
                                <div className="space-y-2">
                                    {courseNotes.map((note) => (
                                        <div
                                            key={note.id}
                                            className="bg-slate-800/40 border border-white/5 rounded-xl p-4 group relative"
                                        >
                                            <p className="text-slate-200 text-sm leading-relaxed pr-8">
                                                {note.content}
                                            </p>
                                            <p className="text-slate-500 text-xs mt-2">
                                                {formatDate(note.createdAt)}
                                            </p>
                                            {/* Delete button */}
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-500/0 text-slate-600 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Add Button (Mobile) */}
            <button
                onClick={() => setIsAddingNote(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 text-white text-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-110 transition-transform z-40"
            >
                +
            </button>
        </div>
    );
};

export default NotesPage;
