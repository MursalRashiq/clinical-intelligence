import { Document, Model, Types, ClientSession, UpdateQuery } from 'mongoose';
import { IBaseRepository } from './interface/IBase.repository';

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(
    item: Partial<T>,
    session?: ClientSession | undefined,
  ): Promise<T> {
    const doc = new this.model(item);
    return await doc.save({ session: session || null });
  }

  async findById(
    id: string | Types.ObjectId,
    session?: ClientSession | undefined,
  ): Promise<T | null> {
    return this.model
      .findById(id)
      .session(session || null)
      .exec();
  }

  async updateById(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>,
    session?: ClientSession | undefined,
  ): Promise<T | null> {
    return await this.model
      .findByIdAndUpdate(id, update, { new: true, session: session || null })
      .exec();
  }

  async findOneByField(
    fieldName: string,
    value: unknown,
    session?: ClientSession | undefined,
  ): Promise<T | null> {
    const query: Record<string, unknown> = {};
    query[fieldName] = value;
    return await this.model
      .findOne(query)
      .session(session || null)
      .exec();
  }

  async findOne(
    filter: Record<string, unknown>,
    session?: ClientSession | undefined,
  ): Promise<T | null> {
    return await this.model
      .findOne(filter)
      .session(session || null)
      .exec();
  }

  async find(
    filter: Record<string, unknown>,
    session?: ClientSession | undefined,
  ): Promise<T[]> {
    return await this.model
      .find(filter)
      .session(session || null)
      .exec();
  }
}
