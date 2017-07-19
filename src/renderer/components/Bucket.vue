<template>
  <div class="bucket pa1 br2" :class="{ isDragging }"
    @dragover="onDragover"
    @dragleave="onDragleave"
    @drop.stop="onDrop">
    <div class="bucket-title">
      <input class="bucket-title-input input-reset ba br2 ph2 mr2 w-100 h2"
        type="text"
        :placeholder="`Untitled Bucket ${untitledIndex+1}`"
        :value="self.name"
        tabindex="0"
        ref="bucketTitle"
        @focus="bucketTitleFocus"
        @input="updateBucketName($event.target.value)">
      <span class="bucket-delete material-icons" tabindex="1"
        @click="$emit('remove', self.id)">close</span>
    </div>

    <div class="bucket-body">
      <div class="bucket-empty pa3 tc lh-copy" v-show="!self.images.length">
        <transition
          @before-enter="bucketEmptyImageBeforeEnter"
          @enter="bucketEmptyImageEnter"
          appear>
          <div class="bucket-empty-image"></div>
        </transition>
        Start by dragging images<br>into the bucket
      </div>

      <div class="bucket-images mt2" v-show="self.images.length">
        <ul class="bucket-images-list list">
          <li class="bucket-image-item la-title ph2 pv1 br2"
            v-for="image in self.images">
            {{image.name}}
            <span class="bucket-image-remove material-icons"
              @click="removeImage({bucket: self, image})">clear</span>
          </li>
        </ul>
      </div>

      <div class="bucket-controls" v-if="self.images.length">
        <div class="button button--small"
          :class="{ 'button--disabled': self.isGenerating }"
          @click="beforeGenerateSprite">
            <transition name="fade" mode="out-in">
              <span class="bucket-status"
                v-if="self.isGenerating">
                <img class="spinner"
                  src="~@/assets/spinner.svg">
                <span>{{self.status}}</span>
              </span>
              <span v-else>Generate Sprite</span>
            </transition>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import path from 'path'
import {TweenMax, Elastic} from 'gsap'
import {mapState, mapGetters, mapMutations, mapActions} from 'vuex'

export default {
  props: {
    index: Number,
    self: Object
  },

  data() {
    return {
      isDragging: false,
      isEditingTitle: false,
      isGenerating: false
    }
  },

  computed: {
    ...mapState('Buckets', ['outputFolder']),
    ...mapGetters('Buckets', ['untitledBuckets']),
    
    untitledIndex() {
      return this.untitledBuckets.findIndex(b => b.id === this.self.id)
    }
  },

  methods: {
    ...mapMutations('Buckets', ['pushImages', 'removeImage', 'setBucketName']),
    ...mapActions('Buckets', ['generateSprite', 'chooseOutputFolder']),

    onDragover(e) {
      this.isDragging = true
    },

    onDragleave(e) {
      this.isDragging = false
    },

    onDrop(e) {
      console.log('Bucket.onDrop');
      this.isDragging = false
      this.pushImages({
        id: this.self.id,
        images: [...e.dataTransfer.files]
      })
    },

    bucketTitleFocus() {
      this.$refs.bucketTitle.select()
    },

    bucketEmptyImageBeforeEnter(el) {
      TweenMax.set(el, { scale: 0.01, opacity: 0 })
    },

    bucketEmptyImageEnter(el) {
      TweenMax.to(el, 1, { scale: 1, opacity: 1, delay: 0.15, ease: Elastic.easeOut.config(0.5, 0.3) })
    },

    updateBucketName(name) {
      this.setBucketName({
        bucket: this.self,
        name: name
      })
    },

    beforeGenerateSprite() {
      if (this.self.isGenerating) {
        return
      }

      if (!this.outputFolder) {
        this.chooseOutputFolder()
          .then(() => { this.generateSprite(this.self) })
        return
      }

      this.generateSprite(this.self)
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.$refs.bucketTitle.focus()
    })
  }
}
</script>

<style lang="scss">
@import '~tachyons-sass/tachyons.scss';
@import '~@/scss/variables';
@import '~@/scss/util';

.bucket {
  @extend .ma1;
  display: flex;
  flex-flow: column;
  flex: 0 0 auto;
  width: 240px;
  border: 1px solid rgba(#fff, 0.1);
  background-color: rgba(#fff, 0.1);

  &.isDragging {
    border-color: rgba(#fff, 0.2);
    background-color: rgba(#fff, 0.2);
  }
}

.bucket-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bucket-title-input {
  @extend .sans-serif;
  border: 1px solid transparent;
  background-color: transparent;
  font-size: 1rem;
  font-weight: 700;
  color: rgba(#fff, 0.85);
  cursor: pointer;

  &:hover {
    background-color: rgba(#000, 0.3);
  }

  &:focus {
    outline: none;
    border: 1px solid rgba(#fff, 0.3);
    background-color: rgba(#000, 0.2);
    cursor: auto;
  }

  &::placeholder {
    color: rgba(#fff, 0.4);
  }
}

.bucket-delete {
  opacity: 0.8;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
}

.bucket-body {
  flex: 1;
  position: relative;
}

.bucket-empty {
  display: flex;
  flex-flow: column;
  // justify-content: center;
  align-items: center;
}

.bucket-empty-image {
  @extend .mv3;
  width: 50%;
  padding-bottom: 50%*0.75;
  background: linear-gradient(135deg, rgba(#fff, 0.3), rgba(#fff, 0.4));
  -webkit-mask-image: url('~@/assets/image.svg');
  -webkit-mask-repeat: no-repeat;
}

.bucket-image-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover .bucket-image-remove {
    opacity: 0.4;

    &:hover { opacity: 1 }
  }
}

.bucket-image-remove {
  display: inline-block;
  font-size: 18px;
  opacity: 0;
  transform: translateY(2px);
  transition: 0.15s $easeOutCubic;
  cursor: pointer;
}

.bucket-controls {
  @extend .ph2, .pv3;
  position: absolute;
  bottom: 0; left: 0; right: 0;
  display: flex;
  justify-content: center;
}

.bucket-status {
  display: flex;
  align-items: center;
}

</style>