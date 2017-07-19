<template>
  <div class="landingPage">
    <div class="titlebar-wrap">
      <div class="titlebar">
        <span>Spriggan</span>

        <span class="material-icons add-bucket button button--small"
          @click="addBucket">add</span>
      </div>
    </div>
  
    <div class="content-wrap"
      ref="contentWrap">
      
      <transition name="content" mode="out-in">
        <!-- Buckets -->
        <transition-group
          tag="div"
          class="buckets"
          name="bucket"
          @before-leave="bucketBeforeLeave"
          v-if="buckets.length">
          <bucket
            v-for="(bucket, index) in buckets"
            :key="bucket.id"
            :self="bucket"
            :index="index"
            @remove="removeBucket(bucket.id)">
            </bucket>
        </transition-group>

        <!-- Empty State -->
        <div class="buckets-empty"
          v-else>
          <img class="logo" src="~@/assets/knot2.svg">
          <div class="mt4">Get started by dropping images, or</div>
          <div class="button mt3"
            @click="addBucket">Create a Bucket</div>
        </div>
      </transition>
    </div>
    
    <div class="footer-wrap">
      <div class="footer-bar footer-bar-start ph3 w-80">
        <span class="fw7">Output to</span>
        <a href="#" class="output-choose button button--small mh2"
          @click="chooseOutputFolder">
            <span class="material-icons" v-if="!outputFolder">more_horiz</span>
            <span class="output-path fw4" :title="outputFolder" v-else>{{fOutputFolder}}</span>
          </a>
      </div>
      <div class="footer-bar footer-bar-end ph2 w-20">
        <a class="button" @click="beforeGenerateAll"
          :class="{ 'button--disabled': !bucketsHaveAnyImages }">Generate All</a>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState, mapGetters, mapMutations, mapActions} from 'vuex'
import path from 'path'
import fs from 'fs-extra'
import Bucket from './Bucket.vue'

export default {
  name: 'landing-page',

  data() {
    return {
      isChoosingOutputFolder: false,
      outputTooltip: {
        content: 'Choose a folder!',
        placement: 'top-center',
        trigger: 'manual'
      },
      addBucketStyle: {
        transitionDuration: '0.6s'
      }
    }
  },

  components: {
    Bucket
  },

  computed: {
    ...mapState('Buckets', ['buckets', 'outputFolder']),
    ...mapGetters('Buckets', ['bucketsHaveAnyImages']),

    fOutputFolder() {
      if (this.outputFolder) {
        return this.outputFolder.split(path.sep).pop()        
      } else {
        return null
      }
    }
  },

  methods: {
    ...mapMutations('Buckets', ['removeBucket', 'setOutputFolder', 'pushImages']),
    ...mapActions('Buckets', ['addBucket', 'chooseOutputFolder', 'addFolder', 'generateAll']),

    bucketBeforeLeave(el) {
      const style = window.getComputedStyle(el)
      const {scrollLeft} = this.$refs.contentWrap
      console.log(scrollLeft);
      el.style.left = `${el.offsetLeft - parseFloat(style.marginLeft, 10) - scrollLeft}px`
      el.style.top = `${el.offsetTop - parseFloat(style.marginTop, 10)}px`
      el.style.height = style.height
    },

    beforeGenerateAll() {
      if (!this.bucketsHaveAnyImages) {
        return
      }

      if (!this.outputFolder) {
        this.chooseOutputFolder()
          .then(() => this.generateAll())
        return
      }
      this.generateAll()
    },

    onDrop(e) {
      e.preventDefault()

      let {files} = e.dataTransfer
      files = [...files]
      const fileList = files.filter(file => fs.statSync(file.path).isFile())
      const dirList = files.filter(file => fs.statSync(file.path).isDirectory())
      dirList.forEach(folder => this.addFolder(folder))
      
      if (fileList.length) {
        this.addBucket()
          .then(bucket => {
            this.pushImages({
              id: bucket.id,
              images: fileList.map(file => ({
                name: path.basename(file.path),
                path: file.path
              }))
            })
          })
      }
    }
  },

  mounted() {
    document.addEventListener('drop', this.onDrop)
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto:400,500,700');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import '~tachyons-sass/tachyons.scss';
@import '~@/scss/variables';
@import '~@/scss/forms';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

ul, li {
  margin: 0;
  padding: 0;
  list-style: none;
}

html, body {
  font-size: 14px;
  overflow: hidden;
}

body {
  @extend .sans-serif;
  font-weight: 500;
  color: rgba(#fff, 0.85);
  background-color: rgba(#000, 0.6);
  -webkit-font-smoothing: antialiased;
}

.titlebar-wrap {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 36px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

.titlebar {
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
  height: 36px;
  line-height: 36px;
  -webkit-app-region: drag;
  -webkit-user-select: none;

  .button {
    -webkit-app-region: no-drag;
  }
}

.content-wrap {
  width: 100vw;
  height: 100vh;
  overflow-x: scroll;
}

.footer-wrap {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 48px;
  display: flex;
  background-color: rgba(#fff, 0.05);
}

.footer-bar {
  display: flex;
  align-items: center;
  height: 48px;

  &-start {
    justify-content: flex-start;    
  }

  &-end {
    justify-content: flex-end;
  }
}

.buckets-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  .logo {
    display: block;
    opacity: 1;
  }
}

.buckets {
  @extend .pa2;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  margin: 36px 0 0;
  width: 100%;
  height: calc(100vh - 36px - 48px);
}

.add-bucket {
  @extend .ma2;
  position: absolute;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  cursor: pointer;
}

.output-path {
  white-space: nowrap;
  overflow: hidden;
}

.output-choose {
  .material-icons {
    font-size: 18px;    
  }
}

// Transitions

.bucket-enter-active {
  transition: 0.3s $easeOutCubic !important;
}

.bucket-leave-active {
  transition: 0.15s $easeOutCubic !important;
  position: absolute;
}

.bucket-enter {
  opacity: 0;
  transform: translateX(-10px);
}

.bucket-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.bucket-move {
  transition: transform 0.6s $easeInOutCubic;
}

.content-enter-active {
  transition: 0.3s $easeOutCubic;
}

.content-leave-active {
  transition: 0.15s $easeOutCubic;
}

.content-enter {
  opacity: 0;
  transform: translateY(-10px);
}

.content-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
