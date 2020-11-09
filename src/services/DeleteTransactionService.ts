// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const isExistsRepository = await transactionRepository.findOne(id);

    if (!isExistsRepository) {
      throw new AppError('Transaction not found');
    }

    await transactionRepository.remove(isExistsRepository);
  }
}

export default DeleteTransactionService;
