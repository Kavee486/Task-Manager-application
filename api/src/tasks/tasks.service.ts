import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import {
  QueryTasksDto,
  SortOrder,
  TaskSortField,
} from './dto/query-tasks.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll({ status, sort, order }: QueryTasksDto) {
    return this.prisma.task.findMany({
      where: status ? { status } : undefined,
      orderBy: this.buildOrderBy(sort, order),
    });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  create(dto: CreateTaskDto) {
    return this.prisma.task.create({ data: this.toData(dto) });
  }

  async update(id: number, dto: UpdateTaskDto) {
    await this.findOne(id); // 404 if it does not exist
    return this.prisma.task.update({ where: { id }, data: this.toData(dto) });
  }

  async remove(id: number) {
    await this.findOne(id); // 404 if it does not exist
    await this.prisma.task.delete({ where: { id } });
  }

  /** Converts the DTO's ISO date string to a Date; null clears the value. */
  private toData<T extends UpdateTaskDto>(dto: T): Omit<T, 'dueDate'> & {
    dueDate?: Date | null;
  } {
    const { dueDate, ...rest } = dto;
    return {
      ...rest,
      ...(dueDate !== undefined && {
        dueDate: dueDate === null ? null : new Date(dueDate),
      }),
    };
  }

  private buildOrderBy(
    sort: TaskSortField = TaskSortField.CREATED_AT,
    order?: SortOrder,
  ): Prisma.TaskOrderByWithRelationInput[] {
    if (sort === TaskSortField.DUE_DATE) {
      // Tasks without a due date always go last.
      return [
        { dueDate: { sort: order ?? SortOrder.ASC, nulls: 'last' } },
        { createdAt: 'desc' },
      ];
    }
    return [{ createdAt: order ?? SortOrder.DESC }];
  }
}
