import { NotFoundException } from "@nestjs/common";
const fs = require('fs');
const path = require('path')

export async function getModelByIdWithImageDeleted (id: string, imageOrLogo: string, model, updatedData, res) {
    const found = await model.findById(id).exec();
    const fileDir = path.join(__dirname, '../..')
    const fpath = `${fileDir}/${imageOrLogo}`

    if(!found) {
        throw new NotFoundException(`${model.modelName} with ID "${id}" not found`);
    }

    if(found) {
        
        if(found.image === imageOrLogo || found.logo === imageOrLogo) {
            try {
                fs.unlinkSync(fpath)
                if(updatedData) {
                    res.send(updatedData)
                } else {
                    res.send(null)
                }
                console.log('successfully Deleted Image')
            } catch(error) {
                console.log('No Image Found')
                if(updatedData) {
                    res.send(updatedData)
                } else {
                    res.send(null)
                }
            }
        }
        else {
            throw new NotFoundException(`${model.modelName} with ID "${id}" has no picture "${imageOrLogo}"`);
        }
    }
}
