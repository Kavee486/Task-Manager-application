import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { createValidationPipe } from '../src/common/validation.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const titles = (body: { title: string }[]) => body.map((t) => t.title);

describe('Tasks API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const http = () => request(app.getHttpServer());
  const createTask = async (body: Record<string, unknown>) =>
    (await http().post('/tasks').send(body).expect(201)).body;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(createValidationPipe());
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.task.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /tasks', () => {
    it('creates a task with defaults and trims the title', async () => {
      const res = await http()
        .post('/tasks')
        .send({ title: '  Buy milk  ' })
        .expect(201);

      expect(res.body).toMatchObject({
        title: 'Buy milk',
        description: null,
        status: 'TODO',
        dueDate: null,
      });
      expect(res.body.id).toEqual(expect.any(Number));
      expect(res.body.createdAt).toEqual(expect.any(String));
    });

    it('stores every provided field', async () => {
      const res = await http()
        .post('/tasks')
        .send({
          title: 'Ship it',
          description: 'Before Friday',
          status: 'IN_PROGRESS',
          dueDate: '2026-12-01',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        description: 'Before Friday',
        status: 'IN_PROGRESS',
        dueDate: '2026-12-01T00:00:00.000Z',
      });
    });

    it.each([
      ['missing title', {}],
      ['blank title', { title: '   ' }],
      ['title too long', { title: 'x'.repeat(121) }],
      ['invalid status', { title: 'x', status: 'NOPE' }],
      ['invalid due date', { title: 'x', dueDate: 'tomorrow' }],
      ['unknown property', { title: 'x', priority: 1 }],
    ])('returns 400 for %s', async (_name, body) => {
      const res = await http().post('/tasks').send(body).expect(400);
      expect(res.body.statusCode).toBe(400);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('GET /tasks', () => {
    it('returns an empty list when there are no tasks', async () => {
      const res = await http().get('/tasks').expect(200);
      expect(res.body).toEqual([]);
    });

    it('filters by status', async () => {
      await createTask({ title: 'a', status: 'TODO' });
      await createTask({ title: 'b', status: 'DONE' });

      const res = await http().get('/tasks?status=DONE').expect(200);

      expect(titles(res.body)).toEqual(['b']);
    });

    it('sorts by due date, putting tasks without one last', async () => {
      await createTask({ title: 'none' });
      await createTask({ title: 'late', dueDate: '2026-12-31' });
      await createTask({ title: 'soon', dueDate: '2026-11-01' });

      const asc = await http().get('/tasks?sort=dueDate').expect(200);
      expect(titles(asc.body)).toEqual(['soon', 'late', 'none']);

      const desc = await http()
        .get('/tasks?sort=dueDate&order=desc')
        .expect(200);
      expect(titles(desc.body)).toEqual(['late', 'soon', 'none']);
    });

    it('returns 400 for an invalid filter or sort value', async () => {
      await http().get('/tasks?status=BAD').expect(400);
      await http().get('/tasks?sort=title').expect(400);
      await http().get('/tasks?order=sideways').expect(400);
    });
  });

  describe('GET /tasks/:id', () => {
    it('returns the task', async () => {
      const created = await createTask({ title: 'find me' });
      const res = await http().get(`/tasks/${created.id}`).expect(200);
      expect(res.body).toEqual(created);
    });

    it('returns 404 when the task does not exist', async () => {
      const res = await http().get('/tasks/999999').expect(404);
      expect(res.body.message).toContain('999999');
    });

    it('returns 400 for a non-numeric id', async () => {
      await http().get('/tasks/abc').expect(400);
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('updates only the provided fields', async () => {
      const created = await createTask({
        title: 'draft',
        description: 'keep me',
      });

      const res = await http()
        .patch(`/tasks/${created.id}`)
        .send({ status: 'DONE' })
        .expect(200);

      expect(res.body).toMatchObject({
        title: 'draft',
        description: 'keep me',
        status: 'DONE',
      });
    });

    it('clears the due date and description when null is sent', async () => {
      const created = await createTask({
        title: 'x',
        description: 'y',
        dueDate: '2026-12-01',
      });

      const res = await http()
        .patch(`/tasks/${created.id}`)
        .send({ description: null, dueDate: null })
        .expect(200);

      expect(res.body).toMatchObject({ description: null, dueDate: null });
    });

    it('returns 400 for invalid input and leaves the task unchanged', async () => {
      const created = await createTask({ title: 'stable' });

      await http().patch(`/tasks/${created.id}`).send({ title: '' }).expect(400);

      const res = await http().get(`/tasks/${created.id}`).expect(200);
      expect(res.body.title).toBe('stable');
    });

    it('returns 404 when the task does not exist', async () => {
      await http().patch('/tasks/999999').send({ title: 'x' }).expect(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('deletes the task and returns 204', async () => {
      const created = await createTask({ title: 'bye' });

      await http().delete(`/tasks/${created.id}`).expect(204);
      await http().get(`/tasks/${created.id}`).expect(404);
    });

    it('returns 404 when the task does not exist', async () => {
      await http().delete('/tasks/999999').expect(404);
    });
  });
});
