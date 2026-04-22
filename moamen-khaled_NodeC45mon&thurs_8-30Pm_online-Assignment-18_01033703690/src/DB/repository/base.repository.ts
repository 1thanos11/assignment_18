import { DeleteOptions, UpdateOptions } from "mongodb";
import {
  CreateOptions,
  DeleteResult,
  FlattenMaps,
  HydratedDocument,
  Model,
  PopulateOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  ReturnsNewDoc,
  Types,
  UpdateQuery,
  UpdateResult,
  UpdateWithAggregationPipeline,
} from "mongoose";

export abstract class DataBaseRepository<TRawDoc> {
  constructor(protected readonly model: Model<TRawDoc>) {}

  //method
  public async create({
    data,
  }: {
    data: Partial<TRawDoc>;
  }): Promise<HydratedDocument<TRawDoc>>;
  //overloading create
  public async create({
    data,
    options,
  }: {
    data: Partial<TRawDoc>[];
    options?: CreateOptions | undefined;
  }): Promise<HydratedDocument<TRawDoc>[]>;
  //create
  public async create({
    data,
    options,
  }: {
    data: Partial<TRawDoc>[] | Partial<TRawDoc>;
    options?: CreateOptions | undefined;
  }): Promise<HydratedDocument<TRawDoc>[] | HydratedDocument<TRawDoc>> {
    return await this.model.create(data as any, options);
  }
  //createOne
  public async createOne({
    data,
    options,
  }: {
    data: Partial<TRawDoc>;
    options?: CreateOptions | undefined;
  }): Promise<HydratedDocument<TRawDoc>> {
    const [doc] = (await this.create({ data: [data], options })) || [];
    return doc as HydratedDocument<TRawDoc>;
  }

  //**finders
  //findOne method
  public async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<TRawDoc>;
    projection?: ProjectionType<TRawDoc> | null | undefined;
    options?: (QueryOptions<TRawDoc> & { lean?: false }) | null;
  }): Promise<HydratedDocument<TRawDoc> | null>;
  //overloading 1
  public async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<TRawDoc>;
    projection?: ProjectionType<TRawDoc> | null | undefined;
    options: QueryOptions<TRawDoc> & { lean: true };
  }): Promise<FlattenMaps<TRawDoc> | null>;
  //implementation
  public async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<TRawDoc>;
    projection?: ProjectionType<TRawDoc> | null | undefined;
    options?: QueryOptions<TRawDoc> | null;
  }): Promise<HydratedDocument<TRawDoc> | FlattenMaps<TRawDoc> | null> {
    const query = this.model.findOne(filter, projection);
    if (options?.populate) {
      query.populate(options.populate as PopulateOptions[]);
    }
    if (options?.lean) query.lean(options.lean);

    return await query.exec();
  }

  //findById
  public async findById({
    _id,
    projection,
    options,
  }: {
    _id?: Types.ObjectId;
    projection?: ProjectionType<TRawDoc> | null | undefined;
    options?: (QueryOptions<TRawDoc> & { lean: false }) | null;
  }): Promise<FlattenMaps<TRawDoc> | null>;

  public async findById({
    _id,
    projection,
    options,
  }: {
    _id?: Types.ObjectId;
    projection?: ProjectionType<TRawDoc> | null | undefined;
    options?: (QueryOptions<TRawDoc> & { lean: true }) | null;
  }): Promise<HydratedDocument<TRawDoc> | null>;

  public async findById({
    _id,
    projection,
    options,
  }: {
    _id?: Types.ObjectId;
    projection?: ProjectionType<TRawDoc> | null | undefined;
    options?: QueryOptions<TRawDoc> | null;
  }): Promise<HydratedDocument<TRawDoc> | FlattenMaps<TRawDoc> | null> {
    const query = this.model.findById(_id, projection);
    if (options?.populate) {
      query.populate(options.populate as PopulateOptions[]);
    }
    if (options?.lean) query.lean(options.lean);
    return await query.exec();
  }

  //**updates
  //updateOne
  public async updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TRawDoc>;
    update: UpdateQuery<TRawDoc> | UpdateWithAggregationPipeline;
    options?: UpdateOptions | null;
  }): Promise<UpdateResult> {
    return await this.model.updateOne(filter, update, options);
  }
  //updateMany
  public async updateMany({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TRawDoc>;
    update: UpdateQuery<TRawDoc> | UpdateWithAggregationPipeline;
    options?: UpdateOptions | null;
  }): Promise<UpdateResult> {
    return await this.model.updateMany(filter, update, options);
  }

  //**findersAnd
  //findOneAndUpdate
  public async findOneAndUpdate({
    filter,
    update,
    options = { returnDocument: "after" },
  }: {
    filter: QueryFilter<TRawDoc>;
    update: UpdateQuery<TRawDoc>;
    options?: QueryOptions<TRawDoc> & ReturnsNewDoc;
  }): Promise<HydratedDocument<TRawDoc> | null> {
    return this.model.findOneAndUpdate(filter, update, options);
  }
  //findOneAndDelete
  public async findOneAndDelete({
    filter,
  }: {
    filter: QueryFilter<TRawDoc>;
  }): Promise<HydratedDocument<TRawDoc> | null> {
    return this.model.findOneAndDelete(filter);
  }
  //findByIdAndUpdate
  public async findByIdAndUpdate({
    _id,
    update,
    options = { returnDocument: "after" },
  }: {
    _id: Types.ObjectId;
    update: UpdateQuery<TRawDoc>;
    options?: QueryOptions<TRawDoc> & ReturnsNewDoc;
  }): Promise<HydratedDocument<TRawDoc> | null> {
    return this.model.findByIdAndUpdate(_id, update, options);
  }
  //findByIdAndDelete
  public async findByIdAndDelete({
    _id,
  }: {
    _id: Types.ObjectId;
  }): Promise<HydratedDocument<TRawDoc> | null> {
    return this.model.findByIdAndDelete(_id);
  }

  //** deletes
  //deleteOne
  public async deleteOne({
    filter,
    options,
  }: {
    filter?: QueryFilter<TRawDoc>;
    options?: DeleteOptions | null;
  }): Promise<DeleteResult> {
    return await this.model.deleteOne(filter, options);
  }
  //deleteMany
  public async deleteMany({
    filter,
    options,
  }: {
    filter?: QueryFilter<TRawDoc>;
    options?: DeleteOptions | null;
  }): Promise<DeleteResult> {
    return await this.model.deleteMany(filter, options);
  }
}
