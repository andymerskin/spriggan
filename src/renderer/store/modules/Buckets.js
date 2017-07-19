import _ from 'lodash'
import shortid from 'shortid'
import path from 'path'
import fs from 'fs'
import spritesmith from 'spritesmith'
import readChunk from 'read-chunk'
import imageType from 'image-type'
import naturalSort from 'javascript-natural-sort'
import {remote} from 'electron'
import globby from 'globby'
const {dialog} = remote

import imageProcess from '@/imageProcess'
import sprite from '@/sprite'
import {minify} from '@/minify'

const state = {
  buckets: [],
  outputFolder: null,
  isChoosingOutputFolder: false,
}

const getters = {
  untitledBuckets(state) {
    return state.buckets.filter(bucket => bucket.name === '')
  },

  bucketsHaveAnyImages(state) {
    let count = 0

    if (state.buckets.length) {
      count = state.buckets.reduce((c, bucket) => {
        return c + bucket.images.length
      }, 0)
    }

    return count > 0
  }
}

const mutations = {
  addBucket(state, bucket) {    
    state.buckets.push(bucket)
  },

  removeBucket(state, id) {
    state.buckets = state.buckets.filter(bucket => {
      return bucket.id !== id
    })
  },

  pushImages(state, payload) {
    let bucket = state.buckets.find(b => b.id === payload.id)
    const validImages = payload.images.filter(image => {
      return validateFileType(image.path)
    })
    bucket.images = [ ...bucket.images, ...validImages ]
    bucket.images = _(bucket.images).uniqBy(file => file.path)
      .sort(naturalSort)
      .value()
      console.log(bucket.images);
  },

  removeImage(state, payload) {
    let bucket = state.buckets.find(b => b.id === payload.bucket.id)
    bucket.images = bucket.images.filter(image => image !== payload.image)
  },

  setBucketName(state, payload) {
    let bucket = state.buckets.find(b => b.id === payload.bucket.id)
    bucket.name = payload.name
  },

  setOutputFolder(state, filePaths) {
    if (filePaths) {
      state.outputFolder = filePaths[0]
    }
  },

  setIsChoosingOutputFolder(state, value) {
    state.isChoosingOutputFolder = value
  },

  setBucketStatus(state, payload) {
    let bucket = state.buckets.find(b => b.id === payload.bucket.id)
    bucket.status = payload.status
  },

  setBucketGenerating(state, payload) {
    let bucket = state.buckets.find(b => b.id === payload.bucket.id)
    bucket.isGenerating = payload.value
  }
}

const actions = {
  persistBuckets({state}) {
    // COMING SOON
    // 
    // Ability to save state into Nedb for quick referencing later
  },

  addBucket({commit}, payload = {}) {
    const {name, images} = payload
    const bucket = {
      name: name || '',
      id: shortid.generate(),
      images: [],
      status: false,
      isGenerating: false
    }
    commit('addBucket', bucket)
    return Promise.resolve(bucket)
  },

  addFolder({state, commit, dispatch}, folder) {
    // const folderPath = `${folder.path}/*.{png, jpg, jpeg, gif}`
    const folderPath = folder.path + '/**/*.png'

    const files = globby(folderPath)
      .then(paths => {
        let groupedFiles = _.groupBy(paths, p => path.basename(path.dirname(p)))
        Object.keys(groupedFiles).forEach(dir => {
          dispatch('addBucket', {
            name: dir
          }).then(bucket => {
            commit('pushImages', {
              id: bucket.id,
              images: groupedFiles[dir].map(file => ({
                name: path.basename(file),
                path: file
              }))
            })
          })
        })
      })
  },

  generateSprite({state, dispatch, getters}, bucket) {
    console.log(`[Spriggan] generateSprite for: "${bucket.name}"`);

    if (!bucket.images.length) {
      console.error(`"${bucket.name}" has no images`)
      return
    }

    const _bucket = {...bucket}

    if (bucket.name === '') {
      const index = getters.untitledBuckets.findIndex(b => b.id === bucket.id)
      _bucket.name = `Untitled Bucket ${index+1}`
    }

    return dispatch('processSprite', _bucket)
  },

  generateAll({state, dispatch}) {
    state.buckets.forEach(bucket => {
      dispatch('generateSprite', bucket)
    })
  },

  processSprite: ({state, commit}, bucket) => {
    const {outputFolder} = state

    commit('setBucketGenerating', { value: true, bucket })
    commit('setBucketStatus', { status: 'Preparing images', bucket })

    return imageProcess.copyImagesToTemp(bucket)
      .then(images => imageProcess.run(images))
      .then(images => sprite.generate({images, bucket, outputFolder}))
      .then(() => {
        commit('setBucketStatus', { status: 'Minifying', bucket })
        return minify({bucket, outputFolder})
      })
      .then(() => {
        commit('setBucketStatus', { status: false, bucket })
        commit('setBucketGenerating', { value: false, bucket })
      })
      .catch(err => console.trace(err))
  },

  chooseOutputFolder({state, commit}) {
    return new Promise((resolve, reject)=> {
      if (!state.isChoosingOutputFolder) {
        commit('setIsChoosingOutputFolder', true)
        dialog.showOpenDialog({
          title: 'Choose an output folder',
          properties: ['openDirectory', 'createDirectory']
        }, filePaths => {
          commit('setIsChoosingOutputFolder', false)          
          if (filePaths) {
            commit('setOutputFolder', filePaths)
            resolve()
          } else {
            reject()
          }
        })
      }
    })
  }
}

function validateFileType(path) {
  const buffer = readChunk.sync(path, 0, 12)
  const type = imageType(buffer)
  if (!type) {
    return false
  }
  return ['image/png', 'image/jpeg', 'image/gif'].includes(type.mime)
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}