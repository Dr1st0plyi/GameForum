import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  it('applies defaults and validation', () => {
    const dto = new PaginationQueryDto();
    expect(dto.page).toBe(1);
    expect(dto.pageSize).toBe(20);

    const parsed = plainToInstance(PaginationQueryDto, { page: '2', pageSize: '5' });
    expect(parsed.page).toBe(2);
    expect(parsed.pageSize).toBe(5);

    const errors = validateSync(plainToInstance(PaginationQueryDto, { page: 0 }));
    expect(errors.length).toBeGreaterThan(0);
  });
});
