import { Router } from 'express';

import CreateTransactionService from '../services/CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';
import { getCustomRepository } from 'typeorm';
import DeleteTransactionService from '../services/DeleteTransactionService';
import multer from 'multer';
import uploadconfig from '../config/upload';

 import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadconfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (req, res) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();
  return res.json({ transactions, balance });
});

transactionsRouter.post('/', async (req, res) => {
  const { title, value, type, category } = req.body;
  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });
  res.json(transaction);
});

transactionsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute(id);
  res.send();
});

transactionsRouter.post('/import', 
                        upload.single('file'), 
                        async (req, res) => {
                          const importTransaction = new ImportTransactionsService();

                          const transaction = await importTransaction.execute(req.file.path);

                          return res.json(transaction);
});

export default transactionsRouter;
