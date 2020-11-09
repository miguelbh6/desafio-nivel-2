// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import { getRepository, getCustomRepository } from 'typeorm';
import Category from '../models/Category';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError('you do not have enough balance');
    }

    let isExistsCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!isExistsCategory) {
      isExistsCategory = categoryRepository.create({ title: category });

      await categoryRepository.save(isExistsCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: isExistsCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
