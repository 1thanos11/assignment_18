"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBaseRepository = void 0;
class DataBaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async createOne({ data, options, }) {
        const [doc] = (await this.create({ data: [data], options })) || [];
        return doc;
    }
    async findOne({ filter, projection, options, }) {
        const query = this.model.findOne(filter, projection);
        if (options?.populate) {
            query.populate(options.populate);
        }
        if (options?.lean)
            query.lean(options.lean);
        return await query.exec();
    }
    async findById({ _id, projection, options, }) {
        const query = this.model.findById(_id, projection);
        if (options?.populate) {
            query.populate(options.populate);
        }
        if (options?.lean)
            query.lean(options.lean);
        return await query.exec();
    }
    async updateOne({ filter, update, options, }) {
        return await this.model.updateOne(filter, update, options);
    }
    async updateMany({ filter, update, options, }) {
        return await this.model.updateMany(filter, update, options);
    }
    async findOneAndUpdate({ filter, update, options = { returnDocument: "after" }, }) {
        return this.model.findOneAndUpdate(filter, update, options);
    }
    async findOneAndDelete({ filter, }) {
        return this.model.findOneAndDelete(filter);
    }
    async findByIdAndUpdate({ _id, update, options = { returnDocument: "after" }, }) {
        return this.model.findByIdAndUpdate(_id, update, options);
    }
    async findByIdAndDelete({ _id, }) {
        return this.model.findByIdAndDelete(_id);
    }
    async deleteOne({ filter, options, }) {
        return await this.model.deleteOne(filter, options);
    }
    async deleteMany({ filter, options, }) {
        return await this.model.deleteMany(filter, options);
    }
}
exports.DataBaseRepository = DataBaseRepository;
