import Transaction from '../models/Transaction';
import Category from '../models/Category';
import csvParse from 'csv-parse';
import fs from 'fs';
import { In, getRepository } from 'typeorm';

interface CsvTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(path: string): Promise<void> {
    const contactReadStream = fs.createReadStream(path);

    const parse = csvParse({
      from_line: 2,
    });

    const transactions: CsvTransaction[] = [];
    const categories: string[] = [];

    const parseCsv = contactReadStream.pipe(parse);
    parseCsv.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) {
        return;
      }

      categories.push(category);

      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCsv.on('end', resolve));

    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    const isCategories = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    const isCategoryTitle = isCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitle = categories
      .filter(category => !isCategoryTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      addCategoryTitle.map(title => ({
        title,
      })),
    );

    await categoryRepository.save(newCategories);
    //console.log(transactions);
    //console.log(addCategoryTitle);

    const finalCategories = [...newCategories, ...isCategories];

    const createTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(category => category.title === transaction.category),
      })),
    );

    await transactionRepository.save(createTransactions);

    await fs.promises.unlink(path);
  }
}

export default ImportTransactionsService;
