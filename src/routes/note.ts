import { Router } from 'express';
import { createNote, deleteNote, getNoteById, getNotes, updateNote, toggleTodo } from '../controllers/note';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, createNote);
router.get('/', authMiddleware, getNotes);
router.get('/:id', authMiddleware, getNoteById);
router.put('/:id', authMiddleware, updateNote);
router.patch('/:id/toggle', authMiddleware, toggleTodo);
router.delete('/:id', authMiddleware, deleteNote);

export default router;
