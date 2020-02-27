import * as mongoose from 'mongoose';
import { Manufacturer } from '../manufacturers/manufacturer.model';

export const CarSchema = new mongoose.Schema({
    name: {type: String, required: true},
    year: {type: String, required: true},
    image: {type: String},
    manufacturer: {type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer'}
})

CarSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.__v;
    if(obj.manufacturer) {
        delete obj.manufacturer.__v;
    }
    return obj
};

export interface Car extends mongoose.Document{
    id: string;
    name: string;
    year: string;
    image: string;
    manufacturer: Manufacturer;
}
