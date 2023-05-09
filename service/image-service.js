const uuid = require("uuid");
const sharp = require("sharp");
const fs = require("fs");


class ImageService {
    async saveImg(file, directory, width=200) {

        let fileName = uuid.v4() + ".webp"
        await file.mv(directory+'/'+fileName).then(async () => {
            await sharp(directory+'/'+fileName)
                .resize({
                    width: width,
                })
                .toFile(directory+'/mini/'+fileName);
        })
        return fileName
    }

    async delImg(file, directory) {
        let res = {}
        await fs.unlink(directory+'/'+file, (err) => {

            if (err) {
                res.message = "Не удалось удалить файл. " + err
            } else {
                res.message ="Файл удален."
            }

        });
        await fs.unlink(directory+'/mini/'+file, (err) => {

            if (err) {
                res.message = "Не удалось удалить файл. " + err
            } else {
                res.message ="Файл удален."
            }

        });
        return res
    }
}


module.exports = new ImageService()