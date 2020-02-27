import * as mongoose  from 'mongoose';

export const ManufacturerSchema = new mongoose.Schema({
    name: {type: String, required: true},
    country: {type: String, required: true},
    logo: {type: String}
})


export interface Manufacturer extends mongoose.Document{
    id: string;
    name: string;
    country: string;
    logo: string;
}