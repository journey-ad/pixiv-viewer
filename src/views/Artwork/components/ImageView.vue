<template>
  <div class="image-view" :class="{shrink:isShrink}" @click="showFull" ref="view">
    <div class="image-box" v-for="(url, index) in artwork.images" :key="index">
      <!-- :style="{height: `${(375/artwork.width*artwork.height).toFixed(2)}px`}" -->
      <img
        v-if="lazy"
        v-lazy="url.l"
        :alt="`${artwork.title} - Page ${index+1}`"
        class="image"
        :class="{censored: isCensored(artwork)}"
        @click.stop="view(index, isCensored(artwork))"
      />
      <img
        v-else
        :src="url.l"
        :alt="`${artwork.title} - Page ${index+1}`"
        class="image"
        :class="{censored: isCensored(artwork)}"
        @click.stop="view(index, isCensored(artwork))"
      />
    </div>
    <Icon v-if="isShrink" class="dropdown" name="dropdown" scale="4"></Icon>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { ImagePreview } from "vant";
export default {
  watch: {
    artwork(val) {
      if (val.images && val.images.length > 0) {
        this.init();
      }
    }
  },
  props: {
    artwork: {
      type: Object,
      required: true
    },
    lazy: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    original() {
      return this.artwork.images.map(url => url.o);
    },
    ...mapState(["$swiper"]),
    ...mapGetters(["isCensored"])
  },
  data() {
    return {
      isShrink: false
    };
  },
  methods: {
    view(index, censored) {
      if (censored) {
        this.$toast({
          message: "根据当前设置，此内容将不予显示",
          icon: require("@/svg/ban-view.svg")
        });
      } else {
        if (window.plus) {
          var x = index;
          if (Object.keys(this.original).length == 1) {
            x = 0;
          }
          var obj = [];
          for (var b in this.original) {
            obj.push(this.original[b]);
          }
          plus.nativeUI.previewImage(obj, {
            current: x,
            onLongPress: function(e) {
              // 预览界面长按显示ActionSheet
              var bts = [{ title: "保存至相册" }];
              plus.nativeUI.actionSheet(
                { title: "选择操作", cancel: "取消", buttons: bts },
                function(t) {
                  if (t.index == 1) {
                    //e.url e.path
                    plus.gallery.save(
                      e.url,
                      function() {
                        plus.nativeUI.toast("保存成功");
                      },
                      function() {
                        plus.nativeUI.toast("保存失败");
                      }
                    );
                  }
                }
              );
            }
          });
        } else {
          ImagePreview({
            className: "image-preview",
            images: this.original,
            startPosition: index,
            closeOnPopstate: true
          });
        }
      }
    },
    showFull() {
      if (this.isShrink) this.isShrink = false;
    },
    init() {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.artwork.images && this.artwork.images.length >= 3) {
            this.isShrink = true;
          } else {
            this.isShrink = false;
          }
        }, 0);
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="stylus" scoped>
.image-view {
  position: relative;
  min-height: 600px;
  background-color: #fafafa;

  &.shrink {
    max-height: 1000px;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: linear-gradient(to top, rgb(255, 255, 255), transparent);
    }

    .dropdown {
      position: absolute;
      bottom: 26px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1;
      filter: drop-shadow(1px 4px 4px rgba(0, 0, 0, 0.5));
      animation: ani-dropdown 2s ease-in-out infinite;
    }

    @keyframes ani-dropdown {
      0%, 100% {
        transform: translate(-50%, 0);
      }

      50% {
        transform: translate(-50%, 6px);
      }
    }
  }

  .image-box {
    position: relative;
    background: #fafafa;
    min-height: 600px;
    max-height: 1000px;

    .image {
      width: 100%;
      height: 100%;
      min-height: 600px;
      max-height: 1000px;
      object-fit: cover;

      &[lazy='loading'] {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 120px;
        height: 120px;
        min-height: auto;
      }
    }
  }
}
</style>