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
        <div className="app-shell">
            {/* ════════════ HEADER ════════════ */}
            <header className="site-header sticky top-0 z-50">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/home")}
                            className="flex items-center gap-2 rounded-lg px-1 py-1 text-left"
                        >
                            <span className="wordmark text-lg font-extrabold tracking-tight">
                                Cloud<span className="wordmark-accent">Exam</span>
                            </span>
                        </button>
                        <span className="text-[var(--text-muted)]" aria-hidden="true">/</span>
                        <h1 className="text-sm font-semibold text-[var(--text-secondary)]">Ghi chú</h1>
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="secondary-action flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                    >
                        ← Quay lại
                    </button>
                </div>
            </header>

            {/* ════════════ PAGE SUMMARY ════════════ */}
            <section className="border-b border-[var(--border-clr)]">
                <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="app-eyebrow text-sm font-semibold">Ghi chú cá nhân</p>
                            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                                Ghi chú của bạn
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                                Quản lý ghi chú từ các bài thi và khoá học. Tổ chức kiến thức để ôn tập hiệu quả hơn.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <div className="surface-card min-w-[100px] rounded-lg px-4 py-3 text-center">
                                <p className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{totalNotes}</p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">Ghi chú</p>
                            </div>
                            <div className="surface-card min-w-[100px] rounded-lg px-4 py-3 text-center">
                                <p className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{totalCourses}</p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">Khoá học</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════ TOOLBAR ════════════ */}
            <section className="site-header sticky top-[57px] z-40 border-b border-[var(--border-clr)]">
                <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3 lg:px-8">
                    {/* Search */}
                    <div className="relative max-w-md flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm ghi chú..."
                            className="form-input h-10 w-full rounded-lg py-2 pl-10 pr-4 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]" aria-hidden="true">🔍</span>
                    </div>

                    {/* Create button */}
                    <button
                        onClick={openCreateModal}
                        className="primary-action flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
                    >
                        <span className="text-base">+</span>
                        <span className="hidden sm:inline">Tạo ghi chú</span>
                    </button>
                </div>
            </section>

            {/* ════════════ CONTENT ════════════ */}
            <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
                {isLoading ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4">
                        <Spinner visible size="lg" />
                        <p className="text-sm text-[var(--text-muted)]">Đang tải ghi chú...</p>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-20">
                        <div className="surface-card flex h-16 w-16 items-center justify-center rounded-lg text-3xl">
                            📒
                        </div>
                        <div className="text-center">
                            <p className="mb-1 text-lg font-semibold text-[var(--text-primary)]">
                                {searchQuery ? "Không tìm thấy kết quả" : "Chưa có ghi chú nào"}
                            </p>
                            <p className="text-sm text-[var(--text-muted)]">
                                {searchQuery
                                    ? `Không có ghi chú nào phù hợp với "${searchQuery}"`
                                    : "Bắt đầu ghi chú ngay khi làm bài thi hoặc tạo ghi chú mới"}
                            </p>
                        </div>
                        {!searchQuery && (
                            <button
                                onClick={openCreateModal}
                                className="primary-action mt-2 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
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
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--primary-soft-border)] bg-[var(--primary-soft)] text-sm">
                                        📚
                                    </div>
                                    <h3 className="text-base font-bold text-[var(--text-primary)]">{courseName}</h3>
                                    <span className="status-badge rounded-full px-2.5 py-1 text-xs font-medium">
                                        {courseNotes.length} ghi chú
                                    </span>
                                </div>

                                {/* Notes grid */}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {courseNotes.map((note) => (
                                        <div
                                            key={note.id}
                                            className="surface-card group relative cursor-pointer rounded-lg p-5 transition-colors hover:bg-[var(--surface-hover)]"
                                            onClick={() => openViewModal(note)}
                                        >
                                            {/* Question reference */}
                                            {note.questionContent && (
                                                <div className="mb-3 flex items-start gap-2 border-b border-[var(--border-clr)] pb-3">
                                                    <span className="mt-0.5 flex-shrink-0 text-xs" aria-hidden="true">📝</span>
                                                    <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">
                                                        {note.questionContent}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Note content */}
                                            <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                                                {note.content}
                                            </p>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-[var(--text-muted)]">
                                                    {formatDate(note.updatedAt || note.createdAt)}
                                                </span>

                                                {/* Actions */}
                                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => openEditModal(note)}
                                                        className="icon-button flex h-7 w-7 items-center justify-center rounded-md text-xs"
                                                        title="Chỉnh sửa"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(note.id)}
                                                        className="icon-button flex h-7 w-7 items-center justify-center rounded-md text-xs hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4" onClick={closeModal}>
                    <div
                        className="surface-card w-full max-w-lg rounded-xl shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-[var(--border-clr)] px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${modalMode === "view"
                                        ? "surface-subtle"
                                        : "border border-[var(--primary-soft-border)] bg-[var(--primary-soft)]"
                                    }`}>
                                    {modalMode === "create" ? "✨" : modalMode === "edit" ? "✏️" : "📄"}
                                </div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                                    {modalMode === "create"
                                        ? "Tạo ghi chú mới"
                                        : modalMode === "edit"
                                            ? "Chỉnh sửa ghi chú"
                                            : "Chi tiết ghi chú"}
                                </h2>
                            </div>
                            <button
                                onClick={closeModal}
                                className="icon-button flex h-8 w-8 items-center justify-center rounded-md"
                                aria-label="Đóng"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="px-6 py-5">
                            {/* Question reference in view mode */}
                            {modalMode === "view" && editingNote?.questionContent && (
                                <div className="surface-subtle mb-4 rounded-lg border border-[var(--border-clr)] p-3">
                                    <p className="mb-1 text-xs font-medium text-[var(--text-muted)]">Câu hỏi liên quan</p>
                                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{editingNote.questionContent}</p>
                                </div>
                            )}

                            {/* Course tag */}
                            {modalMode === "view" && editingNote && (
                                <div className="mb-4 flex items-center gap-2">
                                    <span className="status-badge rounded-full px-3 py-1 text-xs font-medium">
                                        📚 {editingNote.courseName}
                                    </span>
                                    <span className="text-xs text-[var(--text-muted)]">
                                        {formatDate(editingNote.updatedAt || editingNote.createdAt)}
                                    </span>
                                </div>
                            )}

                            {modalMode === "view" ? (
                                <div className="surface-subtle rounded-lg border border-[var(--border-clr)] p-4">
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
                                        {editingNote?.content}
                                    </p>
                                </div>
                            ) : (
                                <textarea
                                    placeholder="Nhập nội dung ghi chú..."
                                    className="form-input h-40 w-full resize-none rounded-lg p-4 text-sm"
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    autoFocus
                                />
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-[var(--border-clr)] px-6 py-4">
                            {modalMode === "view" ? (
                                <>
                                    <button
                                        onClick={() => {
                                            if (editingNote) openEditModal(editingNote);
                                        }}
                                        className="secondary-action flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium"
                                    >
                                        ✏️ Chỉnh sửa
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        className="secondary-action rounded-lg px-5 py-2.5 text-sm font-medium"
                                    >
                                        Đóng
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={closeModal}
                                        className="secondary-action rounded-lg px-5 py-2.5 text-sm font-medium"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="primary-action flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
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
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4" onClick={() => setDeleteConfirmId(null)}>
                    <div
                        className="surface-card w-full max-w-sm rounded-xl p-6 shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-2xl">
                                🗑
                            </div>
                            <div>
                                <h3 className="mb-1 text-lg font-bold text-[var(--text-primary)]">Xóa ghi chú?</h3>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Hành động này không thể hoàn tác. Ghi chú sẽ bị xóa vĩnh viễn.
                                </p>
                            </div>
                            <div className="mt-2 flex w-full gap-3">
                                <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="secondary-action flex-1 rounded-lg py-2.5 text-sm font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirmId)}
                                    className="flex-1 rounded-lg border border-red-600 bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 dark:border-red-500 dark:bg-red-500 dark:hover:bg-red-600"
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
