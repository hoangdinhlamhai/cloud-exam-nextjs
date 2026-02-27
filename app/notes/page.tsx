"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/components/Snackbar";
import Spinner from "@/components/Spinner";
import { getAuthToken } from "@/lib/api";
import { noteService } from "@/services/note";

interface DisplayNote {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    courseName: string;
    questionContent?: string;
}

const NotesPage = () => {
    const router = useRouter();
    const { openSnackbar } = useSnackbar();
    const [notes, setNotes] = useState<DisplayNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // CRUD modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
    const [editingNote, setEditingNote] = useState<DisplayNote | null>(null);
    const [noteContent, setNoteContent] = useState("");

    // Delete confirmation
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const mapNoteToDisplay = (note: any): DisplayNote => ({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt || note.createdAt,
        courseName:
            note.course?.title ||
            note.question?.exam?.course?.title ||
            "Chung",
        questionContent: note.question?.content,
    });

    const fetchNotes = useCallback(async () => {
        const token = getAuthToken();
        if (!token) {
            openSnackbar({ text: "Vui lòng đăng nhập", type: "warning", duration: 3000 });
            router.push("/login");
            return;
        }

        try {
            setIsLoading(true);
            const data = await noteService.getAllNotes();
            setNotes(data.map(mapNoteToDisplay));
        } catch (error) {
            console.error("Failed to fetch notes:", error);
            openSnackbar({ text: "Không thể tải ghi chú", type: "error", duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    }, [openSnackbar, router]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    // ── Handlers ──

    const openCreateModal = () => {
        setModalMode("create");
        setEditingNote(null);
        setNoteContent("");
        setModalOpen(true);
    };

    const openEditModal = (note: DisplayNote) => {
        setModalMode("edit");
        setEditingNote(note);
        setNoteContent(note.content);
        setModalOpen(true);
    };

    const openViewModal = (note: DisplayNote) => {
        setModalMode("view");
        setEditingNote(note);
        setNoteContent(note.content);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingNote(null);
        setNoteContent("");
    };

    const handleSave = async () => {
        if (!noteContent.trim()) {
            openSnackbar({ text: "Vui lòng nhập nội dung", type: "warning", duration: 3000 });
            return;
        }

        try {
            if (modalMode === "create") {
                const created = await noteService.createNote({ content: noteContent });
                const display = mapNoteToDisplay(created);
                setNotes(prev => [display, ...prev]);
                openSnackbar({ text: "Đã tạo ghi chú", type: "success", duration: 2000 });
            } else if (modalMode === "edit" && editingNote) {
                // Update = delete old + create new (backend uses upsert for questionId)
                await noteService.deleteNote(editingNote.id);
                const created = await noteService.createNote({ content: noteContent });
                const display = mapNoteToDisplay(created);
                setNotes(prev => [display, ...prev.filter(n => n.id !== editingNote.id)]);
                openSnackbar({ text: "Đã cập nhật ghi chú", type: "success", duration: 2000 });
            }
            closeModal();
        } catch (error) {
            console.error("Save note error:", error);
            openSnackbar({ text: "Không thể lưu ghi chú", type: "error", duration: 3000 });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await noteService.deleteNote(id);
            setNotes(prev => prev.filter(n => n.id !== id));
            setDeleteConfirmId(null);
            openSnackbar({ text: "Đã xóa ghi chú", type: "success", duration: 2000 });
        } catch (error) {
            console.error("Delete note error:", error);
            openSnackbar({ text: "Không thể xóa ghi chú", type: "error", duration: 3000 });
        }
    };

    // ── Helpers ──

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const filteredNotes = notes.filter(
        (note) =>
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedNotes = filteredNotes.reduce((acc, note) => {
        const key = note.courseName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(note);
        return acc;
    }, {} as Record<string, DisplayNote[]>);

    const totalNotes = notes.length;
    const totalCourses = Object.keys(
        notes.reduce((acc, n) => ({ ...acc, [n.courseName]: true }), {} as Record<string, boolean>)
    ).length;

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
            {/* ════════════ HEADER ════════════ */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="mx-auto max-w-7xl flex items-center justify-between px-5 py-3 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/home")}
                            className="flex items-center gap-2 group"
                        >
                            <span className="text-lg font-extrabold tracking-tight">
                                Cloud<span className="text-cyan-400">Exam</span>
                            </span>
                        </button>
                        <span className="text-slate-600">/</span>
                        <h1 className="text-sm font-semibold text-slate-300">Ghi chú</h1>
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 rounded-xl border border-white/10 hover:bg-white/[0.06] hover:text-white transition-all"
                    >
                        ← Quay lại
                    </button>
                </div>
            </header>

            {/* ════════════ HERO SECTION ════════════ */}
            <section className="relative overflow-hidden border-b border-white/[0.06]">
                {/* Background */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-gradient-to-b from-emerald-600/15 via-cyan-600/10 to-transparent blur-3xl" />
                    <div className="absolute top-20 right-0 h-48 w-48 rounded-full bg-green-500/10 blur-3xl" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-medium text-emerald-300">Ghi chú cá nhân</span>
                            </div>
                            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                                Ghi chú <span className="text-emerald-400">của bạn</span>
                            </h2>
                            <p className="mt-3 max-w-lg text-slate-400 leading-relaxed">
                                Quản lý ghi chú từ các bài thi và khoá học. Tổ chức kiến thức để ôn tập hiệu quả hơn.
                            </p>
                        </div>

                        {/* Stats cards */}
                        <div className="flex gap-3">
                            <div className="bg-slate-900/80 border border-white/[0.06] rounded-2xl px-6 py-4 text-center min-w-[100px]">
                                <p className="text-2xl font-black text-emerald-400">{totalNotes}</p>
                                <p className="text-xs text-slate-500 mt-1">Ghi chú</p>
                            </div>
                            <div className="bg-slate-900/80 border border-white/[0.06] rounded-2xl px-6 py-4 text-center min-w-[100px]">
                                <p className="text-2xl font-black text-cyan-400">{totalCourses}</p>
                                <p className="text-xs text-slate-500 mt-1">Khoá học</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════ TOOLBAR ════════════ */}
            <section className="sticky top-[57px] z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="mx-auto max-w-7xl flex items-center gap-3 px-5 py-3 lg:px-8">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Tìm kiếm ghi chú..."
                            className="w-full bg-slate-900/60 border border-white/[0.08] text-white text-sm rounded-xl h-10 px-4 pl-10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none placeholder:text-slate-600 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-sm">🔍</span>
                    </div>

                    {/* Create button */}
                    <button
                        onClick={openCreateModal}
                        className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5"
                    >
                        <span className="text-lg">+</span>
                        <span className="hidden sm:inline">Tạo ghi chú</span>
                    </button>
                </div>
            </section>

            {/* ════════════ CONTENT ════════════ */}
            <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Spinner visible size="lg" />
                        <p className="text-slate-500 text-sm">Đang tải ghi chú...</p>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900/80 border border-white/[0.06] text-4xl">
                            📒
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-white mb-1">
                                {searchQuery ? "Không tìm thấy kết quả" : "Chưa có ghi chú nào"}
                            </p>
                            <p className="text-sm text-slate-500">
                                {searchQuery
                                    ? `Không có ghi chú nào phù hợp với "${searchQuery}"`
                                    : "Bắt đầu ghi chú ngay khi làm bài thi hoặc tạo ghi chú mới"}
                            </p>
                        </div>
                        {!searchQuery && (
                            <button
                                onClick={openCreateModal}
                                className="mt-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
                            >
                                + Tạo ghi chú đầu tiên
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedNotes).map(([courseName, courseNotes]) => (
                            <div key={courseName}>
                                {/* Group header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-sm">
                                        📚
                                    </div>
                                    <h3 className="text-base font-bold text-white">{courseName}</h3>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded-full">
                                        {courseNotes.length} ghi chú
                                    </span>
                                </div>

                                {/* Notes grid */}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {courseNotes.map((note) => (
                                        <div
                                            key={note.id}
                                            className="group relative rounded-2xl border border-white/[0.06] bg-slate-900/50 p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-slate-900/80 hover:-translate-y-0.5 cursor-pointer"
                                            onClick={() => openViewModal(note)}
                                        >
                                            {/* Hover glow */}
                                            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 opacity-0 blur-3xl transition-opacity group-hover:opacity-10" />

                                            {/* Question reference */}
                                            {note.questionContent && (
                                                <div className="flex items-start gap-2 mb-3 pb-3 border-b border-white/[0.06]">
                                                    <span className="text-emerald-400 text-xs mt-0.5 flex-shrink-0">📝</span>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                        {note.questionContent}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Note content */}
                                            <p className="text-sm text-slate-300 leading-relaxed line-clamp-4 mb-4">
                                                {note.content}
                                            </p>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-slate-600">
                                                    {formatDate(note.updatedAt || note.createdAt)}
                                                </span>

                                                {/* Actions */}
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => openEditModal(note)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all text-xs"
                                                        title="Chỉnh sửa"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(note.id)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all text-xs"
                                                        title="Xóa"
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ════════════ MODAL (Create / Edit / View) ════════════ */}
            {modalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={closeModal}>
                    <div
                        className="bg-slate-900 border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${modalMode === "view"
                                        ? "bg-slate-800"
                                        : "bg-gradient-to-br from-emerald-500 to-green-600"
                                    }`}>
                                    {modalMode === "create" ? "✨" : modalMode === "edit" ? "✏️" : "📄"}
                                </div>
                                <h2 className="text-lg font-bold text-white">
                                    {modalMode === "create"
                                        ? "Tạo ghi chú mới"
                                        : modalMode === "edit"
                                            ? "Chỉnh sửa ghi chú"
                                            : "Chi tiết ghi chú"}
                                </h2>
                            </div>
                            <button
                                onClick={closeModal}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-white transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="px-6 py-5">
                            {/* Question reference in view mode */}
                            {modalMode === "view" && editingNote?.questionContent && (
                                <div className="mb-4 p-3 bg-slate-800/60 border border-white/[0.06] rounded-xl">
                                    <p className="text-xs text-slate-500 mb-1 font-medium">Câu hỏi liên quan</p>
                                    <p className="text-sm text-slate-300 leading-relaxed">{editingNote.questionContent}</p>
                                </div>
                            )}

                            {/* Course tag */}
                            {modalMode === "view" && editingNote && (
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                        📚 {editingNote.courseName}
                                    </span>
                                    <span className="text-xs text-slate-600">
                                        {formatDate(editingNote.updatedAt || editingNote.createdAt)}
                                    </span>
                                </div>
                            )}

                            {modalMode === "view" ? (
                                <div className="bg-slate-800/40 border border-white/[0.06] rounded-xl p-4">
                                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                                        {editingNote?.content}
                                    </p>
                                </div>
                            ) : (
                                <textarea
                                    placeholder="Nhập nội dung ghi chú..."
                                    className="w-full bg-slate-800/40 border border-white/[0.08] text-white text-sm rounded-xl p-4 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none placeholder:text-slate-600 resize-none h-40 transition-all"
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    autoFocus
                                />
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
                            {modalMode === "view" ? (
                                <>
                                    <button
                                        onClick={() => {
                                            if (editingNote) openEditModal(editingNote);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-cyan-400 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/10 transition-all"
                                    >
                                        ✏️ Chỉnh sửa
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        className="px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                                    >
                                        Đóng
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={closeModal}
                                        className="px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-emerald-600/20"
                                    >
                                        {modalMode === "create" ? "✨ Tạo ghi chú" : "💾 Lưu thay đổi"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════ DELETE CONFIRM DIALOG ════════════ */}
            {deleteConfirmId !== null && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setDeleteConfirmId(null)}>
                    <div
                        className="bg-slate-900 border border-white/[0.08] rounded-2xl w-full max-w-sm p-6 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-2xl">
                                🗑
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Xóa ghi chú?</h3>
                                <p className="text-sm text-slate-400">
                                    Hành động này không thể hoàn tác. Ghi chú sẽ bị xóa vĩnh viễn.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="flex-1 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirmId)}
                                    className="flex-1 py-2.5 bg-red-500/90 text-white text-sm font-bold rounded-xl hover:bg-red-500 transition-colors"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesPage;
