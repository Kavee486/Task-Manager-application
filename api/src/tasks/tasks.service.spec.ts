import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TaskStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SortOrder, TaskSortField } from './dto/query-tasks.dto.js';
import { TasksService } from './tasks.service.js';

const task = {
  id: 1,
  title: 'Write tests',
  description: null,
  status: TaskStatus.TODO,
  dueDate: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

describe('TasksService', () => {
  let service: TasksService;
  const prisma = {
    task: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(TasksService);
  });

  describe('findAll', () => {
    it('lists newest first by default, without a status filter', async () => {
      prisma.task.findMany.mockResolvedValue([task]);

      await expect(service.findAll({})).resolves.toEqual([task]);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: [{ createdAt: 'desc' }],
      });
    });

    it('filters by status', async () => {
      prisma.task.findMany.mockResolvedValue([]);

      await service.findAll({ status: TaskStatus.DONE });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: TaskStatus.DONE } }),
      );
    });

    it('sorts by due date with empty due dates last', async () => {
      prisma.task.findMany.mockResolvedValue([]);

      await service.findAll({
        sort: TaskSortField.DUE_DATE,
        order: SortOrder.DESC,
      });

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { dueDate: { sort: 'desc', nulls: 'last' } },
            { createdAt: 'desc' },
          ],
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the task', async () => {
      prisma.task.findUnique.mockResolvedValue(task);
      await expect(service.findOne(1)).resolves.toEqual(task);
    });

    it('throws NotFoundException when the task does not exist', async () => {
      prisma.task.findUnique.mockResolvedValue(null);
      await expect(service.findOne(42)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('converts the due date string to a Date', async () => {
      prisma.task.create.mockResolvedValue(task);

      await service.create({ title: 'A', dueDate: '2026-12-01' });

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: { title: 'A', dueDate: new Date('2026-12-01') },
      });
    });

    it('does not set dueDate when none is given', async () => {
      prisma.task.create.mockResolvedValue(task);

      await service.create({ title: 'A' });

      expect(prisma.task.create).toHaveBeenCalledWith({ data: { title: 'A' } });
    });
  });

  describe('update', () => {
    it('clears the due date when null is sent', async () => {
      prisma.task.findUnique.mockResolvedValue(task);
      prisma.task.update.mockResolvedValue(task);

      await service.update(1, { dueDate: null });

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { dueDate: null },
      });
    });

    it('throws NotFoundException and does not update a missing task', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.update(9, { title: 'x' })).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.task.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes an existing task', async () => {
      prisma.task.findUnique.mockResolvedValue(task);

      await service.remove(1);

      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('throws NotFoundException for a missing task', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.remove(9)).rejects.toThrow(NotFoundException);
      expect(prisma.task.delete).not.toHaveBeenCalled();
    });
  });
});
