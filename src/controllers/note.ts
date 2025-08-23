import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Note from '../models/Note';

export const createNote = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title, category, priority, date } = req.body;
  const userId = req.user._id;

  if (!title || title.trim() === '') {
    res.status(400).json({ message: 'Todo title is required' });
    return;
  }

  const note = await Note.create({
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

export const getNotes = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user._id;
  const { category, search } = req.query;

  let query: any = { user: userId };
  
  if (category && category !== 'all') {
    query = { ...query, category: category as string };
  }

  if (search && search.toString().trim() !== '') {
    query = { 
      ...query, 
      title: { $regex: search.toString(), $options: 'i' }
    };
  }

  const notes = await Note.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    message: 'Todos retrieved successfully',
    status: 200,
    count: notes.length,
    notes
  });
});

export const getNoteById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: id, user: userId });

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

export const updateNote = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, completed, category, priority, date } = req.body;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: id, user: userId });

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

export const toggleTodo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: id, user: userId });

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

export const deleteNote = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: id, user: userId });

  if (!note) {
    res.status(404).json({ message: 'Todo not found' });
    return;
  }

  await Note.findByIdAndDelete(id);

  res.status(200).json({
    message: 'Todo deleted successfully',
    status: 200
  });
});
