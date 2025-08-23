"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.toggleTodo = exports.updateNote = exports.getNoteById = exports.getNotes = exports.createNote = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Note_1 = __importDefault(require("../models/Note"));
exports.createNote = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, category, priority, date } = req.body;
    const userId = req.user._id;
    if (!title || title.trim() === '') {
        res.status(400).json({ message: 'Todo title is required' });
        return;
    }
    const note = await Note_1.default.create({
        title: title.trim(),
        category: category || 'personal',
        priority: priority || 'medium',
        date: date || new Date().toISOString().split('T')[0],
        user: userId
    });
    res.status(201).json({
        message: 'Todo created successfully',
        status: 201,
        note: {
            _id: note._id,
            title: note.title,
            completed: note.completed,
            category: note.category,
            priority: note.priority,
            date: note.date,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
        }
    });
});
exports.getNotes = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.user._id;
    const { category, search } = req.query;
    let query = { user: userId };
    if (category && category !== 'all') {
        query = { ...query, category: category };
    }
    if (search && search.toString().trim() !== '') {
        query = {
            ...query,
            title: { $regex: search.toString(), $options: 'i' }
        };
    }
    const notes = await Note_1.default.find(query).sort({ createdAt: -1 });
    res.status(200).json({
        message: 'Todos retrieved successfully',
        status: 200,
        count: notes.length,
        notes
    });
});
exports.getNoteById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const note = await Note_1.default.findOne({ _id: id, user: userId });
    if (!note) {
        res.status(404).json({ message: 'Todo not found' });
        return;
    }
    res.status(200).json({
        message: 'Todo retrieved successfully',
        status: 200,
        note
    });
});
exports.updateNote = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { title, completed, category, priority, date } = req.body;
    const userId = req.user._id;
    const note = await Note_1.default.findOne({ _id: id, user: userId });
    if (!note) {
        res.status(404).json({ message: 'Todo not found' });
        return;
    }
    if (title !== undefined) {
        if (!title || title.trim() === '') {
            res.status(400).json({ message: 'Todo title is required' });
            return;
        }
        note.title = title.trim();
    }
    if (completed !== undefined) {
        note.completed = completed;
    }
    if (category !== undefined) {
        note.category = category;
    }
    if (priority !== undefined) {
        note.priority = priority;
    }
    if (date !== undefined) {
        note.date = date;
    }
    await note.save();
    res.status(200).json({
        message: 'Todo updated successfully',
        status: 200,
        note: {
            _id: note._id,
            title: note.title,
            completed: note.completed,
            category: note.category,
            priority: note.priority,
            date: note.date,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
        }
    });
});
exports.toggleTodo = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const note = await Note_1.default.findOne({ _id: id, user: userId });
    if (!note) {
        res.status(404).json({ message: 'Todo not found' });
        return;
    }
    note.completed = !note.completed;
    await note.save();
    res.status(200).json({
        message: 'Todo toggled successfully',
        status: 200,
        note: {
            _id: note._id,
            title: note.title,
            completed: note.completed,
            category: note.category,
            priority: note.priority,
            date: note.date,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
        }
    });
});
exports.deleteNote = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const note = await Note_1.default.findOne({ _id: id, user: userId });
    if (!note) {
        res.status(404).json({ message: 'Todo not found' });
        return;
    }
    await Note_1.default.findByIdAndDelete(id);
    res.status(200).json({
        message: 'Todo deleted successfully',
        status: 200
    });
});
