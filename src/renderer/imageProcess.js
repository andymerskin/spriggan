import sharp from 'sharp'
import fs from 'fs-extra'
import path from 'path'
import shortid from 'shortid'
import {shell, remote} from 'electron'

const { tempDir } = remote.getGlobal('Spriggan')

function copyImagesToTemp(bucket) {
  const id = bucket.id
  const copyOps = bucket.images.map(image => {
    return new Promise((resolve, reject) => {
      const basename = path.basename(image.path).split('.')
      const ext = basename.pop()
      const uniqPath = path.join(tempDir, id, `${shortid.generate()}-${basename}.${ext}`)
      
      const imageObj = {
        name: basename.join('.').replace('.', '-'),
        path: uniqPath
      }

      fs.copy(image.path, uniqPath)
        .then(() => resolve(imageObj))
        .catch(err => reject(err))
    })
  })
  return Promise.all(copyOps)
}

function run(images) {
  const imageProcessOps = images.map(image => {
    return extendImage(image.path)
      .then(buffer => trimImage(buffer))
      .then(buffer => writeImage(image.path, buffer))
  })

  return Promise.all(imageProcessOps)
    .then(() => images)
}

function extendImage(path) {
  return new Promise((resolve, reject) => {
    sharp(path)
      .background({r: 255, g: 255, b: 255, alpha: 0})
      .extend(20)
      .toBuffer((err, buffer) => {
        if (err) { reject(err) }
        resolve(buffer)
      })
  })

}

function trimImage(buffer) {
  return new Promise((resolve, reject) => {
    sharp(buffer)
      .trim()
      .png()
      .toBuffer((err, buffer) => {
        if (err) { reject(err) }
        resolve(buffer)
      })
  })
}

function writeImage(path, buffer) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, buffer)
      .then(() => resolve())
      .catch(err => reject(err))
  })
}

export default {
  run,
  copyImagesToTemp
}